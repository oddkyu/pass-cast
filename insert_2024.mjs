import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertData() {
    const rawData = fs.readFileSync('pass_cast_db.json', 'utf8');
    const allQuestions = JSON.parse(rawData);
    
    // 2024년 데이터만 필터링
    const questions2024 = allQuestions.filter(q => q.year === 2024);
    
    if (questions2024.length === 0) {
        console.log("2024년 데이터가 없습니다.");
        return;
    }

    console.log(`2024년 문항 ${questions2024.length}개 삽입 시작...`);

    // 1. 시험 회차 생성 (1차 1교시, 2차 1교시, 2차 2교시)
    // 2024년은 제35회입니다.
    const examConfigs = [
        { year: 2024, round: 35, type: 1, session: 1, subjects: ["부동산학개론", "민법 및 민사특별법"] },
        { year: 2024, round: 35, type: 2, session: 1, subjects: ["공인중개사법", "부동산공법"] },
        { year: 2024, round: 35, type: 2, session: 2, subjects: ["부동산공시법 및 세법"] }
    ];

    for (const config of examConfigs) {
        console.log(`${config.year}년 ${config.round}회 ${config.type}차 ${config.session}교시 등록 중...`);
        
        // 기존 시험 정보 확인 혹은 생성
        const { data: existingExams } = await supabase
            .from('exams')
            .select('id')
            .match({ year: config.year, round: config.round, type: config.type, session: config.session });
        
        let examId;
        if (existingExams && existingExams.length > 0) {
            examId = existingExams[0].id;
            console.log(`기존 시험 정보 발견: ${examId}`);
        } else {
            const { data: newExam, error: examErr } = await supabase
                .from('exams')
                .insert([{ 
                    year: config.year, 
                    round: config.round, 
                    type: config.type, 
                    session: config.session 
                }])
                .select();
            
            if (examErr) {
                console.error("시험 생성 에러:", examErr);
                continue;
            }
            examId = newExam[0].id;
            console.log(`새 시험 정보 생성: ${examId}`);
        }

        // 해당 시험에 속하는 과목의 문제들 필터링
        const subQuestions = questions2024.filter(q => config.subjects.includes(q.subject));
        
        const questionsToInsert = subQuestions.map(q => ({
            exam_id: examId,
            subject: q.subject,
            number: q.number,
            content: q.content,
            options: q.options,
            answer: Array.isArray(q.answer) ? q.answer[0] : q.answer, // 복수정답일 경우 첫번째 값을 기본으로 저장
            explanation: q.explanation || ""
        }));

        if (questionsToInsert.length > 0) {
            const { error: insErr } = await supabase
                .from('questions')
                .upsert(questionsToInsert, { onConflict: 'exam_id, subject, number' }); // 중복 방지
            
            if (insErr) {
                console.error(`${config.subjects.join(', ')} 문제 삽입 에러:`, insErr);
            } else {
                console.log(`${config.subjects.join(', ')} 문제 ${questionsToInsert.length}개 삽입 완료.`);
            }
        }
    }

    console.log("전체 작업 완료!");
}

insertData();
