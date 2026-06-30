const currentLanguage = document.documentElement.lang.toLowerCase().startsWith('en') ? 'en' : 'zh-Hant';
const targetLanguage = currentLanguage === 'en' ? 'zh-Hant' : 'en';
const alternate = document.querySelector(`link[rel="alternate"][hreflang="${targetLanguage}"]`);

if (alternate) {
  const switcher = document.createElement('a');
  switcher.className = 'language-switch';
  switcher.href = alternate.href;
  switcher.textContent = currentLanguage === 'en' ? '中文' : 'EN';
  switcher.setAttribute('aria-label', currentLanguage === 'en' ? '閱讀繁體中文版' : 'Read in English');
  switcher.addEventListener('click', () => localStorage.setItem('preferredLanguage', targetLanguage));
  document.body.append(switcher);

  const saved = localStorage.getItem('preferredLanguage');
  const browserLanguages = navigator.languages || [navigator.language || ''];
  const prefersChinese = browserLanguages.some((item) => item.toLowerCase().startsWith('zh'));
  const suggested = prefersChinese ? 'zh-Hant' : 'en';

  if (!saved && suggested !== currentLanguage) {
    const notice = document.createElement('aside');
    notice.className = 'language-suggestion';
    notice.setAttribute('aria-live', 'polite');
    notice.innerHTML = `<span>${currentLanguage === 'en' ? 'Prefer reading in Chinese?' : 'Looks like you prefer English.'}</span><a href="${alternate.href}">${currentLanguage === 'en' ? '閱讀中文版' : 'Read in English'} →</a><button type="button" aria-label="${currentLanguage === 'en' ? 'Dismiss language suggestion' : '關閉語言提示'}">×</button>`;
    notice.querySelector('a').addEventListener('click', () => localStorage.setItem('preferredLanguage', targetLanguage));
    notice.querySelector('button').addEventListener('click', () => notice.remove());
    document.body.append(notice);
  }
}
