"""Builds public/resume.pdf (the file visitors download). Edit the text below and run:
python3 scripts/build_resume_pdf.py"""
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

FONT_DIR = '/usr/share/fonts/truetype/lato'
for name, file in [('Lato', 'Lato-Regular.ttf'), ('Lato-Bold', 'Lato-Bold.ttf'), ('Lato-Italic', 'Lato-Italic.ttf'), ('Lato-BoldItalic', 'Lato-BoldItalic.ttf')]:
    pdfmetrics.registerFont(TTFont(name, os.path.join(FONT_DIR, file)))
pdfmetrics.registerFontFamily('Lato', normal='Lato', bold='Lato-Bold', italic='Lato-Italic', boldItalic='Lato-BoldItalic')

INK = HexColor('#1f1f1f')
ACCENT = HexColor('#7a4a20')
MUTED = HexColor('#555555')

NAME = 'SUNNY WU'
CONTACT = 'Boston, MA &amp; Beijing, China  ·  ywu20@babson.edu  ·  linkedin.com/in/sunny-wu77'

EDUCATION = [
    ('Babson College', 'Wellesley, MA', 'B.S. in Business Administration', 'Expected May 2029', [
        'GPA: 3.8/4.0  ·  Dean\u2019s List  ·  Honors Program (top 10%)',
        'Relevant coursework: Entrepreneurship &amp; Management, Business Analytics, Financial Accounting, Business Law &amp; Ethics, Software Design',
    ]),
]

EXPERIENCE = [
    ('Nora', '', 'Founder', '2026 \u2013 Present', [
        'Building an app that helps older adults navigate everyday technology with confidence.',
    ]),
    ('Starting Point One', 'Beijing, China', 'VC Scout', 'Jul 2026 \u2013 Aug 2026', [
        'Sourced and built relationships with 100+ founders globally; conducted 30+ in-depth interviews to identify success patterns among top entrepreneurs.',
        'Briefed investors weekly and contributed founder research and diligence insights to a portfolio that returned 100%+ within 9 months.',
    ]),
    ('Coffin Capital', 'Massachusetts', 'Consultant', 'Jan 2026 \u2013 May 2026', [
        'Synthesized 45 in-depth interviews into a MECE framework identifying core inefficiencies in early-career hiring.',
        'Analyzed two years of entry-level hiring trends, estimated market size, and evaluated business models and unit economics to surface pricing gaps and white-space opportunities.',
    ]),
    ('Sona Candles', 'Massachusetts', 'Co-Founder', 'Aug 2025 \u2013 May 2026', [
        'Generated $4,000+ in revenue from 200+ sales across 6 pop-up events at three universities; reached break-even within 3 weeks.',
        'Conducted 40+ user interviews to guide product iteration and pricing, improving product-market fit and conversion.',
        'Led Instagram content strategy (20+ posts in 2 months), growing the account by 300+ followers.',
    ]),
    ('Chickie Company', '', 'Co-Founder &amp; CMO', 'Jun 2024 \u2013 Jan 2025', [
        'Led a 4-person international team to launch a gamified study app addressing student burnout.',
        'Owned UI/UX design and delivered a functional prototype that secured sign-ups from 2 NGOs, validating product-market fit.',
        'Researched 100+ U.S. schools and interviewed 5 industry experts to refine the business model.',
    ]),
    ('Beta Fund Venture Capital', 'California', 'Intern', 'Jun 2024 \u2013 Aug 2024', [
        'Evaluated 300+ startup applications against investment criteria, advancing 50+ startups to the next stage.',
        'Created targeted social media content that increased founder applications to the incubator by 7%.',
        'Co-designed an 8-week founder curriculum on prototyping, iteration, and fundraising; built partnerships with entrepreneurship clubs at 7 colleges.',
    ]),
]

LEADERSHIP = [
    ('Peer Success Advisor', '', '', 'Present', [
        'Support fellow students with academic planning and the transition to college life.',
    ]),
    ('Undergraduate Consulting Program', '', 'President', 'Jun 2026 \u2013 Present', [
        'Sourced 30+ prospective clients and onboarded 5 for long-term engagements; recruited the executive board and general membership.',
        'Partnered with campus departments and alumni to launch 6 new events in one semester.',
    ]),
    ('Social Media Content Creation', '', 'Creator (self-employed)', 'Oct 2025 \u2013 Present', [
        'Produced 15+ videos on study abroad and student life, reaching 600,000+ total views through an end-to-end pipeline from ideation to platform optimization.',
    ]),
    ('MIT-CHIEF', '', 'Member', 'Oct 2025 \u2013 Present', [
        'Founded and ran \u201cFounder\u2019s Night,\u201d bringing together VCs, independent investors, and entrepreneurs for 30+ participant sessions.',
    ]),
]

ADDITIONAL = [
    ('Languages', 'English and Mandarin Chinese (professional fluency)'),
    ('Skills', 'Canva, CapCut, Cursor, Fusion 360, iMovie, Wix, content creation for digital platforms'),
    ('Interests', 'Cooking, hiking, product design, theater'),
]

# ---------------- layout ----------------
name_style = ParagraphStyle('name', fontName='Lato-Bold', fontSize=19, leading=22, alignment=TA_CENTER, textColor=INK, spaceAfter=2)
contact_style = ParagraphStyle('contact', fontName='Lato', fontSize=8.8, leading=11, alignment=TA_CENTER, textColor=MUTED)
section_style = ParagraphStyle('section', fontName='Lato-Bold', fontSize=9.4, leading=11, textColor=ACCENT, spaceBefore=5, spaceAfter=0)
org_style = ParagraphStyle('org', fontName='Lato-Bold', fontSize=9.2, leading=11, textColor=INK)
right_style = ParagraphStyle('right', fontName='Lato', fontSize=8.6, leading=11, textColor=MUTED, alignment=2)
role_style = ParagraphStyle('role', fontName='Lato-Italic', fontSize=8.8, leading=10.6, textColor=INK)
bullet_style = ParagraphStyle('bullet', fontName='Lato', fontSize=8.6, leading=10.4, textColor=INK, leftIndent=10, bulletIndent=1)

W = letter[0] - 1.1 * inch


def section(title):
    return [Paragraph(title.upper(), section_style), HRFlowable(width='100%', thickness=0.6, color=ACCENT, spaceBefore=1, spaceAfter=2)]


def entry(org, place, role, dates, bullets):
    left = f'{org}' + (f'<font name="Lato" color="#555555">, {place}</font>' if place else '')
    head = Table([[Paragraph(left, org_style), Paragraph(dates, right_style)]], colWidths=[W * 0.72, W * 0.28])
    head.setStyle(TableStyle([('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0), ('TOPPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 0), ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    parts = [head]
    if role:
        parts.append(Paragraph(role, role_style))
    parts += [Paragraph(text, bullet_style, bulletText='\u2022') for text in bullets]
    parts.append(Spacer(1, 2.5))
    return KeepTogether(parts)


def build(path):
    doc = SimpleDocTemplate(path, pagesize=letter, leftMargin=0.55 * inch, rightMargin=0.55 * inch, topMargin=0.42 * inch, bottomMargin=0.4 * inch,
                            title='Sunny Wu \u2014 R\u00e9sum\u00e9', author='Sunny Wu')
    story = [Paragraph(NAME, name_style), Paragraph(CONTACT, contact_style)]
    story += section('Education')
    for org, place, degree, dates, bullets in EDUCATION:
        story.append(entry(org, place, degree, dates, bullets))
    story += section('Experience')
    for item in EXPERIENCE:
        story.append(entry(*item))
    story += section('Leadership &amp; Activities')
    for item in LEADERSHIP:
        story.append(entry(*item))
    story += section('Additional Information')
    for label, text in ADDITIONAL:
        story.append(Paragraph(f'<b>{label}:</b> {text}', bullet_style.clone('add', leftIndent=0)))
    doc.build(story)


if __name__ == '__main__':
    out = os.path.join(os.path.dirname(__file__), '..', 'public', 'resume.pdf')
    build(out)
    print('wrote', os.path.abspath(out))
