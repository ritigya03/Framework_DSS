def analyze_implementation(file_contents, model):
    """
    Analyze the Implementation phase of SDLC using Google Gemini.
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

    # Strict structured format required from Gemini
    prompt = f"""
You are a Senior Software Architect and SDLC Specialist.
Analyze ONLY the IMPLEMENTATION PHASE of this Heart Disease Prediction AI project.

{context}

You MUST follow this EXACT structure:

===============================================================
IMPLEMENTATION ANALYSIS REPORT
===============================================================

1. REQUIREMENTS COVERAGE
   ✓ Implemented requirement statements
   ✗ Missing requirement statements
   Coverage: X/Y (Z%)

2. CODE QUALITY: [score]/100
   - Code architecture evaluation
   - Function/class quality  
   - Coding standards  
   - Naming conventions  
   - Code smells  
   - Redundant logic  

3. BEST PRACTICES
   - Type hints  
   - Docstrings  
   - Exception handling  
   - Testing presence  
   - Logging practices  

4. DESIGN ADHERENCE
   - Does code follow the design documents?  
   - Violations or missing logic  

5. DATASET VALIDATION
   - Input validation  
   - Checking missing columns  
   - Error handling  

6. MODEL-DATASET CONSISTENCY
   - Preprocessing alignment  
   - Feature engineering  
   - Data-model mismatch issues  

---------------------------------------------------------------
CRITICAL ISSUES
---------------------------------------------------------------
→ List at least 3 critical implementation issues

---------------------------------------------------------------
RECOMMENDATIONS
---------------------------------------------------------------
→ At least 5 detailed actionable recommendations

IMPORTANT:
YOU MUST include score in EXACT format:
CODE QUALITY: XX/100
"""

    try:
        response = model.generate_content(prompt)
        analysis_text = response.text

        # Default score = 0 (no fallback guessed value)
        score = 0

        # Extract numerical score if present
        try:
            for line in analysis_text.split("\n"):
                if "CODE QUALITY:" in line:
                    # Expected pattern: "CODE QUALITY: 78/100"
                    number = line.split(":")[1].split("/")[0].strip()
                    score = int(number)
                    break
        except:
            score = 0  # Keep as 0 if extraction fails

        return {
            "phase": "Implementation",
            "score": score,
            "analysis": analysis_text,
            "status": "completed"
        }

    except Exception as e:
        return {
            "phase": "Implementation",
            "score": 0,
            "analysis": f"Error during analysis: {str(e)}",
            "status": "error"
        }
