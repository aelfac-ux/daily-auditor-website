import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, ADMIN_EMAIL } from './supabase-config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const rows = document.querySelector('#view-rows');
const summary = document.querySelector('#view-summary');
const labels = {
  'day-1-ai-auditor-beyond-prompt': 'DAY 01｜AI 時代來了，為何不能只學 Prompt？',
  'day-2-audit-algorithms': 'DAY 02｜從查核憑證到查核演算法',
  'day-3-ai-private-local-audit': 'DAY 03｜本機 Python 守住公司資料',
  'day-4-auditor-second-brain': 'DAY 04｜稽核人員的第二大腦',
  'day-5-ai-agent-vs-rpa': 'DAY 05｜AI Agent 與 RPA 有何不同？'
};

function escapeHtml(value) {
  const node = document.createElement('div'); node.textContent = value; return node.innerHTML;
}

async function loadViewStats() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user?.email?.toLowerCase() !== ADMIN_EMAIL) return;
  rows.innerHTML = '<tr><td colspan="5">載入瀏覽資料…</td></tr>';
  const { data, error } = await supabase.rpc('get_article_view_stats');
  if (error) { rows.innerHTML = '<tr><td colspan="5">統計功能尚未完成資料庫啟用。</td></tr>'; return; }
  const completeData = Object.keys(labels).map((slug) => data.find((item) => item.article_slug === slug) || { article_slug: slug, total_views: 0, views_24h: 0, views_7d: 0, last_viewed_at: null }).reverse();
  const total = completeData.reduce((sum, item) => sum + Number(item.total_views), 0);
  const day = completeData.reduce((sum, item) => sum + Number(item.views_24h), 0);
  const week = completeData.reduce((sum, item) => sum + Number(item.views_7d), 0);
  summary.innerHTML = `<div class="stat-card"><strong>${total.toLocaleString('zh-TW')}</strong><span>累計有效瀏覽</span></div><div class="stat-card"><strong>${day.toLocaleString('zh-TW')}</strong><span>最近 24 小時</span></div><div class="stat-card"><strong>${week.toLocaleString('zh-TW')}</strong><span>最近 7 天</span></div>`;
  rows.innerHTML = completeData.map((item) => `<tr><td>${escapeHtml(labels[item.article_slug] || item.article_slug)}</td><td>${Number(item.total_views).toLocaleString('zh-TW')}</td><td>${Number(item.views_24h).toLocaleString('zh-TW')}</td><td>${Number(item.views_7d).toLocaleString('zh-TW')}</td><td>${item.last_viewed_at ? new Date(item.last_viewed_at).toLocaleString('zh-TW') : '尚無瀏覽'}</td></tr>`).join('');
}

document.querySelector('#refresh-views')?.addEventListener('click', loadViewStats);
supabase.auth.onAuthStateChange(() => setTimeout(loadViewStats, 0));
loadViewStats();
