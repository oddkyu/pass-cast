import fitz
pdf_path = "pdf_folder/answer_2023.pdf.pdf"
doc = fitz.open(pdf_path)
for i in range(len(doc)):
    page = doc.load_page(i)
    print(f"Page {i+1} Fonts: {page.get_fonts()}")
    print(f"Page {i+1} Images: {len(page.get_image_info())}")
doc.close()
