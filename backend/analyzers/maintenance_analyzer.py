def analyze_maintenance(file_contents, model):
    """
    Analyze the Maintenance phase of SDLC using Google Gemini.
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

    # Strict prompt with required format
    prompt = f"""
You are a Senior SDLC Auditor.
Analyze ONLY the MAINTENANCE PHASE of this Heart Disease Prediction AI project.

{context}

You MUST produce output in this EXACT structure:

===============================================================
MAINTENANCE ANALYSIS REPORT
===============================================================

1. CODE MAINTAINABILITY: [score]/100
   - Modularity  
   - Code clarity  
   - Redundancy  
   - Refactoring needs  

2. DOCUMENTATION
   - Inline comments  
   - Developer documentation  
   - Maintenance instructions  
   - API documentation  

3. MONITORING & LOGGING
   - Logging practices  
   - Runtime monitoring  
   - Error tracking  

4. UPDATE & MODEL RETRAINING MECHANISMS
   - Retraining pipeline  
   - Versioning  
   - Dependency updates  
   - Automation  

5. FUTURE IMPROVEMENTS
   - Planned enhancements  
   - Unimplemented improvements  
   - SRS alignment  

---------------------------------------------------------------
RECOMMENDATIONS
---------------------------------------------------------------
→ At least 5 strong actionable maintenance recommendations

IMPORTANT:
ALWAYS include a numeric score using EXACT format:
CODE MAINTAINABILITY: XX/100
"""

    try:
        response = model.generate_content(prompt)
        analysis_text = response.text

        # Default score = 0 (NO FALLBACK)
        score = 0

        # Extract score from strict expected pattern
        try:
            for line in analysis_text.split("\n"):
                if "CODE MAINTAINABILITY:" in line:
                    # Expected: "CODE MAINTAINABILITY: 72/100"
                    number = line.split(":")[1].split("/")[0].strip()
                    score = int(number)
                    break
        except:
            score = 0  # Keep 0 if extraction fails

        return {
            "phase": "Maintenance",
            "score": score,
            "analysis": analysis_text,
            "status": "completed"
        }

    except Exception as e:
        return {
            "phase": "Maintenance",
            "score": 0,
            "analysis": f"Error during analysis: {str(e)}",
            "status": "error"
        }
