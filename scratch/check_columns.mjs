import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  console.log('--- Checking profiles columns ---');
  const { error: profileError } = await supabase.from('profiles').select('membership_type').limit(1);
  if (profileError) {
    console.log('profiles.membership_type error:', profileError.message);
  } else {
    console.log('profiles.membership_type exists.');
  }

  console.log('\n--- Checking user_incorrect_questions table ---');
  const { error: incorrectError } = await supabase.from('user_incorrect_questions').select('*').limit(1);
  if (incorrectError) {
    console.log('user_incorrect_questions table error:', incorrectError.message);
  } else {
    console.log('user_incorrect_questions table exists.');
  }

  console.log('\n--- Checking questions.explanation column ---');
  const { error: explanationError } = await supabase.from('questions').select('explanation').limit(1);
  if (explanationError) {
    console.log('questions.explanation error:', explanationError.message);
  } else {
    console.log('questions.explanation exists.');
  }
}

checkColumns();
