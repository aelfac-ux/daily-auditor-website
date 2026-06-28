import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './supabase-config.js';

const widget = document.querySelector('.feedback-widget');
if (widget) {
  const form = widget.querySelector('form');
  const scale = widget.querySelector('.rating-scale');
  const status = widget.querySelector('.feedback-status');

  for (let score = 1; score <= 10; score += 1) {
    const option = document.createElement('span');
    option.className = 'rating-option';
    option.innerHTML = `<input id="rating-${score}" type="radio" name="rating" value="${score}" required><label for="rating-${score}" title="${score} 分">★<small>${score}</small></label>`;
    scale.append(option);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const rating = Number(data.get('rating'));
    const comment = String(data.get('comment') || '').trim();
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    status.textContent = '正在送出…';

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/article_feedback`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({ article_slug: widget.dataset.articleSlug, rating, comment: comment || null })
      });
      if (!response.ok) throw new Error('Feedback request failed');
      form.reset();
      status.textContent = '謝謝你的回饋，已成功送出。';
    } catch {
      status.textContent = '暫時無法送出，請稍後再試。';
    } finally {
      button.disabled = false;
    }
  });
}
