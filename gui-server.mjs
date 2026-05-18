/**
 * Pass-Cast: AI 해설 생성 GUI 서버
 * 실행: node gui-server.mjs
 * 브라우저에서 http://localhost:3456 접속
 */

import http from 'http';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3456;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';
const BATCH_SIZE = 50;
const DELAY_MS = 300;
const MAX_RETRY = 3;

const SUBJECTS = ['부동산학개론', '민법 및 민사특별법', '공인중개사법', '부동산공법', '부동산공시법 및 세법'];

// ─── HTML UI ─────────────────────────────────────────────────────────────────
const HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pass-Cast | AI 해설 생성기</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',sans-serif;background:#0A0A0A;color:#fff;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:40px 20px}
  .logo{display:flex;align-items:center;gap:12px;margin-bottom:40px}
  .logo-icon{width:48px;height:48px;background:#D4AF37;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:22px;color:#0A0A0A}
  .logo-text{font-size:24px;font-weight:900;letter-spacing:-1px}
  .logo-sub{font-size:10px;font-weight:700;color:#D4AF37;letter-spacing:4px;text-transform:uppercase}
  .card{background:#111;border:1px solid #222;border-radius:24px;padding:40px;width:100%;max-width:720px;margin-bottom:24px}
  h2{font-size:20px;font-weight:900;margin-bottom:8px;letter-spacing:-0.5px}
  p.sub{font-size:13px;color:#555;margin-bottom:28px}
  .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:28px}
  .stat{background:#0A0A0A;border:1px solid #1e1e1e;border-radius:16px;padding:20px;text-align:center}
  .stat-val{font-size:32px;font-weight:900;color:#D4AF37}
  .stat-lbl{font-size:10px;color:#444;text-transform:uppercase;letter-spacing:2px;margin-top:4px}
  .progress-wrap{background:#0A0A0A;border-radius:100px;height:12px;overflow:hidden;margin-bottom:8px}
  .progress-bar{height:100%;background:linear-gradient(90deg,#D4AF37,#f0d060);border-radius:100px;transition:width 0.5s ease;width:0%}
  .progress-pct{text-align:right;font-size:12px;color:#555;margin-bottom:28px}
  .btn{width:100%;padding:18px;border-radius:16px;border:none;font-size:16px;font-weight:900;cursor:pointer;letter-spacing:-0.5px;transition:all 0.2s}
  .btn-start{background:#D4AF37;color:#0A0A0A}
  .btn-start:hover{background:#f0d060;transform:scale(1.01)}
  .btn-start:disabled{background:#333;color:#555;cursor:not-allowed;transform:none}
  .btn-stop{background:#1a0000;color:#ff4444;border:1px solid #ff4444;margin-top:12px}
  .btn-stop:hover{background:#ff4444;color:#fff}
  .btn-stop:disabled{display:none}
  .log-card{background:#111;border:1px solid #222;border-radius:24px;padding:40px;width:100%;max-width:720px}
  .log-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
  .log-header h3{font-size:14px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:2px}
  .log-clear{font-size:11px;color:#333;cursor:pointer;border:none;background:none;color:#444}
  .log-clear:hover{color:#D4AF37}
  #log{background:#0A0A0A;border-radius:12px;padding:20px;height:320px;overflow-y:auto;font-family:monospace;font-size:12px;line-height:1.8}
  .log-ok{color:#22c55e}
  .log-err{color:#ef4444}
  .log-warn{color:#f59e0b}
  .log-info{color:#888}
  .log-title{color:#D4AF37;font-weight:700}
  .badge{display:inline-block;padding:3px 10px;border-radius:100px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px}
  .badge-running{background:#D4AF37;color:#0A0A0A}
  .badge-done{background:#22c55e;color:#fff}
  .badge-idle{background:#222;color:#555}
  #status-badge{margin-left:12px}
</style>
</head>
<body>
<div class="logo">
  <div class="logo-icon">P</div>
  <div>
    <div class="logo-text">Pass-Cast</div>
    <div class="logo-sub">AI 해설 생성기</div>
  </div>
</div>

<div class="card">
  <h2>공인중개사 기출문제 AI 해설 자동 생성 <span id="status-badge" class="badge badge-idle">대기 중</span></h2>
  <p class="sub">버튼을 누르면 해설이 없는 모든 문항에 대해 Gemini AI가 자동으로 해설을 생성합니다.</p>

  <div class="stats">
    <div class="stat">
      <div class="stat-val" id="stat-total">-</div>
      <div class="stat-lbl">처리 대상</div>
    </div>
    <div class="stat">
      <div class="stat-val" id="stat-done">0</div>
      <div class="stat-lbl">완료</div>
    </div>
    <div class="stat">
      <div class="stat-val" id="stat-fail">0</div>
      <div class="stat-lbl">실패</div>
    </div>
  </div>

  <div class="progress-wrap">
    <div class="progress-bar" id="progress-bar"></div>
  </div>
  <div class="progress-pct" id="progress-pct">0%</div>

  <button class="btn btn-start" id="btn-start" onclick="startGeneration()">🚀 AI 해설 생성 시작</button>
  <button class="btn btn-stop" id="btn-stop" disabled onclick="stopGeneration()">⏹ 중단하기</button>
</div>

<div class="log-card">
  <div class="log-header">
    <h3>실시간 로그</h3>
    <button class="log-clear" onclick="document.getElementById('log').innerHTML=''">로그 지우기</button>
  </div>
  <div id="log"><span class="log-info">시작 버튼을 누르면 로그가 여기에 표시됩니다...</span></div>
</div>

<script>
let evtSource = null;
let total = 0;
let done = 0;
let failed = 0;

function log(msg, cls='log-info') {
  const el = document.getElementById('log');
  const line = document.createElement('div');
  line.className = cls;
  line.textContent = msg;
  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
}

function updateStats() {
  document.getElementById('stat-done').textContent = done;
  document.getElementById('stat-fail').textContent = failed;
  if (total > 0) {
    const pct = Math.round((done + failed) / total * 100);
    document.getElementById('progress-bar').style.width = pct + '%';
    document.getElementById('progress-pct').textContent = pct + '%';
  }
}

async function startGeneration() {
  document.getElementById('btn-start').disabled = true;
  document.getElementById('btn-stop').disabled = false;
  document.getElementById('status-badge').className = 'badge badge-running';
  document.getElementById('status-badge').textContent = '실행 중';
  document.getElementById('log').innerHTML = '';
  done = 0; failed = 0;
  updateStats();

  evtSource = new EventSource('/generate');

  evtSource.addEventListener('start', e => {
    const d = JSON.parse(e.data);
    total = d.total;
    document.getElementById('stat-total').textContent = total;
    log('🚀 AI 해설 생성 시작 — 총 ' + total + '개 문항', 'log-title');
  });

  evtSource.addEventListener('progress', e => {
    const d = JSON.parse(e.data);
    if (d.success) {
      done++;
      log('✅ ' + d.label + ' (' + (done + failed) + '/' + total + ')', 'log-ok');
    } else {
      failed++;
      log('❌ ' + d.label + ' 실패: ' + d.error, 'log-err');
    }
    updateStats();
  });

  evtSource.addEventListener('warn', e => {
    log('⚠️  ' + JSON.parse(e.data).message, 'log-warn');
  });

  evtSource.addEventListener('batch', e => {
    const d = JSON.parse(e.data);
    log('\\n📄 배치 ' + d.batch + ' 시작 (' + d.size + '개)', 'log-info');
  });

  evtSource.addEventListener('done', e => {
    const d = JSON.parse(e.data);
    log('\\n🎉 완료! 성공: ' + d.success + '개 / 실패: ' + d.failed + '개', 'log-title');
    cleanup(true);
  });

  evtSource.addEventListener('error', () => {
    log('❌ 연결 오류. 서버를 확인해 주세요.', 'log-err');
    cleanup(false);
  });
}

function stopGeneration() {
  fetch('/stop').then(() => {
    log('⏹ 사용자가 중단했습니다.', 'log-warn');
    cleanup(false);
  });
}

function cleanup(success) {
  if (evtSource) { evtSource.close(); evtSource = null; }
  document.getElementById('btn-start').disabled = false;
  document.getElementById('btn-stop').disabled = true;
  document.getElementById('status-badge').className = 'badge ' + (success ? 'badge-done' : 'badge-idle');
  document.getElementById('status-badge').textContent = success ? '완료' : '대기 중';
}
</script>
</body>
</html>`;

// ─── 해설 생성 로직 ───────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

const formatOptions = opts => Array.isArray(opts) ? opts.map((o, i) => `${i+1}. ${o}`).join('\n') : '';
const formatContentBox = cb => Array.isArray(cb) && cb.length ? `\n[지문]\n${cb.join('\n')}` : '';

let stopFlag = false;

async function generateExplanation(q, retryCount = 0) {
  const year = q.exams?.year || '';
  const subject = q.subject || '';
  const answerText = Array.isArray(q.options) && q.options[q.answer - 1]
    ? `${q.answer}번 - ${q.options[q.answer - 1]}`
    : `${q.answer}번`;

  const prompt = `당신은 공인중개사 시험 전문 강사입니다. 아래 ${year}년 기출문제에 대한 해설을 작성해 주세요.

[과목] ${subject}
[문제] ${q.title}${formatContentBox(q.content_box)}
[선택지]
${formatOptions(q.options)}
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

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 512 }
      })
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API 오류 (${res.status}): ${err}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini 응답이 비어있습니다.');
  return text.trim();
}

async function runGeneration(send) {
  stopFlag = false;
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const { count } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .in('subject', SUBJECTS)
    .or('explanation.is.null,explanation.eq.');

  send('start', { total: count });

  let successCount = 0, failedCount = 0, batch = 0;

  while (!stopFlag) {
    const { data: questions, error } = await supabase
      .from('questions')
      .select('id, number, title, options, answer, content_box, subject, exam_id, exams(year)')
      .in('subject', SUBJECTS)
      .or('explanation.is.null,explanation.eq.')
      .order('exam_id', { ascending: true })
      .order('number', { ascending: true })
      .range(0, BATCH_SIZE - 1);

    if (error || !questions || questions.length === 0) break;

    batch++;
    send('batch', { batch, size: questions.length });

    for (const q of questions) {
      if (stopFlag) break;
      const label = `[${q.exams?.year || ''}년 ${q.subject || ''} ${q.number}번]`;

      try {
        const explanation = await generateExplanation(q);
        const { error: upErr } = await supabase
          .from('questions')
          .update({ explanation, explanation_verified: false })
          .eq('id', q.id);

        if (upErr) throw upErr;
        successCount++;
        send('progress', { success: true, label });
      } catch (err) {
        failedCount++;
        send('progress', { success: false, label, error: err.message.substring(0, 80) });
      }
      await sleep(DELAY_MS);
    }

    if (questions.length < BATCH_SIZE) break;
    await sleep(2000);
  }

  send('done', { success: successCount, failed: failedCount });
}

// ─── HTTP 서버 ────────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(HTML);
  }

  if (req.url === '/stop') {
    stopFlag = true;
    res.writeHead(200);
    return res.end('stopped');
  }

  if (req.url === '/generate') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    const send = (event, data) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    runGeneration(send).catch(err => {
      send('error', { message: err.message });
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`\n🚀 Pass-Cast AI 해설 생성 GUI 서버 실행 중`);
  console.log(`📡 브라우저에서 열기: http://localhost:${PORT}`);
  console.log(`\n종료하려면 Ctrl+C 를 누르세요.\n`);

  // Windows에서 브라우저 자동 오픈
  import('child_process').then(({ exec }) => {
    exec(`start http://localhost:${PORT}`);
  });
});
