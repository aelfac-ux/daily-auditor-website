import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, ADMIN_EMAIL } from './supabase-config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const loginView = document.querySelector('#login-view');
const dashboardView = document.querySelector('#dashboard-view');
const loginStatus = document.querySelector('#login-status');
const rows = document.querySelector('#feedback-rows');

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
