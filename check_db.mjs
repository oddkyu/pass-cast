import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qmdmfawqfrlojhripyad.supabase.co';
const supabaseAnonKey = 'sb_publishable_GtSgYJFUVJFtYcnGVZVwbg_hwwveZaa';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTable() {
  const { data, error } = await supabase.from('questions').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Sample Data:', JSON.stringify(data[0], null, 2));
  }
}

checkTable();
