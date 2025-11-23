def analyze_maintenance(file_contents, model):
    """
    Analyze the Maintenance phase of SDLC using Google Gemini.
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
You are a Senior System Administrator performing Maintenance Phase Analysis.

{context}

OUTPUT FORMAT (use this exact structure):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 MAINTENANCE ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. MAINTAINABILITY SCORE: [X]/100

   ✅ STRONG AREAS:
   • [maintainability aspect]
   • [maintainability aspect]
   
   ❌ WEAK AREAS:
   • [maintainability aspect]
   • [maintainability aspect]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. MAINTENANCE ISSUES

   🔴 CRITICAL:
   • [issue] - [long-term impact]
   • [issue] - [long-term impact]
   
   🟡 MODERATE:
   • [issue]
   • [issue]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. DOCUMENTATION & SUPPORT

   ✓ [documentation element present]
   ✓ [documentation element present]
   
   ✗ [missing documentation]
   ✗ [missing documentation]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. LONG-TERM VIABILITY

   • Code Maintainability: [✓/✗] [assessment]
   • Update/Patch Strategy: [✓/✗] [assessment]
   • Model Retraining Plan: [✓/✗] [assessment]
   • Knowledge Transfer: [✓/✗] [assessment]

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
- Focus on long-term sustainability
- Emphasize documentation and knowledge transfer
- Consider model drift and retraining needs
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