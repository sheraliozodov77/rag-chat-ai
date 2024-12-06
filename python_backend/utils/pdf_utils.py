import requests
from PyPDF2 import PdfReader
from io import BytesIO

def extract_text_from_pdf(url):
    """Download a PDF from a URL and extract its text content."""
    try:
        response = requests.get(url)
        response.raise_for_status()
        pdf_file = BytesIO(response.content)
        reader = PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        print(f"Error extracting text from {url}: {e}")
        return None
