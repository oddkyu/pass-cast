
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function cleanupOrphans() {
  const { data: incorrect, error } = await supabase.from('user_incorrect_questions').select(`
    id, user_id, 
    question_id
  `);
  
  if (error) {
    console.error('Error fetching incorrect questions:', error);
    return;
  }
  
  console.log(`Fetched ${incorrect?.length} incorrect questions.`);

  const { data: questions } = await supabase.from('questions').select('id, year, subject, number');
  const qMap = new Map();
  questions.forEach(q => qMap.set(q.id, q));

  const { data: history } = await supabase.from('user_exam_history').select('user_id, year, subject, wrong_question_numbers');
  const validMap = new Map();
  history.forEach(h => {
    if (!validMap.has(h.user_id)) validMap.set(h.user_id, new Set());
    (h.wrong_question_numbers || []).forEach(num => {
      validMap.get(h.user_id).add(`${h.year}_${h.subject}_${num}`);
    });
  });

  const toDelete = [];
  incorrect.forEach(item => {
    const q = qMap.get(item.question_id);
    if (!q) {
      toDelete.push(item.id); // Question itself is missing
      return;
    }
    const userValidSet = validMap.get(item.user_id);
    const key = `${q.year}_${q.subject}_${q.number}`;
    
    if (!userValidSet || !userValidSet.has(key)) {
      toDelete.push(item.id);
    }
  });

  console.log(`Found ${toDelete.length} orphaned mistakes.`);
  if (toDelete.length > 0) {
    const { error: delError } = await supabase.from('user_incorrect_questions').delete().in('id', toDelete);
    if (delError) console.error('Delete error:', delError);
    else console.log('Successfully deleted all orphaned records.');
  }
}

cleanupOrphans();
