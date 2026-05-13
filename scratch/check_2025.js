
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check2025Questions() {
  const { data: exams } = await supabase.from('exams').select('id, year').eq('year', 2025);
  if (!exams) return;
  
  for (const exam of exams) {
    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('exam_id', exam.id);
    console.log(`Exam ID ${exam.id} (Year ${exam.year}) has ${count} questions.`);
    
    if (count > 0) {
      const { data: subjects } = await supabase
        .from('questions')
        .select('subject')
        .eq('exam_id', exam.id);
      console.log('Subjects for this exam:', [...new Set(subjects.map(s => s.subject))]);
    }
  }
}

check2025Questions();
