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
You are a Senior SDLC Specialist performing Requirements Analysis.

{context}

OUTPUT FORMAT (use this exact structure):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 REQUIREMENTS ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. COMPLETENESS SCORE: [X]/100

   
   ✅ PRESENT:
   • [item]
   • [item]
   
   
   ❌ MISSING:
   • [item]
   • [item]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. QUALITY ISSUES

   
   🔴 CRITICAL:
   • [issue] - [why it matters]
   • [issue] - [why it matters]
   
   
   🟡 MODERATE:
   • [issue]
   • [issue]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. DATASET ALIGNMENT

   
   ✓ [aligned item]
   ✓ [aligned item]
   
   
   ✗ [misalignment]
   ✗ [misalignment]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. AI REQUIREMENTS CHECK

   • Bias/Fairness: [✓/✗] [one-line reason if missing]
   • Explainability: [✓/✗] [one-line reason if missing]
   • Performance Metrics: [✓/✗] [one-line reason if missing]
   • Monitoring Plan: [✓/✗] [one-line reason if missing]

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
- No bold text inside bullets (use it only for section headers if needed)
- Be specific, not generic
- Focus on actionable insights
- Avoid repetition across sections
- IMPORTANT: Add a blank line before every emoji (✅, ❌, 🔴, 🟡, ✓, ✗, 💡)
"""
    
    try:
        response = model.generate_content(prompt)
        analysis_text = response.text
        
        # Extract score automatically
        score = 80  # default fallback
        try:
            # Look for "SCORE: 88/100" pattern
            for line in analysis_text.splitlines():
                if "SCORE:" in line and "/100" in line:
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
