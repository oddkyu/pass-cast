import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTable() {
  console.log('--- Creating user_incorrect_questions table ---');
  
  // Note: Standard Supabase client doesn't have an 'exec' method for arbitrary SQL.
  // We usually do this via the Dashboard. 
  // However, we can try to use a dummy RPC if it exists, but it likely won't.
  // Since I cannot run arbitrary SQL via the REST API, I will provide the SQL 
  // to the user clearly and proceed with code implementation that assumes it exists.
  
  console.log('Please run the following SQL in your Supabase SQL Editor:');
  console.log(`
CREATE TABLE IF NOT EXISTS user_incorrect_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, question_id)
);

ALTER TABLE user_incorrect_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own incorrect questions" ON user_incorrect_questions FOR SELECT USING ( auth.uid() = user_id );
CREATE POLICY "Users can insert own incorrect questions" ON user_incorrect_questions FOR INSERT WITH CHECK ( auth.uid() = user_id );
CREATE POLICY "Users can delete own incorrect questions" ON user_incorrect_questions FOR DELETE USING ( auth.uid() = user_id );
  `);
}

createTable();
