def analyze_deployment(file_contents, model):
    """
    Analyze the Deployment phase of SDLC using Google Gemini.
    NO FALLBACK SCORE — returns 0 if score not found in expected format.
    """

    # Build detailed file context
    context = "PROJECT FILES (FULL CONTENT INCLUDED BELOW):\n\n"

    for filename, content in file_contents.items():
        context += (
            "===========================================\n"
            f"FILE NAME: {filename}\n"
            "===========================================\n"
        )

        if isinstance(content, str):
            if len(content) <= 15000:
                context += content + "\n\n"
            else:
                context += content[:15000] + "\n...[TRUNCATED]...\n\n"
        else:
            context += "[Binary / Non-text file]\n\n"

    # Strict output format prompt
    prompt = f"""
You are a Senior SDLC Auditor analyzing ONLY the DEPLOYMENT PHASE
of a Heart Disease Prediction AI project.

{context}

You MUST produce output using this EXACT structure:

===============================================================
DEPLOYMENT ANALYSIS REPORT
===============================================================

1. DEPLOYMENT ARTIFACTS: [score]/100
   - Model files  
   - requirements.txt / environment.yaml  
   - Dockerfile / container setup  
   - Deployment scripts  
   - Folder structure readiness  

2. INFERENCE READINESS
   - Prediction script  
   - API endpoints  
   - Input validation  
   - Inference latency considerations  

3. PRODUCTION READINESS
   - Error handling  
   - Logging  
   - Monitoring  
   - Exception tracking  
   - Security considerations  

4. DOCUMENTATION
   - Deployment documentation  
   - API docs / Swagger  
   - Setup instructions  
   - Readability of deployment steps  

5. SCALABILITY
   - Containerization  
   - Load balancing  
   - Cloud readiness  
   - Horizontal/vertical scaling approach  

---------------------------------------------------------------
RECOMMENDATIONS
---------------------------------------------------------------
→ Provide at least 5 strong actionable deployment recommendations.

IMPORTANT:
ALWAYS include the numeric score using EXACT format:
DEPLOYMENT ARTIFACTS: XX/100
"""

    try:
        response = model.generate_content(prompt)
        analysis_text = response.text

        # Default score = 0 (NO FALLBACK)
        score = 0

        # Extract score from strict expected pattern
        try:
            for line in analysis_text.split("\n"):
                if "DEPLOYMENT ARTIFACTS:" in line:
                    # Expected: "DEPLOYMENT ARTIFACTS: 78/100"
                    number = line.split(":")[1].split("/")[0].strip()
                    score = int(number)
                    break
        except:
            score = 0  # keep 0 if extraction fails

        return {
            "phase": "Deployment",
            "score": score,
            "analysis": analysis_text,
            "status": "completed"
        }

    except Exception as e:
        return {
            "phase": "Deployment",
            "score": 0,
            "analysis": f"Error during analysis: {str(e)}",
            "status": "error"
        }
