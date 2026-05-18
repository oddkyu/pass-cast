import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// .env 파일의 실제 서비스 환경 변수 로드
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL || 'https://qmdmfawqfrlojhripyad.supabase.co';
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

console.log('Connecting to:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProfiles() {
  console.log('--- Checking profiles table ---');
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(1);
  if (pError) {
    console.error('profiles Error:', pError);
  } else {
    console.log('profiles sample columns:', Object.keys(profiles[0] || {}));
    console.log('profiles sample data:', profiles[0]);
  }

  console.log('--- Checking active subscriptions table ---');
  const { data: subs, error: sError } = await supabase.from('subscriptions').select('*').limit(1);
  if (sError) {
    console.log('subscriptions table error:', sError.message);
  } else {
    console.log('subscriptions sample columns:', Object.keys(subs[0] || {}));
    console.log('subscriptions sample data:', subs[0]);
  }
}

checkProfiles();
