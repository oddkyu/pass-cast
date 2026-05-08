import pdfplumber

pdf_path = "pdf_folder/answer_2024.pdf.pdf"
with pdfplumber.open(pdf_path) as pdf:
    for i, page in enumerate(pdf.pages):
        print(f"--- Page {i+1} Tables ---")
        tables = page.extract_tables()
        for table in tables:
            for row in table:
                print(row)
