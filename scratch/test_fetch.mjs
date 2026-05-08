import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://qmdmfawqfrlojhripyad.supabase.co';
const supabaseAnonKey = 'sb_publishable_GtSgYJFUVJFtYcnGVZVwbg_hwwveZaa';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch(year, subject) {
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('id')
        .eq('year', year);
      
      const examIds = examData.map(e => e.id);
      console.log(`Exam IDs for ${year}:`, examIds);

      let query = supabase
        .from('questions')
        .select('*')
        .in('exam_id', examIds)
        .eq('subject', subject)
        .order('number', { ascending: true });

      const { data, error } = await query;
      console.log(`Questions found for ${year} ${subject}:`, data?.length);
      if (error) console.error(error);
}

async function run() {
  await testFetch(2022, '공인중개사법');
  await testFetch(2022, '부동산공법');
  await testFetch(2022, '부동산공시법 및 세법');
}
run();
