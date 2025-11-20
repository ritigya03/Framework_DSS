def analyze_requirements(file_contents, model):
    """
    Analyze the Requirements phase of SDLC using Google Gemini.
    Processes ALL uploaded files with clean formatting and structured output.
    """

    # Build clean, full context with all files included
    context = "PROJECT FILES (FULL CONTENT INCLUDED):\n\n"

    for filename, content in file_contents.items():
        context += (
            "===========================================\n"
            f"FILE NAME: {filename}\n"
            "===========================================\n"
        )

        # Include full content up to 15k chars (safe for Gemini)
        if isinstance(content, str):
            if len(content) < 15000:
                context += content + "\n\n"
            else:
                context += content[:15000] + "\n...[TRUNCATED]...\n\n"
        else:
            context += "[Non-text / Binary file]\n\n"

    # Gemini prompt
    prompt = f"""
You are an industry-level Senior SDLC Specialist evaluating a software project.

{context}

Your task: Perform a **REQUIREMENTS ANALYSIS** following the SDLC guidelines.

Provide output in this EXACT structure:

===============================================================
REQUIREMENTS ANALYSIS REPORT
===============================================================

1. DOCUMENT COMPLETENESS: [score]/100
   ✓ Present:
     - (List present requirement elements)
   ✗ Missing:
     - (List missing or unclear requirements)

2. REQUIREMENTS QUALITY
   - Evaluate clarity, specificity, ambiguity
   - Point out contradictions, vague terms, missing acceptance criteria
   - Identify functional + non-functional requirement quality

3. DATASET–REQUIREMENT ALIGNMENT
   - Verify if dataset supports defined requirements
   - Check required features/columns
   - Highlight any mismatch between expected inputs & actual dataset

4. AI-SPECIFIC REQUIREMENTS
   - Bias testing requirements
   - Interpretability/explainability requirements
   - Performance & safety constraints
   - Model monitoring requirements

---------------------------------------------------------------
RECOMMENDATIONS
---------------------------------------------------------------
→ Provide at least 5 high-value actionable improvements

Return **detailed analysis** with correct formatting.
"""

    try:
        response = model.generate_content(prompt)
        analysis_text = response.text

        # Extract score automatically
        score = 80  # default fallback

        try:
            # Look for "COMPLETENESS: 88/100" pattern
            for line in analysis_text.splitlines():
                if "COMPLETENESS:" in line:
                    val = line.split(":")[1].split("/")[0].strip()
                    score = int(val)
                    break
        except:
            pass

        return {
            "phase": "Requirements",
            "score": score,
            "analysis": analysis_text,
            "status": "completed"
        }

    except Exception as e:
        return {
            "phase": "Requirements",
            "score": 0,
            "analysis": f"Error during analysis: {str(e)}",
            "status": "error"
        }
