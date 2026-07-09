import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './supabase-config.js';

const headers = { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`, 'Content-Type': 'application/json' };
async function rpc(name, body) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, { method: 'POST', headers, body: JSON.stringify(body || {}) });
  if (!response.ok) throw new Error(`${name} failed`);
  return response.json();
}

const articleSlug = document.body.dataset.articleSlug;
if (articleSlug) rpc('record_article_view', { p_article_slug: articleSlug }).catch(() => {});

const popularList = document.querySelector('#popular-articles');
if (popularList) {
  const catalog = JSON.parse(popularList.dataset.catalog || '{}');
  const english = document.documentElement.lang === 'en';
  catalog['day-9-gas-twse-alert'] = {
    title: english ? 'Build a TWSE Disclosure Email Watcher' : '用 Apps Script 打造重大訊息瞭望台',
    href: 'articles/day-9-gas-twse-alert.html'
  };
  catalog['day-10-apps-script-scheduling'] = {
    title: english ? 'Make Your Disclosure Watcher Sail Every Day' : '讓重大訊息瞭望台每天自動啟航',
    href: 'articles/day-10-apps-script-scheduling.html'
  };
  catalog['day-11-twse-alert-field-test'] = {
    title: english ? 'From AI Code to Your First TWSE Disclosure Email' : '從 AI 程式碼到第一封重大訊息通知',
    href: 'articles/day-11-twse-alert-field-test.html'
  };
  catalog['day-12-ai-era-working-papers'] = {
    title: english ? 'What Will AI-Era Working Papers Look Like?' : 'AI 時代的工作底稿將長什麼樣子？',
    href: 'articles/day-12-ai-era-working-papers.html'
  };
  catalog['day-13-minerva-ai-audit-reasoning'] = {
    title: english ? 'If AI Can Draft the Paper, What Is the Auditor For?' : 'AI 能寫漂亮底稿，稽核人員還剩下什麼？',
    href: 'articles/day-13-minerva-ai-audit-reasoning.html'
  };
  catalog['day-14-minerva-long-term-memory'] = {
    title: english ? 'Minerva Thinking Models: Train AI Long-Term Memory as a Reasoning Library' : '密涅瓦思維模型：把 AI 長期記憶訓練成推理習慣庫',
    href: 'articles/day-14-minerva-long-term-memory.html'
  };
  popularList.dataset.catalog = JSON.stringify(catalog);
  popularList.innerHTML = `<li><span>NEW</span><a href="${catalog['day-14-minerva-long-term-memory'].href}">${catalog['day-14-minerva-long-term-memory'].title}</a><small>${english ? 'Latest release' : '最新發布'}</small></li>`;

  rpc('get_popular_articles', { p_limit: 4 }).then((items) => {
    if (!Array.isArray(items) || !items.length) return;
    popularList.innerHTML = items.filter((item) => catalog[item.article_slug]).map((item, index) => {
      const article = catalog[item.article_slug];
      const countLabel = english ? `${Number(item.view_count).toLocaleString('en-US')} reads` : `${Number(item.view_count).toLocaleString('zh-TW')} 次閱讀`;
      return `<li><span>${String(index + 1).padStart(2, '0')}</span><a href="${article.href}">${article.title}</a><small>${countLabel}</small></li>`;
    }).join('');
  }).catch(() => {});
}
