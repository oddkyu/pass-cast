import { createClient } from '@supabase/supabase-js';
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

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL 환경 변수가 없습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function autoDowngradeExpiredUsers() {
  console.log(`[${new Date().toISOString()}] 자동 만료 강등 스케줄러 작동 시작...`);

  try {
    // 1. 만료일이 현재 시각 이전이면서 상태가 active인 구독 리스트 조회
    const now = new Date().toISOString();
    const { data: expiredSubs, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')
      .lt('expires_at', now);

    if (subError) throw subError;

    if (!expiredSubs || expiredSubs.length === 0) {
      console.log('만료된 프리미엄 회원이 없습니다.');
      return;
    }

    console.log(`총 ${expiredSubs.length}명의 만료 대상 프리미엄 회원을 감지했습니다.`);

    for (const sub of expiredSubs) {
      const { user_id } = sub;

      // 2. profiles 테이블의 멤버십 타입을 basic으로 강등
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ membership_type: 'basic' })
        .eq('id', user_id);

      if (profileError) {
        console.error(`유저(${user_id}) 프로필 강등 실패:`, profileError.message);
        continue;
      }

      // 3. subscriptions 테이블의 해당 레코드 상태를 ended로 변경
      const { error: updateSubError } = await supabase
        .from('subscriptions')
        .update({ status: 'ended' })
        .eq('id', sub.id);

      if (updateSubError) {
        console.error(`구독 ID(${sub.id}) 상태 변경 실패:`, updateSubError.message);
      } else {
        console.log(`✅ 유저(${user_id}) 프리미엄 만료 강등 완료 (만료시간: ${sub.expires_at})`);
      }
    }
  } catch (error) {
    console.error('스케줄러 작동 중 치명적 에러 발생:', error.message);
  }
}

autoDowngradeExpiredUsers();
