const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.addEventListener('click', (event) => {
    if (event.target.matches('a')) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

// Entering the homepage should always begin at the hero, not at a restored
// scroll position or an old cross-page hash. Same-page navigation still works.
if (document.querySelector('#top.hero')) {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const resetHomepagePosition = () => {
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  window.addEventListener('pageshow', resetHomepagePosition);
  requestAnimationFrame(resetHomepagePosition);
}
