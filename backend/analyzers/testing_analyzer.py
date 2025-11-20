def analyze_testing(file_contents, model):
    """
    Analyze the Testing phase of SDLC using Google Gemini.
    NO FALLBACK SCORE — returns 0 if score not found in expected format.
    """

    # Build context with full safe content
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

    # Strict prompt requiring structured output
    prompt = f"""
You are a Senior SDLC Auditor analyzing ONLY the TESTING PHASE
of a Heart Disease Prediction AI project.

{context}

You MUST produce output using this EXACT structure:

===============================================================
TESTING ANALYSIS REPORT
===============================================================

1. TEST ARTIFACTS: [score]/100
   - Check presence of test files  
   - Check unit tests  
   - Check integration tests  
   - Evaluate test coverage  

2. MODEL VALIDATION
   - Metrics evaluated  
   - Sufficiency of metrics  
   - Cross-validation usage  

3. REQUIRED TESTS (MISSING)
   - Missing unit tests  
   - Missing integration tests  
   - Missing system tests  

4. DATA TESTING
   - Data validation  
   - Edge case validation  
   - Null/missing value tests  

5. MODEL PERFORMANCE TESTING
   - Overfitting/underfitting  
   - Robustness tests  
   - Stress testing  

6. EDGE CASES NOT TESTED
   - List untested critical cases  

---------------------------------------------------------------
RECOMMENDATIONS
---------------------------------------------------------------
→ Provide at least 5 detailed actionable recommendations.

IMPORTANT:
ALWAYS include the score in this EXACT format:
TEST ARTIFACTS: XX/100
"""

    try:
        response = model.generate_content(prompt)
        analysis_text = response.text

        # Default score = 0 unless correctly extracted
        score = 0

        try:
            for line in analysis_text.split("\n"):
                if "TEST ARTIFACTS:" in line:
                    # Expected: "TEST ARTIFACTS: 85/100"
                    number = line.split(":")[1].split("/")[0].strip()
                    score = int(number)
                    break
        except:
            score = 0  # keep 0 if extraction fails

        return {
            "phase": "Testing",
            "score": score,
            "analysis": analysis_text,
            "status": "completed"
        }

    except Exception as e:
        return {
            "phase": "Testing",
            "score": 0,
            "analysis": f"Error during analysis: {str(e)}",
            "status": "error"
        }
