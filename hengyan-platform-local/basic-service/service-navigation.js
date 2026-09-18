(() => {
  if (!document.querySelector('link[href*="platform-foundation.css"]')) {
    const base = document.createElement('link');
    base.rel = 'stylesheet';
    base.href = 'platform-foundation.css?v=20260918-5';
    document.head.append(base);
  }
  if (!document.querySelector('script[src*="application-drawer.js"]')) {
    const drawer = document.createElement('script');
    drawer.src = 'application-drawer.js?v=20260918-6';
    document.head.append(drawer);
  }
  const nav = [...document.querySelectorAll('nav a,nav button,.header a,.header button')].find(item => item.textContent.trim() === '基础服务');
  if (!nav) return;
  if (nav.tagName === 'A') nav.href = 'basic-service-home.html';
  nav.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    location.href = 'basic-service-home.html';
  }, true);
})();
