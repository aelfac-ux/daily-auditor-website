import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, ADMIN_EMAIL } from './supabase-config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const loginView = document.querySelector('#login-view');
const dashboardView = document.querySelector('#dashboard-view');
const loginStatus = document.querySelector('#login-status');
const rows = document.querySelector('#feedback-rows');

const adminActions = dashboardView.querySelector('.admin-actions');
if (adminActions && !adminActions.querySelector('[href*="day-9-gas-twse-alert"]')) {
  const editDay9 = document.createElement('a');
  editDay9.className = 'button primary';
  editDay9.href = 'https://github.com/aelfac-ux/daily-auditor-website/edit/main/articles/day-9-gas-twse-alert.html';
  editDay9.textContent = '編輯 Day 09';
  adminActions.insertBefore(editDay9, document.querySelector('#refresh-button'));
}
if (adminActions && !adminActions.querySelector('[href*="day-10-apps-script-scheduling"]')) {
  const editDay10 = document.createElement('a');
  editDay10.className = 'button primary';
  editDay10.href = 'https://github.com/aelfac-ux/daily-auditor-website/edit/main/articles/day-10-apps-script-scheduling.html';
  editDay10.textContent = '編輯 Day 10';
  adminActions.insertBefore(editDay10, document.querySelector('#refresh-button'));
}
if (adminActions && !adminActions.querySelector('[href*="day-11-twse-alert-field-test"]')) {
  const editDay11 = document.createElement('a');
  editDay11.className = 'button primary';
  editDay11.href = 'https://github.com/aelfac-ux/daily-auditor-website/edit/main/articles/day-11-twse-alert-field-test.html';
  editDay11.textContent = '編輯 Day 11';
  adminActions.insertBefore(editDay11, document.querySelector('#refresh-button'));
}
if (adminActions && !adminActions.querySelector('[href*="day-12-ai-era-working-papers"]')) {
  const editDay12 = document.createElement('a');
  editDay12.className = 'button primary';
  editDay12.href = 'https://github.com/aelfac-ux/daily-auditor-website/edit/main/articles/day-12-ai-era-working-papers.html';
  editDay12.textContent = '編輯 Day 12';
  adminActions.insertBefore(editDay12, document.querySelector('#refresh-button'));
}
if (adminActions && !adminActions.querySelector('[href*="day-13-minerva-ai-audit-reasoning"]')) {
  const editDay13 = document.createElement('a');
  editDay13.className = 'button primary';
  editDay13.href = 'https://github.com/aelfac-ux/daily-auditor-website/edit/main/articles/day-13-minerva-ai-audit-reasoning.html';
  editDay13.textContent = '編輯 Day 13';
  adminActions.insertBefore(editDay13, document.querySelector('#refresh-button'));
}
if (adminActions && !adminActions.querySelector('[href*="day-14-minerva-long-term-memory"]')) {
  const editDay14 = document.createElement('a');
  editDay14.className = 'button primary';
  editDay14.href = 'https://github.com/aelfac-ux/daily-auditor-website/edit/main/articles/day-14-minerva-long-term-memory.html';
  editDay14.textContent = '編輯 Day 14';
  adminActions.insertBefore(editDay14, document.querySelector('#refresh-button'));
}

async function loadFeedback() {
  rows.innerHTML = '<tr><td colspan="4">載入中…</td></tr>';
  const { data, error } = await supabase.from('article_feedback').select('*').order('created_at', { ascending: false }).limit(500);
  if (error) {
    rows.innerHTML = '<tr><td colspan="4">無法讀取資料，請確認登入身分。</td></tr>';
    return;
  }
  document.querySelector('#feedback-summary').textContent = `共收到 ${data.length} 筆回饋`;
  rows.innerHTML = data.length ? data.map((item) => `<tr><td>${new Date(item.created_at).toLocaleString('zh-TW')}</td><td>${escapeHtml(item.article_slug)}</td><td>${item.rating} / 10</td><td>${escapeHtml(item.comment || '—')}</td></tr>`).join('') : '<tr><td colspan="4">尚無回饋</td></tr>';
}

function escapeHtml(value) {
  const node = document.createElement('div');
  node.textContent = value;
  return node.innerHTML;
}

async function renderSession() {
  const { data: { session } } = await supabase.auth.getSession();
  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL;
  loginView.classList.toggle('hidden', isAdmin);
  dashboardView.classList.toggle('hidden', !isAdmin);
  if (isAdmin) {
    document.querySelector('#admin-identity').textContent = `已登入：${session.user.email}`;
    await loadFeedback();
  }
}

document.querySelector('#login-button').addEventListener('click', async () => {
  loginStatus.textContent = '正在寄送…';
  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  const { error } = await supabase.auth.signInWithOtp({ email: ADMIN_EMAIL, options: { emailRedirectTo: redirectTo, shouldCreateUser: true } });
  loginStatus.textContent = error ? '寄送失敗，請稍後再試。' : `登入連結已寄到 ${ADMIN_EMAIL}`;
});

document.querySelector('#refresh-button').addEventListener('click', loadFeedback);
document.querySelector('#logout-button').addEventListener('click', async () => { await supabase.auth.signOut(); await renderSession(); });
supabase.auth.onAuthStateChange(() => { setTimeout(renderSession, 0); });
renderSession();
