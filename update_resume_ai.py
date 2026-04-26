
import os
import requests
import pdfplumber
import io

# --- CONFIGURATION ---
# The User will provide the DRIVE_FILE_ID
DRIVE_FILE_ID = os.environ.get('DRIVE_FILE_ID')

def download_pdf(file_id):
    url = f'https://drive.google.com/uc?export=download&id={file_id}'
    response = requests.get(url)
    if response.status_code == 200:
        return io.BytesIO(response.content)
    else:
        print(f"Failed to download file. Status: {response.status_code}")
        return null

def extract_text(pdf_io):
    if not pdf_io: return ""
    text = ""
    with pdfplumber.open(pdf_io) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text

def main():
    if not DRIVE_FILE_ID:
        print("Error: DRIVE_FILE_ID not set in environment.")
        return

    print(f"Connecting to Google Drive for File ID: {DRIVE_FILE_ID}...")
    pdf_content = download_pdf(DRIVE_FILE_ID)
    
    if pdf_content:
        full_text = extract_text(pdf_content)
        with open('resume_data.txt', 'w', encoding='utf-8') as f:
            f.write(full_text)
        print("Success: AI Brain updated with latest Drive Resume data.")
    else:
        print("Error: Could not retrieve PDF from Drive.")

if __name__ == "__main__":
    main()
