/**
 * Pass-Cast: AI 기출문제 해설 자동 생성 배치 스크립트
 * 
 * 사용법:
 *   node scratch/generate_explanations.mjs
 *
 * 필요 환경 변수 (.env):
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_SERVICE_ROLE_KEY
 *   GEMINI_API_KEY
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// ─── 설정 ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

// 한 번에 처리할 문항 수 (너무 크면 Rate Limit 위험)
const BATCH_SIZE = 50;
// 문항 간 딜레이 (ms) — 무료 티어: 1000ms, 유료: 300ms 추천
const DELAY_MS = 300;
// 실패 시 최대 재시도 횟수
const MAX_RETRY = 3;
// ─────────────────────────────────────────────────────────────────────────────

if (!SUPABASE_URL || !SUPABASE_KEY || !GEMINI_API_KEY) {
  console.error('❌ 환경 변수가 누락되었습니다. .env 파일을 확인해 주세요.');
  console.error('   필요: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const failedIds = [];

// ─── 유틸 ─────────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const formatOptions = (options) => {
  if (!Array.isArray(options)) return '';
  return options.map((opt, i) => `${i + 1}. ${opt}`).join('\n');
};

const formatContentBox = (contentBox) => {
  if (!Array.isArray(contentBox) || contentBox.length === 0) return '';
  return `\n[지문]\n${contentBox.join('\n')}`;
};

// ─── Gemini API 호출 ─────────────────────────────────────────────────────────
async function generateExplanation(question, retryCount = 0) {
  const { title, options, answer, content_box, subject } = question;
  const year = question.exams?.year || '';

  const answerText = Array.isArray(options) && options[answer - 1]
    ? `${answer}번 - ${options[answer - 1]}`
    : `${answer}번`;

  const prompt = `당신은 공인중개사 시험 전문 강사입니다. 아래 ${year}년 기출문제에 대한 해설을 작성해 주세요.

[과목] ${subject}
[문제] ${title}${formatContentBox(content_box)}
[선택지]
${formatOptions(options)}
[정답] ${answerText}

[지침]
1. 인삿말(예: "안녕하세요", "수험생 여러분")이나 도입부 문구는 절대 포함하지 마세요.
2. 즉시 "핵심 개념:"으로 시작하세요.
3. 각 항목은 간결하게 1~2문장으로 작성하세요.

[출력 형식]
핵심 개념: ...
정답 이유: ...
오답 포인트: ...
암기 포인트: ...`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,    // 낮을수록 일관성 있는 답변
            maxOutputTokens: 512,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API 오류 (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error('Gemini 응답이 비어있습니다.');
    return text.trim();

  } catch (err) {
    if (retryCount < MAX_RETRY) {
      console.warn(`  ⚠️  재시도 ${retryCount + 1}/${MAX_RETRY}: ${err.message}`);
      await sleep(2000 * (retryCount + 1)); // 재시도 시 딜레이 증가
      return generateExplanation(question, retryCount + 1);
    }
    throw err;
  }
}

// ─── 메인 실행 ────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Pass-Cast AI 해설 생성 시작\n');

  // 1. 전체 미처리 문항 수 확인
  // NULL과 빈 문자열 모두 대상
  const { count } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .in('subject', ['부동산학개론', '민법 및 민사특별법', '공인중개사법', '부동산공법', '부동산공시법 및 세법'])
    .or('explanation.is.null,explanation.eq.');

  console.log(`📊 처리 대상 문항: ${count}개\n`);
  if (count === 0) {
    console.log('✅ 모든 문항에 해설이 이미 있습니다!');
    return;
  }

  let processed = 0;
  let page = 0;

  while (true) {
    // 2. 50개씩 페이지네이션 조회
    const { data: questions, error } = await supabase
      .from('questions')
      .select(`
        id, number, title, options, answer, content_box, subject, exam_id,
        exams ( year )
      `)
      .in('subject', ['부동산학개론', '민법 및 민사특별법', '공인중개사법', '부동산공법', '부동산공시법 및 세법'])
      .or('explanation.is.null,explanation.eq.')
      .order('exam_id', { ascending: true })
      .order('number', { ascending: true })
      .range(0, BATCH_SIZE - 1);

    if (error) {
      console.error('❌ Supabase 조회 오류:', error.message);
      break;
    }

    if (!questions || questions.length === 0) {
      console.log('\n✅ 모든 문항 처리 완료!');
      break;
    }

    page++;
    console.log(`\n📄 배치 ${page} (${questions.length}개 처리 중...)`);
    console.log('━'.repeat(50));

    for (const q of questions) {
      const label = `[${q.exams?.year || ''}년 ${q.subject || ''} ${q.number}번]`;

      try {
        process.stdout.write(`  ⏳ ${label} 생성 중...`);
        const explanation = await generateExplanation(q);

        // 3. DB 업데이트
        const { error: updateError } = await supabase
          .from('questions')
          .update({
            explanation,
            explanation_verified: false,
          })
          .eq('id', q.id);

        if (updateError) throw updateError;

        processed++;
        process.stdout.write(` ✅ (${processed}/${count})\n`);

      } catch (err) {
        process.stdout.write(` ❌ 실패: ${err.message}\n`);
        failedIds.push({ id: q.id, label });
      }

      await sleep(DELAY_MS);
    }

    // Rate limit 방지를 위한 배치 간 추가 딜레이
    if (questions.length === BATCH_SIZE) {
      console.log('\n  ⏸️  다음 배치 대기 중 (2초)...');
      await sleep(2000);
    }
  }

  // ─── 최종 결과 보고 ──────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(50));
  console.log('📋 최종 결과 보고');
  console.log('═'.repeat(50));
  console.log(`✅ 성공: ${processed}개`);
  console.log(`❌ 실패: ${failedIds.length}개`);

  if (failedIds.length > 0) {
    console.log('\n실패 문항 목록:');
    failedIds.forEach(f => console.log(`  - ${f.label} (id: ${f.id})`));
    console.log('\n위 문항들은 스크립트를 다시 실행하면 재처리됩니다.');
  }

  console.log('\n🎉 완료! 이제 Pass-Cast에서 AI 해설을 확인하세요.');
}

main().catch(err => {
  console.error('❌ 예기치 못한 오류:', err);
  process.exit(1);
});
