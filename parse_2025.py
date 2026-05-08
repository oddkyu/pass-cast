import pdfplumber
import json
import re
import os

def parse_pdf(file_path, subject_mapping):
    results = []
    with pdfplumber.open(file_path) as pdf:
        full_text = ""
        for page in pdf.pages:
            full_text += page.extract_text() + "\n"
        
        # 기출문제 패턴 (숫자. 질문)
        # 예: 1. 부동산의 개념...
        # 보기는 ①, ②, ③, ④, ⑤ 또는 (1), (2)...
        
        # 간단한 정규식으로 문제 분할
        # 문항 번호와 지문을 찾는 패턴
        q_pattern = re.compile(r'(\d+)\.\s+(.+?)(?=\s+\d+\.|\s+①|\s+\(1\)|$)', re.DOTALL)
        # 보기 패턴
        opt_pattern = re.compile(r'[①②③④⑤]\s*(.+?)(?=[①②③④⑤]|$)', re.DOTALL)
        
        # 텍스트 정제 (줄바꿈 제거 등)
        lines = full_text.split('\n')
        cleaned_text = " ".join(lines)
        
        # 실제 시험지는 2단 구성이라 단순 추출 시 순서가 꼬일 수 있음
        # 하지만 일단 기본적인 추출 시도
        
        # 문제 번호별로 나누기 위해 더 정교한 접근 필요
        # 1~80번까지 순차적으로 검색
        for q_num in range(1, 81):
            start_marker = f"{q_num}."
            next_marker = f"{q_num + 1}."
            
            start_idx = cleaned_text.find(start_marker)
            if start_idx == -1: continue
            
            end_idx = cleaned_text.find(next_marker, start_idx + 2)
            if end_idx == -1:
                q_block = cleaned_text[start_idx:]
            else:
                q_block = cleaned_text[start_idx:end_idx]
            
            # 지문과 보기 분리
            # 보기 기호 ① (U+2460) ~ ⑤ (U+2464)
            options = re.findall(r'[①②③④⑤]\s*(.+?)(?=[①②③④⑤]|$)', q_block)
            
            # 지문 추출 (번호 뒤부터 첫 번째 보기 전까지)
            content_match = re.search(r'\d+\.\s*(.+?)(?=①|$)', q_block)
            content = content_match.group(1).strip() if content_match else ""
            
            if not content and not options: continue

            # 과목 결정
            subject = "미분류"
            for (start, end), sub_name in subject_mapping.items():
                if start <= q_num <= end:
                    subject = sub_name
                    break
            
            results.append({
                "number": q_num,
                "subject": subject,
                "content": content,
                "options": [opt.strip() for opt in options][:5],
                "answer": None, # PDF에서 정답을 추출하기는 매우 어려우므로 일단 비워둠
                "explanation": "",
                "year": 2025
            })
            
    return results

def main():
    pdf_dir = "pdf_folder"
    output_file = "pass_cast_db.json"
    
    files_to_parse = [
        ("GICHUL_2025_36th_1-1.pdf", {(1, 40): "부동산학개론", (41, 80): "민법 및 민사특별법"}),
        ("GICHUL_2025_36th_2-1.pdf.pdf", {(1, 40): "공인중개사법", (41, 80): "부동산공법"}),
        ("GICHUL_2025_36th_2-2.pdf.pdf", {(1, 40): "부동산공시법 및 세법"})
    ]
    
    all_data = []
    
    for file_name, mapping in files_to_parse:
        path = os.path.join(pdf_dir, file_name)
        if os.path.exists(path):
            print(f"Parsing {file_name}...")
            try:
                data = parse_pdf(path, mapping)
                all_data.extend(data)
                print(f"Extracted {len(data)} questions from {file_name}")
            except Exception as e:
                print(f"Error parsing {file_name}: {e}")
        else:
            print(f"File not found: {path}")
            
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)
    
    print(f"Total {len(all_data)} questions saved to {output_file}")

if __name__ == "__main__":
    main()
