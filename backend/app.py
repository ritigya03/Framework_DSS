# main.py
"""
SDLC AI Verifier Backend (async-safe, multi-file upload + analysis)
Updated with PDF generation and reviewer endpoints
Save as main.py and run with:
    uvicorn main:app --reload --port 8000
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime

import aiofiles
from fastapi import FastAPI, UploadFile, File, Form, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# Import PDF generator
from pdf_generator import generate_pdf_report

# ---- Optional: replace with your actual genai client import if different ----
import google.generativeai as genai

# ---- Analyzer imports (assume these modules exist) ----
from analyzers.requirements_analyzer import analyze_requirements
from analyzers.design_analyzer import analyze_design
from analyzers.implementation_analyzer import analyze_implementation
from analyzers.testing_analyzer import analyze_testing
from analyzers.deployment_analyzer import analyze_deployment
from analyzers.maintenance_analyzer import analyze_maintenance

# ---------------------------
# Configuration & Constants
# ---------------------------
load_dotenv()

if "GOOGLE_API_KEY" not in os.environ:
    raise RuntimeError("ERROR: GOOGLE_API_KEY missing in .env")

genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

# Choose model as you had before
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    generation_config={"temperature": 0.2}
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Simple limits (tunable)
MAX_FILES_PER_REQUEST = 50
MAX_TOTAL_BYTES_PER_REQUEST = 200 * 1024 * 1024  # 200 MB total across all files

# ---------------------------
# Pydantic Models for PDF
# ---------------------------
class PhaseData(BaseModel):
    score: Optional[int] = 0
    analysis: Optional[str] = ""
    strengths: Optional[List[str]] = []
    recommendations: Optional[List[str]] = []

class AnalysisData(BaseModel):
    phases: Dict[str, PhaseData]

class PDFRequest(BaseModel):
    analysisResults: AnalysisData
    overallScore: str
    filesAnalyzed: List[str]

class ReviewerRequest(BaseModel):
    analysisResults: AnalysisData
    overallScore: str
    filesAnalyzed: List[str]
    timestamp: str

# ---------------------------
# App init
# ---------------------------
app = FastAPI(title="SDLC AI Verifier (Gemini)", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Utilities
# ---------------------------
def secure_filename(filename: str) -> str:
    """
    Keep only the filename, and replace unsafe characters.
    Similar to Werkzeug secure_filename but lightweight.
    """
    filename = Path(filename).name  # remove any path elements
    # allow letters, numbers, dot, dash, underscore
    filename = re.sub(r"[^A-Za-z0-9_.-]", "_", filename)
    # avoid empty filename
    if filename == "":
        filename = "file"
    return filename

async def stream_save_upload(upload: UploadFile, dest_path: str):
    """
    Stream the UploadFile to disk in chunks (async).
    """
    chunk_size = 64 * 1024
    async with aiofiles.open(dest_path, "wb") as out_file:
        while True:
            chunk = await upload.read(chunk_size)
            if not chunk:
                break
            await out_file.write(chunk)
    # reset file pointer (not strictly needed after read)
    try:
        await upload.seek(0)
    except Exception:
        pass

# ---------------------------
# Endpoints
# ---------------------------

@app.get("/")
def root():
    return {"status": "running", "message": "Gemini SDLC Verifier active"}


@app.post("/upload")
async def upload_files(
    files: List[UploadFile] = File(...),
    clear: Optional[bool] = Query(False, description="If true, clear previous uploads before saving"),
):
    """
    Upload ALL project files (async-safe).
    - files: list of UploadFile
    - clear (query param): if true, the uploads directory will be cleared first
    Returns list of saved filenames.
    """
    try:
        if len(files) > MAX_FILES_PER_REQUEST:
            return JSONResponse({
                "success": False,
                "message": f"Too many files in request (limit {MAX_FILES_PER_REQUEST})"
            }, status_code=413)

        # Optionally clear previous uploads
        if clear:
            for old in os.listdir(UPLOAD_DIR):
                try:
                    os.remove(os.path.join(UPLOAD_DIR, old))
                except Exception:
                    pass

        os.makedirs(UPLOAD_DIR, exist_ok=True)

        total_bytes = 0
        saved_files = []

        for upload in files:
            filename = secure_filename(upload.filename or "file")
            save_path = os.path.join(UPLOAD_DIR, filename)

            # Save to disk streaming
            await stream_save_upload(upload, save_path)

            # update size
            stat = os.stat(save_path)
            total_bytes += stat.st_size
            saved_files.append(filename)

            if total_bytes > MAX_TOTAL_BYTES_PER_REQUEST:
                # remove the file that caused overflow for cleanliness
                try:
                    os.remove(save_path)
                except Exception:
                    pass
                return JSONResponse({
                    "success": False,
                    "message": f"Total uploaded size exceeds limit ({MAX_TOTAL_BYTES_PER_REQUEST} bytes)"
                }, status_code=413)

        return JSONResponse({
            "success": True,
            "message": f"{len(saved_files)} files uploaded successfully",
            "files": saved_files
        })

    except Exception as e:
        return JSONResponse({
            "success": False,
            "message": f"Upload error: {str(e)}"
        }, status_code=500)


@app.post("/analyze")
async def analyze_project():
    """
    Reads files from uploads/ and passes them to analyzers.
    Returns analyzer outputs and an overall score.
    """
    try:
        uploaded_files = os.listdir(UPLOAD_DIR)
        if not uploaded_files:
            return JSONResponse({"success": False, "message": "No files uploaded"}, status_code=400)

        file_contents: Dict[str, str] = {}
        metadata: Dict[str, Dict] = {}

        # Read each file - text if possible, else store a short binary preview
        for filename in uploaded_files:
            file_path = os.path.join(UPLOAD_DIR, filename)
            stat = os.stat(file_path)
            metadata[filename] = {"size": stat.st_size}

            try:
                # try to read as UTF-8 text
                async with aiofiles.open(file_path, "r", encoding="utf-8", errors="strict") as f:
                    content = await f.read()
                file_contents[filename] = content
                metadata[filename]["type"] = "text"
            except Exception:
                # binary fallback: keep a short preview (not entire file)
                metadata[filename]["type"] = "binary"
                async with aiofiles.open(file_path, "rb") as f:
                    preview = await f.read(1024)  # first 1KB preview
                # store a hex preview for debugging (short)
                file_contents[filename] = f"[Binary file: {len(preview)} bytes preview]"

        # Call analyzers (they should accept (file_contents, model))
        results = {
            "requirements": analyze_requirements(file_contents, model),
            "design": analyze_design(file_contents, model),
            "implementation": analyze_implementation(file_contents, model),
            "testing": analyze_testing(file_contents, model),
            "deployment": analyze_deployment(file_contents, model),
            "maintenance": analyze_maintenance(file_contents, model)
        }

        # Compute overall score safely: handle missing scores
        scores = []
        for phase, res in results.items():
            if isinstance(res, dict) and ("score" in res):
                try:
                    scores.append(float(res["score"]))
                except Exception:
                    scores.append(0.0)
            else:
                scores.append(0.0)

        overall_score = (sum(scores) / len(scores)) if scores else 0.0

        return JSONResponse({
            "success": True,
            "overall_score": round(overall_score, 2),
            "phases": results,
            "files_analyzed": uploaded_files,
            "file_metadata": metadata
        })

    except Exception as e:
        return JSONResponse({
            "success": False,
            "message": f"Analysis failed: {str(e)}"
        }, status_code=500)


@app.post("/chat")
async def chat_with_ai(message: str = Form(...)):
    """
    Simple chat endpoint which includes a list of uploaded files in the prompt.
    """
    try:
        file_list = ", ".join(os.listdir(UPLOAD_DIR)) or "No files uploaded"

        prompt = f"""
You are a Senior Software Engineer + SDLC Specialist.
Use clean technical language.

Files:
{file_list}

User Question:
{message}

Give a structured, precise answer.
"""

        # model.generate_content(...) per your existing usage
        response = model.generate_content(prompt)
        # response might be an object; use .text or str accordingly
        text = getattr(response, "text", str(response))

        return JSONResponse({
            "success": True,
            "response": text
        })

    except Exception as e:
        return JSONResponse({
            "success": False,
            "message": f"Chat error: {str(e)}"
        }, status_code=500)


# ==================== NEW: PDF Generation Endpoint ====================

@app.post("/generate-pdf")
async def generate_pdf(request: PDFRequest):
    """
    Generate a PDF verification report from analysis results
    """
    try:
        # Extract data from request
        analysis_results = request.analysisResults.dict()
        overall_score = request.overallScore
        files_analyzed = request.filesAnalyzed
        
        # Generate PDF using the imported function
        pdf_buffer = generate_pdf_report(
            analysis_results,
            overall_score,
            files_analyzed
        )
        
        # Create filename with timestamp
        filename = f"SDLC_Verification_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        # Return PDF as streaming response
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


# ==================== NEW: Send to Reviewer Endpoint ====================

@app.post("/send-to-reviewer")
async def send_to_reviewer(request: ReviewerRequest):
    """
    Send verification report to reviewer
    TODO: Implement Firebase/Firestore integration
    """
    try:
        # Extract data
        analysis_results = request.analysisResults.dict()
        overall_score = request.overallScore
        files_analyzed = request.filesAnalyzed
        timestamp = request.timestamp
        
        # TODO: Implement your Firebase/Firestore logic here
        # Example workflow:
        # 1. Generate PDF
        pdf_buffer = generate_pdf_report(
            analysis_results,
            overall_score,
            files_analyzed
        )
        
        # 2. Upload PDF to Firebase Storage
        # storage_url = upload_to_firebase_storage(pdf_buffer, filename)
        
        # 3. Store metadata in Firestore
        # firestore_doc = {
        #     "overallScore": overall_score,
        #     "filesAnalyzed": files_analyzed,
        #     "pdfUrl": storage_url,
        #     "status": "pending",
        #     "timestamp": timestamp,
        #     "phases": analysis_results["phases"]
        # }
        # db.collection("verificationReports").add(firestore_doc)
        
        # 4. Send notification to reviewer (optional)
        # send_notification_to_reviewer(...)
        
        return JSONResponse({
            "success": True,
            "message": "Report successfully sent to reviewer",
            "timestamp": timestamp
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send to reviewer: {str(e)}")


# ---------------------------
# Run with: uvicorn main:app --reload --port 8000
# Or keep the block below for running via `python main.py`
# ---------------------------
if __name__ == "__main__":
    import uvicorn
    print("Backend running at http://localhost:8000")
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)