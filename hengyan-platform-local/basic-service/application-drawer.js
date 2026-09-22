(() => {
  if (window.basicApplicationDrawerBound) return;
  window.basicApplicationDrawerBound = true;
  const assetBase = new URL('.', document.currentScript.src);
  const host = window.top.location.origin === location.origin ? window.top : window;
  const embedded = new URLSearchParams(location.search).get('applicationEmbed') === '1';
  function addStyle(doc) {
    if (doc.querySelector('[data-application-drawer-style]')) return;
    const link = doc.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('application-drawer.css?v=20260918-6', assetBase).href;
    link.dataset.applicationDrawerStyle = '';
    doc.head.append(link);
  }
  if (!host.BasicServiceDrawer) {
    const doc = host.document;
    addStyle(doc);
    let dialog, frame, previousFocus;
    function close() {
      if (!dialog?.open) return;
      dialog.close();
    }
    function mount() {
      if (dialog) return;
      dialog = doc.createElement('dialog');
      dialog.className = 'application-drawer';
      dialog.setAttribute('aria-labelledby', 'application-drawer-title');
      dialog.innerHTML = '<div class="application-drawer-bar"><h2 id="application-drawer-title">服务申请</h2><button type="button" data-drawer-expand aria-pressed="false">全屏办理</button><button type="button" data-drawer-close aria-label="关闭申请">×</button></div><iframe class="application-drawer-frame" title="服务申请表单"></iframe>';
      doc.body.append(dialog);
      frame = dialog.querySelector('iframe');
      dialog.querySelector('[data-drawer-close]').onclick = close;
      dialog.querySelector('[data-drawer-expand]').onclick = event => {
        const full = dialog.classList.toggle('is-fullscreen');
        event.currentTarget.textContent = full ? '收起全屏' : '全屏办理';
        event.currentTarget.setAttribute('aria-pressed', String(full));
      };
      dialog.addEventListener('click', event => {
        if (event.target === dialog && event.clientX < dialog.getBoundingClientRect().left) close();
      });
      dialog.addEventListener('close', () => {
        doc.documentElement.classList.remove('application-drawer-open');
        frame.src = 'about:blank';
        if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
      });
      frame.addEventListener('load', () => {
        if (!dialog.open || frame.contentWindow.location.href === 'about:blank') return;
        const content = frame.contentDocument;
        const title = (content.querySelector('#application-view-v2 h1, #action-title') || content.querySelector('h1'))?.textContent.trim() || '服务申请';
        dialog.querySelector('h2').textContent = title;
        frame.title = title;
      });
    }
    host.BasicServiceDrawer = {
      open(url, source) {
        const target = new URL(url, assetBase);
        if (target.origin !== location.origin || !/\/basic-service\/(index|hedge-accounting-apply|activity-application|talent-application|service-hubs)\.html$/.test(target.pathname)) return;
        target.searchParams.set('applicationEmbed', '1');
        mount();
        previousFocus = source || doc.activeElement;
        dialog.classList.remove('is-fullscreen');
        const expand = dialog.querySelector('[data-drawer-expand]');
        expand.textContent = '全屏办理';
        expand.setAttribute('aria-pressed', 'false');
        dialog.querySelector('h2').textContent = '服务申请';
        frame.src = target.href;
        doc.documentElement.classList.add('application-drawer-open');
        if (!dialog.open) dialog.showModal();
      },
      close,
      complete() {
        close();
        const entry = doc.querySelector('.workspace-entry');
        if (entry) entry.click();
        else host.location.href = new URL('index.html#workbench', assetBase).href;
      }
    };
  }
  if (embedded) {
    addStyle(document);
    document.body.classList.add('application-embedded');
    const form = document.querySelector('#apply-form-v2, #hedge-form, #form, #detail #apply-form');
    if (form) {
      form.classList.add('application-form-root');
      for (let parent = form.parentElement; parent; parent = parent.parentElement) {
        parent.classList.add('application-form-path');
        if (parent === document.body) break;
      }
    }
    window.addEventListener('click', event => {
      const control = event.target.closest('a,button');
      if (!control) return;
      const action = control.getAttribute('data-action');
      const href = control.getAttribute('href') || control.getAttribute('data-go') || '';
      if (action === 'back-service' || control.hasAttribute('data-back') || control.id === 'change-link' || /(?:service\.html|detail\.html)/.test(href)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        host.BasicServiceDrawer.close();
      }
    }, true);
    window.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        host.BasicServiceDrawer.close();
      }
    });
    return;
  }
  window.addEventListener('click', event => {
    const control = event.target.closest('[data-application-url],a,button,[data-go],[data-link],[data-page-link]');
    if (!control || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    let target = control.getAttribute('data-application-url');
    const destination = control.getAttribute('href') || control.getAttribute('data-go') || control.getAttribute('data-link') || control.getAttribute('data-page-link');
    if (!target && destination) {
      const candidate = new URL(destination, location.href);
      if (/\/(hedge-accounting-apply|activity-application|talent-application)\.html$/.test(candidate.pathname)) target = candidate.href;
    }
    if (!target && /\/basic-service\/index\.html$/.test(location.pathname) && (control.dataset.action === 'apply' || control.hasAttribute('data-material-apply'))) {
      const type = document.querySelector('.choice.active')?.dataset.type || '综合分析';
      target = 'index.html?type=' + encodeURIComponent(type) + '#apply';
      document.querySelectorAll('.modal-mask.open').forEach(modal => modal.classList.remove('open'));
    }
    if (!target && control.hasAttribute('data-apply')) target = 'activity-application.html?id=' + encodeURIComponent(control.dataset.apply);
    if (!target && control.id === 'apply' && location.pathname.endsWith('/activity-detail.html')) target = 'activity-application.html?id=' + encodeURIComponent(new URLSearchParams(location.search).get('id') || 'policy-live');
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    control.closest('dialog')?.close();
    host.BasicServiceDrawer.open(target, control);
  }, true);
  if (location.pathname.endsWith('/service-hubs.html')) {
    const query = new URLSearchParams(location.search);
    const service = query.get('service');
    let target;
    if (service === 'talent-demand' || service === 'exchange-internship') target = 'talent-application.html?service=' + service;
    if (service === 'expert-pool' && query.get('expert')) target = location.href;
    if (target) {
      const center = new URL(location.href);
      center.searchParams.delete('service');
      center.searchParams.delete('expert');
      history.replaceState(null, '', center);
      host.BasicServiceDrawer.open(target);
    }
  }
})();
