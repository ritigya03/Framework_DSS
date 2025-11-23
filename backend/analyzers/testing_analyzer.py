def analyze_testing(file_contents, model):
    """
    Analyze the Testing phase of SDLC using Google Gemini.
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
You are a Senior QA Engineer performing Testing Phase Analysis.

{context}

OUTPUT FORMAT (use this exact structure):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TESTING ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. TEST COVERAGE SCORE: [X]/100

   ✅ TESTED:
   • [test area]
   • [test area]
   
   ❌ UNTESTED:
   • [test area]
   • [test area]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. TEST QUALITY ISSUES

   🔴 CRITICAL GAPS:
   • [missing test] - [why critical]
   • [missing test] - [why critical]
   
   🟡 MODERATE GAPS:
   • [test improvement needed]
   • [test improvement needed]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. TEST TYPES EVALUATION

   ✓ [test type present and quality]
   ✓ [test type present and quality]
   
   ✗ [missing test type]
   ✗ [missing test type]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. ML-SPECIFIC TESTING

   • Model Validation: [✓/✗] [assessment]
   • Data Quality Tests: [✓/✗] [assessment]
   • Performance Tests: [✓/✗] [assessment]
   • Edge Case Tests: [✓/✗] [assessment]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 TOP RECOMMENDATIONS

1. [Action verb] + [what] + [why/impact]
2. [Action verb] + [what] + [why/impact]
3. [Action verb] + [what] + [why/impact]
4. [Action verb] + [what] + [why/impact]
5. [Action verb] + [what] + [why/impact]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RULES:
- Keep each bullet point under 15 words
- No bold text inside bullets
- Be specific about test scenarios
- Focus on critical gaps
- Prioritize ML model testing
"""
    
    try:
        response = model.generate_content(prompt)
        analysis_text = response.text
        
        # Add newline before emojis if not already present
        import re
        emojis = ['✅', '❌', '🔴', '🟡', '🟢', '✓', '✗', '💡']
        for emoji in emojis:
            analysis_text = re.sub(f'([^\n])({re.escape(emoji)})', r'\1\n\2', analysis_text)
        
        # Extract score automatically
        score = 80  # default fallback
        try:
            for line in analysis_text.splitlines():
                if "SCORE:" in line and "/100" in line:
                    val = line.split(":")[1].split("/")[0].strip()
                    score = int(val)
                    break
        except:
            pass
        
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
