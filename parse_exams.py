import fitz
import json
import re
import os

def parse_pdf_improved(file_path, subject_mapping, year):
    results = []
    doc = fitz.open(file_path)
    
    # 블록 단위로 텍스트 수집 (좌측 컬럼 -> 우측 컬럼 순서 유지)
    all_blocks = []
    for page in doc:
        # blocks: (x0, y0, x1, y1, "text", block_no, block_type)
        blocks = page.get_text("blocks")
        # x0 좌표를 기준으로 컬럼을 나누어 정렬 (일반적인 시험지는 중앙 x값이 대략 300)
        left_column = [b for b in blocks if b[0] < 300]
        right_column = [b for b in blocks if b[0] >= 300]
        
        # y 좌표 순으로 정렬하여 추가
        all_blocks.extend(sorted(left_column, key=lambda x: x[1]))
        all_blocks.extend(sorted(right_column, key=lambda x: x[1]))
    doc.close()
    
    # 블록에서 텍스트만 추출 및 정제
    text_blocks = [b[4].strip() for b in all_blocks if b[4].strip()]
    
    # 과목 분류 도우미 함수
    def get_subject(q_num):
        for (start, end), sub_name in subject_mapping.items():
            if start <= q_num <= end:
                return sub_name
        return "미분류"

    current_q = None
    
    # 문항 시작 패턴: "1.", "40." 등으로 시작하는 경우
    q_start_pattern = re.compile(r'^(\d+)\.')
    # 보기 패턴: ①, ②...
    opt_pattern = re.compile(r'([①②③④⑤])')

    for block in text_blocks:
        # 새로운 문항 발견
        q_match = q_start_pattern.match(block)
        if q_match:
            q_num = int(q_match.group(1))
            
            if current_q:
                results.append(current_q)
            
            current_q = {
                "number": q_num,
                "subject": get_subject(q_num),
                "content": block[len(q_match.group(0)):].strip(),
                "options": [],
                "answer": None,
                "explanation": "",
                "year": year
            }
            continue
            
        if not current_q:
            continue
            
        # 보기 발견
        if opt_pattern.search(block):
            parts = opt_pattern.split(block)
            # split 결과는 ['', '①', '내용', '②', '내용'...] 형태
            for j in range(1, len(parts), 2):
                symbol = parts[j]
                text = parts[j+1].strip() if j+1 < len(parts) else ""
                if text:
                    current_q["options"].append(text)
        else:
            # 보기가 아직 안 나왔으면 지문에 추가, 보기가 이미 나왔으면 마지막 보기에 추가
            if not current_q["options"]:
                current_q["content"] += " " + block
            else:
                current_q["options"][-1] += " " + block

    if current_q:
        results.append(current_q)
        
    return results

def main():
    pdf_dir = "pdf_folder"
    output_file = "pass_cast_db.json"
    
    years_configs = {
        2024: [
            ("GICHUL_2024_35th_1-1.pdf.pdf", {(1, 40): "부동산학개론", (41, 80): "민법 및 민사특별법"}),
            ("GICHUL_2024_35th_2-1.pdf.pdf", {(1, 40): "공인중개사법", (41, 80): "부동산공법"}),
            ("GICHUL_2024_35th_2-2.pdf.pdf", {(1, 40): "부동산공시법 및 세법"})
        ],
        2023: [
            ("GICHUL_2023_34th_1-1.pdf.pdf", {(1, 40): "부동산학개론", (41, 80): "민법 및 민사특별법"}),
            ("GICHUL_2023_34th_2-1.pdf.pdf", {(1, 40): "공인중개사법", (41, 80): "부동산공법"}),
            ("GICHUL_2023_34th_2-2.pdf.pdf", {(1, 40): "부동산공시법 및 세법"})
        ],
        2022: [
            ("GICHUL_2022_33rd_1-1.pdf.pdf", {(1, 40): "부동산학개론", (41, 80): "민법 및 민사특별법"}),
            ("GICHUL_2022_33rd_2-1.pdf.pdf", {(1, 40): "공인중개사법", (41, 80): "부동산공법"}),
            ("GICHUL_2022_33rd_2-2.pdf.pdf", {(1, 40): "부동산공시법 및 세법"})
        ]
    }
    
    all_data = []
    
    for year, files in years_configs.items():
        for file_name, mapping in files:
            path = os.path.join(pdf_dir, file_name)
            if os.path.exists(path):
                print(f"[{year}] Parsing {file_name}...")
                try:
                    data = parse_pdf_improved(path, mapping, year)
                    # 중복 문항 제거 및 번호 순 정렬
                    unique_data = {}
                    for item in data:
                        unique_data[item["number"]] = item
                    sorted_data = [unique_data[n] for n in sorted(unique_data.keys())]
                    
                    all_data.extend(sorted_data)
                    print(f"   -> Extracted {len(sorted_data)} questions")
                except Exception as e:
                    print(f"   -> Error: {e}")
            else:
                print(f"[{year}] File not found: {path}")
                
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n[DONE] Total {len(all_data)} questions saved to {output_file}")

if __name__ == "__main__":
    main()
