import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error("오류: .env 파일에 VITE_SUPABASE_URL과 VITE_SUPABASE_SERVICE_ROLE_KEY가 설정되어 있어야 합니다.");
    process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

const filePath = process.argv[2];
if (!filePath) {
    console.error("❌ 사용법: node upload_to_db.mjs <JSON파일경로>");
    process.exit(1);
}

async function uploadData() {
    console.log(`📂 파일 읽는 중: ${filePath}`);
    const rawData = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(rawData);
    
    if (questions.length === 0) {
        console.log("데이터가 없습니다.");
        return;
    }

    const year = questions[0].year;
    const subject = questions[0].subject;
    const round = year - 1989; // 2024년은 35회
    
    let type = 1;
    let session = 1;
    if (subject.includes("중개사") || subject.includes("부동산공법")) {
        type = 2;
        session = 1;
    } else if (subject.includes("공시법") || subject.includes("세법")) {
        type = 2;
        session = 2;
    }

    console.log(`\n========================================`);
    console.log(`📌 시험 정보: ${year}년(${round}회) ${type}차 ${session}교시`);
    console.log(`📌 과목: ${subject}`);
    console.log(`========================================\n`);
    
    // 1. 시험 회차 확인/생성
    const { data: existingExams, error: findErr } = await supabase
        .from('exams')
        .select('id')
        .match({ year, round, type, session });
        
    let examId;
    if (existingExams && existingExams.length > 0) {
        examId = existingExams[0].id;
        console.log(`✅ 기존 시험 정보 발견 (ID: ${examId})`);
    } else {
        const { data: newExam, error: examErr } = await supabase
            .from('exams')
            .insert([{ year, round, type, session }])
            .select();
        
        if (examErr) {
            console.error("❌ 시험 생성 에러:", examErr);
            return;
        }
        examId = newExam[0].id;
        console.log(`✅ 새 시험 정보 생성 (ID: ${examId})`);
    }

    // 2. 문항 데이터 가공 및 업로드
    const questionsToInsert = questions.map(q => {
        let ans = q.answer;
        if (typeof ans === 'string') {
            // "3,5" 처럼 복수 정답이 문자열로 들어온 경우 첫 번째 숫자만 추출
            const match = ans.match(/\d+/);
            ans = match ? parseInt(match[0], 10) : null;
        } else if (Array.isArray(ans)) {
            ans = ans[0];
        }

        return {
            exam_id: examId,
            subject: q.subject,
            number: q.number,
            title: q.title,
            content_box: q.content_box,
            options: q.options,
            answer: ans,
            explanation: q.explanation || "",
            tags: q.tags || [q.subject, `${q.year}년`]
        };
    });

    if (questionsToInsert.length > 0) {
        console.log(`\n🚀 ${questionsToInsert.length}개의 문항을 DB에 업로드합니다...`);
        const { error: insErr } = await supabase
            .from('questions')
            .upsert(questionsToInsert, { onConflict: 'exam_id, subject, number' }); // 중복 방지
        
        if (insErr) {
            console.error(`❌ 데이터 삽입 에러:`, insErr);
        } else {
            console.log(`🎉 모든 데이터가 성공적으로 Supabase에 업로드되었습니다!`);
        }
    }
}

uploadData();
