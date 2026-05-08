import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable(tableName) {
  console.log(`--- Inspecting table: ${tableName} ---`);
  const { data, error } = await supabase.from(tableName).select('*').limit(1);
  if (error) {
    console.error(`Error fetching from ${tableName}:`, error.message);
  } else if (data && data.length > 0) {
    console.log(`Columns for ${tableName}:`, Object.keys(data[0]).join(', '));
    console.log('Sample data:', data[0]);
  } else {
    console.log(`No data found in ${tableName} to inspect columns.`);
  }
}

async function run() {
  await inspectTable('profiles');
  await inspectTable('questions');
  await inspectTable('user_incorrect_questions');
  await inspectTable('wrong_answers');
}

run();
