def analyze_design(file_contents, model):
    """
    Analyze the Design phase of SDLC using Google Gemini.
    NO FALLBACK SCORE — returns 0 if score not found.
    """

    # Build clean context with full text
    context = "PROJECT FILES (FULL CONTENT INCLUDED):\n\n"

    for filename, content in file_contents.items():
        context += (
            "===========================================\n"
            f"FILE NAME: {filename}\n"
            "===========================================\n"
        )

        if isinstance(content, str):
            if len(content) < 15000:
                context += content + "\n\n"
            else:
                context += content[:15000] + "\n...[TRUNCATED]...\n\n"
        else:
            context += "[Non-text / Binary file]\n\n"

    # Strict structured format prompt
    prompt = f"""
You are a Senior SDLC Architect analyzing the DESIGN PHASE of a Heart Disease Prediction AI project.

{context}

Follow this EXACT structure and formatting:

===============================================================
DESIGN ANALYSIS REPORT
===============================================================

1. ARCHITECTURE DESIGN: [score]/100
   ✓ Architecture evaluation
   ✓ Layer separation  
   ✓ Modularity analysis  
   ✗ Missing design elements  

2. MODEL DESIGN
   - Algorithm selection  
   - Preprocessing pipeline  
   - Feature engineering  
   - Hyperparameter logic  

3. DATA PIPELINE DESIGN
   - Data flow analysis  
   - Transformation & encoding  
   - Split strategy  

4. MODEL PERSISTENCE & VERSIONING DESIGN
   - Model saving  
   - Versioning  
   - Reproducibility  

5. MISSING DESIGN ELEMENTS
   - List all missing design artifacts  

---------------------------------------------------------------
RECOMMENDATIONS
---------------------------------------------------------------
→ Provide at least 5 actionable recommendations.

IMPORTANT:
Always include the numeric score in this EXACT format:
ARCHITECTURE DESIGN: XX/100
"""

    try:
        response = model.generate_content(prompt)
        text = response.text

        # Extract score — NO FALLBACK
        score = 0

        try:
            for line in text.split("\n"):
                if "ARCHITECTURE DESIGN:" in line:
                    # Example: "ARCHITECTURE DESIGN: 78/100"
                    s = line.split(":")[1].split("/")[0].strip()
                    score = int(s)
                    break
        except:
            score = 0  # Score is missing or invalid — return 0

        return {
            "phase": "Design",
            "score": score,
            "analysis": text,
            "status": "completed"
        }

    except Exception as e:
        return {
            "phase": "Design",
            "score": 0,
            "analysis": f"Error during analysis: {str(e)}",
            "status": "error"
        }
