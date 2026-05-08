import fitz
import os

pdf_path = "pdf_folder/answer_2023.pdf.pdf"
doc = fitz.open(pdf_path)
page = doc.load_page(0)
with open("debug_output_modes.txt", "w", encoding="utf-8") as f:
    f.write("--- TEXT ---\n")
    f.write(page.get_text("text") + "\n")
    f.write("--- BLOCKS ---\n")
    f.write(str(page.get_text("blocks")) + "\n")
    f.write("--- WORDS ---\n")
    f.write(str(page.get_text("words")) + "\n")
doc.close()
