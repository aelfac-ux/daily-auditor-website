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
  rpc('get_popular_articles', { p_limit: 4 }).then((items) => {
    if (!Array.isArray(items) || !items.length) return;
    const catalog = JSON.parse(popularList.dataset.catalog || '{}');
    popularList.innerHTML = items.filter((item) => catalog[item.article_slug]).map((item, index) => {
      const article = catalog[item.article_slug];
      return `<li><span>${String(index + 1).padStart(2, '0')}</span><a href="${article.href}">${article.title}</a><small>${Number(item.view_count).toLocaleString('zh-TW')} 次閱讀</small></li>`;
    }).join('');
  }).catch(() => {});
}
