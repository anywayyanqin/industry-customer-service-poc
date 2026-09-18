(() => {
  if (mode !== 'activity') return;
  const tabs = document.querySelector('#tabs');
  if (!tabs) return;
  const keys = ['all', 'policy', 'research', 'salon'];
  tabs.setAttribute('aria-label', '活动分类');
  tabs.querySelectorAll('[data-filter]').forEach((button, index) => {
    button.dataset.category = keys[index];
    button.removeAttribute('data-filter');
  });
  function syncCategory() {
    const value = new URLSearchParams(location.search).get('category');
    const category = keys.includes(value) ? value : 'all';
    tabs.querySelectorAll('[data-category]').forEach(button => {
      const selected = button.dataset.category === category;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    document.dispatchEvent(new CustomEvent('activity-category-change', {detail: category}));
  }
  tabs.addEventListener('click', event => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    const url = new URL(location.href);
    if (button.dataset.category === 'all') url.searchParams.delete('category');
    else url.searchParams.set('category', button.dataset.category);
    url.hash = 'activity';
    history.pushState(null, '', url);
    syncCategory();
  });
  window.addEventListener('popstate', syncCategory);
  syncCategory();
})();
