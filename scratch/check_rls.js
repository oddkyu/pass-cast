
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkRLS() {
  const { data, error } = await supabase.rpc('get_policies_for_table', { table_name: 'user_exam_history' });
  if (error) {
    // If the RPC doesn't exist, try querying pg_policies
    const { data: pgData, error: pgError } = await supabase.from('pg_policies').select('*').eq('tablename', 'user_exam_history');
    console.log('RLS Policies (pg_policies):', pgData || pgError);
  } else {
    console.log('RLS Policies (RPC):', data);
  }
}

async function checkSchema() {
  const { data, error } = await supabase.from('user_exam_history').select('*').limit(1);
  console.log('Sample row from user_exam_history:', data);
}

checkRLS();
checkSchema();
