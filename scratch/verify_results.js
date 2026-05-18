import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  const examId = 'c46113d1-748d-4918-8145-90ae9af25cdb'; // 2022년 부동산학개론 시험 ID
  
  const { data: questions, error } = await supabase
    .from('questions')
    .select('number, answer, explanation')
    .eq('exam_id', examId)
    .in('number', [1, 2])
    .order('number', { ascending: true });
    
  if (error) {
    console.error("Fetch error:", error);
    return;
  }
  
  console.log("\n=============================================");
  console.log("🔍 SUPABASE 실제 DB 반영 확인 결과");
  console.log("=============================================");
  
  questions.forEach(q => {
    console.log(`\n🔹 [문항 번호 ${q.number}번]`);
    console.log(`정답: ${q.answer}`);
    console.log(`해설:\n${q.explanation}`);
    console.log("---------------------------------------------");
  });
}

verify();
