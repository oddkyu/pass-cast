
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check2024() {
  const { data: exams } = await supabase.from('exams').select('id, year').eq('year', 2024);
  for (const exam of exams) {
    const { data: subjects } = await supabase.from('questions').select('subject').eq('exam_id', exam.id);
    console.log(`2024 Exam ID ${exam.id} subjects:`, [...new Set(subjects?.map(s => s.subject))]);
  }
}

check2024();
