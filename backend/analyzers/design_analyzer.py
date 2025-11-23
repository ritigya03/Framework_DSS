def analyze_design(file_contents, model):
    """
    Analyze the Design phase of SDLC using Google Gemini.
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
You are a Senior SDLC Architect performing Design Phase Analysis.

{context}

OUTPUT FORMAT (use this exact structure):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏗️ DESIGN ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ARCHITECTURE SCORE: [X]/100

   
   ✅ PRESENT:
   • [design element]
   • [design element]
   
   
   ❌ MISSING:
   • [design element]
   • [design element]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. MODEL DESIGN EVALUATION

   
   🔴 CRITICAL:
   • [issue] - [impact]
   • [issue] - [impact]
   
   
   🟡 MODERATE:
   • [issue]
   • [issue]
   
   
   ✓ STRENGTHS:
   • [strength]
   • [strength]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. DATA PIPELINE DESIGN

   
   ✓ [pipeline component evaluation]
   ✓ [pipeline component evaluation]
   
   
   ✗ [missing/weak component]
   ✗ [missing/weak component]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. SCALABILITY & MAINTAINABILITY

   • Modularity: [✓/✗] [one-line assessment]
   • Code Reusability: [✓/✗] [one-line assessment]
   • Error Handling: [✓/✗] [one-line assessment]
   • Documentation: [✓/✗] [one-line assessment]

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
- Be specific and actionable
- Focus on design patterns and architecture
- Avoid repetition
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
            "phase": "Design",
            "score": score,
            "analysis": analysis_text,
            "status": "completed"
        }
    
    except Exception as e:
        return {
            "phase": "Design",
            "score": 0,
            "analysis": f"Error during analysis: {str(e)}",
            "status": "error"
        }
