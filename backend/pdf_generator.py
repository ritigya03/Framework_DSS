"""
PDF Report Generator for SDLC Verification
Uses FPDF library to create professional PDF reports
Install: pip install fpdf2
"""

from fpdf import FPDF
from datetime import datetime
from io import BytesIO
from typing import Dict, List


class SDLCReportPDF(FPDF):
    """Custom PDF class with header and footer"""
    
    def header(self):
        """Page header"""
        self.set_font('Arial', 'B', 16)
        self.cell(0, 10, 'SDLC Verification Report', 0, 1, 'C')
        self.set_font('Arial', 'I', 10)
        self.cell(0, 5, f'Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}', 0, 1, 'C')
        self.ln(5)
    
    def footer(self):
        """Page footer"""
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')


def clean_text(text: str) -> str:
    """
    Clean text for PDF encoding (Latin-1 compatible)
    Replaces problematic characters with ASCII equivalents
    """
    if not text:
        return ""
    
    # Replace common problematic characters
    replacements = {
        '\u2018': "'",  # Left single quote
        '\u2019': "'",  # Right single quote
        '\u201c': '"',  # Left double quote
        '\u201d': '"',  # Right double quote
        '\u2013': '-',  # En dash
        '\u2014': '--', # Em dash
        '\u2022': '*',  # Bullet
        '\u2026': '...', # Ellipsis
        '\u00a0': ' ',  # Non-breaking space
    }
    
    for old, new in replacements.items():
        text = text.replace(old, new)
    
    # Remove any remaining non-Latin-1 characters
    try:
        text.encode('latin-1')
    except UnicodeEncodeError:
        # Replace remaining problematic chars with '?'
        text = text.encode('latin-1', errors='replace').decode('latin-1')
    
    return text


def add_phase_section(pdf: FPDF, phase_name: str, phase_data: Dict):
    """Add a phase section to the PDF"""
    
    # Phase Title
    pdf.set_font('Arial', 'B', 14)
    pdf.set_fill_color(70, 130, 180)  # Steel blue
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 10, clean_text(phase_name.upper()), 0, 1, 'L', True)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(2)
    
    # Score
    score = phase_data.get('score', 0)
    pdf.set_font('Arial', 'B', 12)
    
    # Color based on score
    if score >= 80:
        color = (34, 139, 34)  # Green
    elif score >= 60:
        color = (255, 165, 0)  # Orange
    else:
        color = (220, 20, 60)  # Red
    
    pdf.set_text_color(*color)
    pdf.cell(0, 8, f'Score: {score}/100', 0, 1)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(2)
    
    # Analysis
    analysis = clean_text(phase_data.get('analysis', 'No analysis available'))
    pdf.set_font('Arial', '', 10)
    pdf.multi_cell(0, 5, analysis)
    pdf.ln(3)
    
    # Strengths
    strengths = phase_data.get('strengths', [])
    if strengths:
        pdf.set_font('Arial', 'B', 11)
        pdf.cell(0, 6, 'Strengths:', 0, 1)
        pdf.set_font('Arial', '', 10)
        for strength in strengths:
            pdf.cell(5)
            pdf.multi_cell(0, 5, f'* {clean_text(strength)}')
        pdf.ln(2)
    
    # Recommendations
    recommendations = phase_data.get('recommendations', [])
    if recommendations:
        pdf.set_font('Arial', 'B', 11)
        pdf.cell(0, 6, 'Recommendations:', 0, 1)
        pdf.set_font('Arial', '', 10)
        for rec in recommendations:
            pdf.cell(5)
            pdf.multi_cell(0, 5, f'* {clean_text(rec)}')
        pdf.ln(2)
    
    pdf.ln(5)


def generate_pdf_report(
    analysis_results: Dict,
    overall_score: str,
    files_analyzed: List[str]
) -> BytesIO:
    """
    Generate PDF report from analysis results
    
    Args:
        analysis_results: Dictionary containing phase analysis data
        overall_score: Overall verification score
        files_analyzed: List of analyzed files
    
    Returns:
        BytesIO: PDF file buffer
    """
    
    # Create PDF instance
    pdf = SDLCReportPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # Title Section
    pdf.set_font('Arial', 'B', 18)
    pdf.cell(0, 10, 'Project Verification Summary', 0, 1, 'C')
    pdf.ln(5)
    
    # Overall Score - Large and prominent
    pdf.set_font('Arial', 'B', 16)
    score_val = float(overall_score)
    
    if score_val >= 80:
        pdf.set_text_color(34, 139, 34)  # Green
    elif score_val >= 60:
        pdf.set_text_color(255, 165, 0)  # Orange
    else:
        pdf.set_text_color(220, 20, 60)  # Red
    
    pdf.cell(0, 12, f'Overall Score: {overall_score}/100', 0, 1, 'C')
    pdf.set_text_color(0, 0, 0)
    pdf.ln(5)
    
    # Files Analyzed Section
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 8, f'Files Analyzed ({len(files_analyzed)}):', 0, 1)
    pdf.set_font('Arial', '', 10)
    
    for filename in files_analyzed[:20]:  # Limit to first 20 files
        pdf.cell(5)
        pdf.cell(0, 5, clean_text(filename), 0, 1)
    
    if len(files_analyzed) > 20:
        pdf.cell(5)
        pdf.set_font('Arial', 'I', 10)
        pdf.cell(0, 5, f'... and {len(files_analyzed) - 20} more files', 0, 1)
    
    pdf.ln(10)
    
    # Phase Sections
    phases = analysis_results.get('phases', {})
    
    # Order of phases for report
    phase_order = [
        'requirements',
        'design',
        'implementation',
        'testing',
        'deployment',
        'maintenance'
    ]
    
    for phase_key in phase_order:
        if phase_key in phases:
            phase_data = phases[phase_key]
            
            # Convert phase key to readable name
            phase_name = phase_key.replace('_', ' ').title()
            
            # Add phase section
            add_phase_section(pdf, phase_name, phase_data)
    
    # Footer Section
    pdf.ln(10)
    pdf.set_font('Arial', 'I', 9)
    pdf.set_text_color(128, 128, 128)
    pdf.multi_cell(
        0, 5,
        'This report was automatically generated by SDLC AI Verifier. '
        'Results should be reviewed by qualified personnel before making '
        'critical decisions.'
    )
    
    # Output to BytesIO buffer
    pdf_output = BytesIO()
    pdf_bytes = pdf.output(dest='S').encode('latin-1')
    pdf_output.write(pdf_bytes)
    pdf_output.seek(0)
    
    return pdf_output


# Test function (optional)
if __name__ == "__main__":
    # Test data
    test_data = {
        "phases": {
            "requirements": {
                "score": 85,
                "analysis": "Requirements are well-documented and traceable.",
                "strengths": [
                    "Clear acceptance criteria",
                    "Comprehensive user stories"
                ],
                "recommendations": [
                    "Add more edge cases",
                    "Include performance requirements"
                ]
            },
            "implementation": {
                "score": 75,
                "analysis": "Code quality is good with some areas for improvement.",
                "strengths": ["Clean architecture", "Good test coverage"],
                "recommendations": ["Reduce code duplication", "Add more comments"]
            }
        }
    }
    
    pdf_buffer = generate_pdf_report(test_data, "80", ["main.py", "test.py"])
    
    with open("test_report.pdf", "wb") as f:
        f.write(pdf_buffer.getvalue())
    
    print("Test PDF generated: test_report.pdf")