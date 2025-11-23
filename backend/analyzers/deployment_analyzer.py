def analyze_deployment(file_contents, model):
    """
    Analyze the Deployment phase of SDLC using Google Gemini.
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
You are a Senior DevOps Engineer performing Deployment Phase Analysis.

{context}

OUTPUT FORMAT (use this exact structure):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 DEPLOYMENT ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. DEPLOYMENT READINESS SCORE: [X]/100

   
   ✅ READY:
   • [deployment aspect]
   • [deployment aspect]
   
   
   ❌ NOT READY:
   • [deployment aspect]
   • [deployment aspect]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. DEPLOYMENT ISSUES

   
   🔴 CRITICAL BLOCKERS:
   • [issue] - [production risk]
   • [issue] - [production risk]
   
   
   🟡 MODERATE CONCERNS:
   • [issue]
   • [issue]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. INFRASTRUCTURE EVALUATION

   
   ✓ [infrastructure component assessment]
   ✓ [infrastructure component assessment]
   
   
   ✗ [missing/inadequate component]
   ✗ [missing/inadequate component]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. PRODUCTION REQUIREMENTS

   • Monitoring/Logging: [✓/✗] [assessment]
   • Scalability Plan: [✓/✗] [assessment]
   • Rollback Strategy: [✓/✗] [assessment]
   • Security Measures: [✓/✗] [assessment]

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
- Focus on production readiness
- Emphasize monitoring and recovery
- Be specific about infrastructure needs
- IMPORTANT: Add a blank line before every emoji (✅, ❌, 🔴, 🟡, ✓, ✗, 💡)
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