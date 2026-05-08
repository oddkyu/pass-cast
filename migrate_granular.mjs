import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateToGranularSchema() {
    const rawData = fs.readFileSync('pass_cast_db.json', 'utf8');
    const allQuestions = JSON.parse(rawData);
    
    console.log(`총 ${allQuestions.length}개의 데이터를 파편화 및 마이그레이션 시작...`);

    const parsedData = allQuestions.map(q => {
        const lines = q.content.split('\n').map(l => l.trim()).filter(l => l);
        const title = lines[0] || "";
        const contentBox = lines.length > 1 ? lines.slice(1) : [];
        
        return {
            year: q.year,
            subject: q.subject,
            number: q.number,
            title: title,
            content_box: contentBox,
            options: q.options,
            answer: Array.isArray(q.answer) ? q.answer[0] : q.answer,
            explanation: q.explanation || "",
            tags: [q.subject, `${q.year}년`]
        };
    });

    // 2024년 데이터 먼저 업데이트 (테스트용)
    const data2024 = parsedData.filter(d => d.year === 2024);
    
    for (const d of data2024) {
        // 1. Get exam_id
        const { data: exam } = await supabase
            .from('exams')
            .select('id')
            .eq('year', d.year)
            .limit(1);
        
        if (exam && exam.length > 0) {
            const { error } = await supabase
                .from('questions')
                .upsert({
                    exam_id: exam[0].id,
                    subject: d.subject,
                    number: d.number,
                    title: d.title,
                    content_box: d.content_box,
                    options: d.options,
                    answer: d.answer,
                    explanation: d.explanation,
                    tags: d.tags
                }, { onConflict: 'exam_id, subject, number' });
            
            if (error) console.error(`Error at ${d.subject} ${d.number}:`, error);
        }
    }

    console.log("마이그레이션 완료!");
}

migrateToGranularSchema();
