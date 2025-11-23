def analyze_implementation(file_contents, model):
    """
    Analyze the Implementation phase of SDLC using Google Gemini.
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
You are a Senior Software Engineer performing Implementation Phase Analysis.

{context}

OUTPUT FORMAT (use this exact structure):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ IMPLEMENTATION ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. CODE QUALITY SCORE: [X]/100

   
   ✅ STRENGTHS:
   • [strength]
   • [strength]
   
   
   ❌ WEAKNESSES:
   • [weakness]
   • [weakness]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. CODE ISSUES

   
   🔴 CRITICAL:
   • [issue] - [impact on production]
   • [issue] - [impact on production]
   
   
   🟡 MODERATE:
   • [issue]
   • [issue]
   
   
   🟢 MINOR:
   • [issue]
   • [issue]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. BEST PRACTICES COMPLIANCE

   
   ✓ [compliant practice]
   ✓ [compliant practice]
   
   
   ✗ [non-compliant practice]
   ✗ [non-compliant practice]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. TECHNICAL DEBT ASSESSMENT

   • Error Handling: [✓/✗] [assessment]
   • Code Documentation: [✓/✗] [assessment]
   • Resource Management: [✓/✗] [assessment]
   • Security Practices: [✓/✗] [assessment]

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
- Be specific with code examples where applicable
- Focus on actionable improvements
- Avoid generic advice
- IMPORTANT: Add a blank line before every emoji (✅, ❌, 🔴, 🟡, 🟢, ✓, ✗, 💡)
"""
    
    try:
        response = model.generate_content(prompt)
        analysis_text = response.text
        
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
