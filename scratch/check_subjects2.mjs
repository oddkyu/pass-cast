import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qmdmfawqfrlojhripyad.supabase.co';
const supabaseAnonKey = 'sb_publishable_GtSgYJFUVJFtYcnGVZVwbg_hwwveZaa';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data: exams, error: e1 } = await supabase.from('exams').select('*');
  console.log('Exams:', exams);
  
  const { data: qs, error: e2 } = await supabase.from('questions').select('exam_id, subject');
  
  if (qs) {
    const counts = {};
    for (const q of qs) {
      const year = exams.find(e => e.id === q.exam_id)?.year || q.exam_id;
      const key = `${year} - ${q.subject}`;
      counts[key] = (counts[key] || 0) + 1;
    }
    console.log('Question Counts:', counts);
  } else {
    console.error('Error fetching questions:', e2);
  }
}
check();
