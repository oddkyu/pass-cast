import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check2022() {
  const { data: exams, error: examErr } = await supabase
    .from('exams')
    .select('*')
    .eq('year', 2022);
    
  if (examErr) {
    console.error("Exam fetch error:", examErr);
    return;
  }
  
  console.log("--- 2022년 등록된 시험 정보 ---");
  console.log(exams);
  
  if (exams && exams.length > 0) {
    for (const exam of exams) {
      const { count, error: qErr } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('exam_id', exam.id)
        .eq('subject', '부동산학개론');
        
      if (qErr) {
        console.error(`Questions fetch error for exam ${exam.id}:`, qErr);
      } else {
        console.log(`시험 ID ${exam.id} (차수 ${exam.type}, 교시 ${exam.session}) - 부동산학개론 문항 수: ${count}개`);
      }
    }
  } else {
    console.log("2022년 등록된 시험 정보가 없습니다.");
  }
}

check2022();
