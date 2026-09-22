(() => {
  if (mode !== 'talent') return;
  document.body.classList.add('talent-center-mode');
  const experts = [
    {id: 'zhou', name: '周明远', role: '能源化工产业专家', avatar: 'expert-zhou.svg', tags: ['能源化工', '产业研究'], desc: '长期跟踪能源化工产业链，擅长经营风险识别与套期保值方案研判。', detail: '重点支持能源化工企业开展产业趋势研究、价格风险识别、风险敞口梳理及套期保值方案交流。'},
    {id: 'li', name: '李嘉禾', role: '金属风险管理专家', avatar: 'expert-li.svg', tags: ['有色金属', '基差贸易'], desc: '具备有色金属产业与基差业务经验，关注采购销售风险和业务执行。', detail: '可围绕有色金属采购、库存与销售场景，提供基差贸易、套保执行及风险控制方面的专业交流。'},
    {id: 'wang', name: '王若琳', role: '农产品产业研究专家', avatar: 'expert-wang.svg', tags: ['农产品', '期权应用'], desc: '专注农产品产业链研究，熟悉企业经营场景中的期权保护策略。', detail: '重点支持农产品产业供需研究、价格波动分析，以及采购和库存场景下的期权策略交流。'},
    {id: 'chen', name: '陈思远', role: '套期会计与财务专家', avatar: 'expert-chen.svg', tags: ['套期会计', '信息披露'], desc: '熟悉套期关系指定、会计核算、有效性评估及企业信息披露。', detail: '可围绕套期会计适用条件、业务与财务协同、文档管理及披露要求提供专业咨询。'}
  ];
  const services = talent.filter(service => ['talent-demand', 'exchange-internship'].includes(service.id));
  const narrowScreen = window.matchMedia('(max-width:800px)');
  let previewPage = 0, previewSize = narrowScreen.matches ? 1 : 2, selectedExpert = null;
  const applicationUrl = expert => `service-hubs.html?service=expert-pool&expert=${encodeURIComponent(expert.id)}#talent`;
  const style = document.createElement('style');
  style.textContent = `
    #hub.talent-directory{display:grid;grid-template-columns:minmax(240px,.8fr) minmax(0,2fr);gap:16px;padding:0;border:0;background:transparent}
    #hub.talent-directory[hidden]{display:none}
    .talent-service-directory,.talent-library{padding:18px 20px;background:#fff;border:1px solid var(--l);border-radius:6px}
    .talent-directory-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
    .talent-directory-heading h2{margin:0;font-size:18px}.talent-directory-heading span{color:var(--m);font-size:12px}
    .talent-service-link{width:100%;display:flex;justify-content:space-between;gap:12px;text-align:left;border:1px solid var(--l);background:#fff;color:var(--i);padding:18px 14px;margin-top:12px;cursor:pointer;border-radius:5px}
    .talent-service-link:hover{border-color:var(--b);color:var(--b)}.talent-service-link span{color:var(--b)}
    .talent-expert-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .talent-expert-card{border:1px solid var(--l);padding:14px;border-radius:5px;min-width:0}
    .talent-expert-top{display:flex;align-items:center;gap:10px}.talent-expert-top img{width:48px;height:56px;object-fit:cover;border-radius:4px}
    .talent-expert-top h3{margin:0;font-size:16px}.talent-expert-top small{font-size:12px;color:var(--m)}
    .talent-expert-top button{border:0;background:transparent;color:var(--i);padding:0;cursor:pointer;font-weight:700}
    .talent-expert-tags{margin:10px 0;color:var(--m);font-size:12px}.talent-expert-actions{display:flex;align-items:center;justify-content:space-between;gap:8px}
    .talent-expert-actions button{border:0;padding:0;background:transparent;color:var(--b);cursor:pointer}
    .talent-expert-actions a,.talent-expert-dialog .expert-book{display:inline-block;text-decoration:none;background:var(--b);color:#fff;padding:5px 12px;border-radius:5px}
    .talent-library-footer{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-top:12px}.talent-library-footer button{padding:5px 10px}
    .talent-page-controls{display:flex;align-items:center;gap:8px}.talent-page-controls span{font-size:12px;color:var(--m)}
    .talent-more,.talent-catalog-back{color:var(--b);text-decoration:none;font-size:13px}.talent-more:hover,.talent-catalog-back:hover{text-decoration:underline}
    .talent-service-directory .talent-library-footer{justify-content:flex-end}
    #talent-catalog{padding:18px 20px}#talent-catalog[hidden],#talent-catalog [hidden]{display:none}
    .talent-catalog-header{border-bottom:1px solid var(--l);padding-bottom:14px;margin:12px 0 16px}.talent-catalog-header h2{margin:0;font-size:20px}.talent-catalog-header p{color:var(--m);margin:5px 0 0}
    .talent-catalog-tools{display:flex;flex-wrap:wrap;align-items:flex-end;gap:12px;margin-bottom:14px}.talent-catalog-tools label{display:grid;gap:5px;min-width:0;color:var(--m);font-size:12px}.talent-catalog-tools label:first-child{flex:1 1 200px}.talent-catalog-tools input,.talent-catalog-tools select{width:100%;min-width:0;border:1px solid var(--l);padding:8px 10px;background:#fff;color:var(--i)}
    .talent-catalog-count{font-size:12px;color:var(--m);margin:0 0 12px}.talent-catalog-empty{padding:20px;text-align:center;color:var(--m);background:var(--bg)}
    .talent-service-catalog-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.talent-service-card{border:1px solid var(--l);border-radius:6px;padding:18px;min-width:0;display:flex;flex-direction:column;align-items:flex-start}.talent-service-card small{color:var(--b)}.talent-service-card h3{font-size:17px;margin:6px 0}.talent-service-card p{margin:0;color:var(--m)}.talent-service-card ul{padding-left:20px;margin:12px 0 16px;color:#52677f}.talent-service-card .primary{margin-top:auto;padding:7px 14px;text-decoration:none}
    .talent-expert-dialog{width:min(560px,calc(100% - 32px));border:1px solid var(--l);border-radius:8px;padding:24px;color:var(--i)}
    .talent-expert-dialog::backdrop{background:rgba(15,35,60,.45)}.talent-expert-dialog-header{display:flex;gap:16px;align-items:center}.talent-expert-dialog-header img{width:64px;height:76px;object-fit:cover}
    .talent-expert-dialog-header h2{margin:0}.talent-expert-dialog-header p{margin:4px 0;color:var(--m)}.talent-expert-dialog-actions{display:flex;justify-content:flex-end;gap:12px;margin-top:20px}
    #agenda.talent-expert-list{border:0;margin-top:14px}#agenda.talent-expert-list div{display:block;padding:0;border:0}#agenda.talent-expert-list .talent-expert-top,#agenda.talent-expert-list .talent-expert-actions{display:flex}#agenda.talent-expert-list .talent-expert-tags{margin:10px 0}
    @media(max-width:800px){#hub.talent-directory{grid-template-columns:1fr}.talent-expert-list,.talent-service-catalog-list{grid-template-columns:1fr}}
    @media(max-width:500px){.talent-service-directory,.talent-library,#talent-catalog{padding:16px}.talent-center-mode .top{height:auto;flex-wrap:wrap;gap:4px;padding:6px 14px;font-size:12px}.talent-center-mode .header{height:auto;min-height:72px;flex-wrap:wrap;gap:8px;padding:12px 14px}.talent-center-mode .logo b{font-size:16px}.talent-center-mode .logo em{font-size:12px}.talent-center-mode .work{padding:8px 10px}.talent-center-mode .crumb{flex-wrap:wrap;gap:6px}.talent-catalog-tools label{flex:1 1 100%}}
  `;
  document.head.append(style);
  const hub = document.querySelector('#hub');
  hub.className = 'panel talent-directory';
  hub.innerHTML = `<section class="talent-service-directory" aria-labelledby="talent-services-title">
    <div class="talent-directory-heading"><h2 id="talent-services-title">服务</h2><span>${services.length} 项服务</span></div>
    ${services.map(service => `<button class="talent-service-link" type="button" data-application-url="talent-application.html?service=${encodeURIComponent(service.id)}">${escapeHTML(service.title)}<span aria-hidden="true">›</span></button>`).join('')}
    <div class="talent-library-footer"><a class="talent-more" href="#talent/services" data-talent-view="services" aria-label="查看更多人才服务">查看更多 ›</a></div>
  </section><section class="talent-library" aria-labelledby="talent-library-title" aria-roledescription="轮播">
    <div class="talent-directory-heading"><h2 id="talent-library-title">人才库</h2><span>共 ${experts.length} 位专家</span></div>
    <div class="talent-expert-list" id="talent-library-list"></div>
    <div class="talent-library-footer"><div class="talent-page-controls"><button class="secondary" type="button" data-talent-page="-1" aria-label="上一页专家，循环浏览" aria-controls="talent-library-list">‹</button><span id="talent-preview-status" role="status" aria-live="polite" aria-atomic="true"></span><button class="secondary" type="button" data-talent-page="1" aria-label="下一页专家，循环浏览" aria-controls="talent-library-list">›</button></div><a class="talent-more" id="talent-library-more" href="#talent/library" data-talent-view="library" aria-label="查看更多，进入完整人才库">查看更多 ›</a></div>
  </section>`;
  const catalog = document.createElement('section');
  catalog.id = 'talent-catalog';
  catalog.className = 'panel';
  catalog.hidden = true;
  catalog.setAttribute('aria-labelledby', 'talent-catalog-title');
  catalog.innerHTML = `<a class="talent-catalog-back" href="#talent" data-talent-view="center">‹ 返回人才中心</a>
    <header class="talent-catalog-header"><h2 id="talent-catalog-title" tabindex="-1"></h2><p id="talent-catalog-description"></p></header>
    <div id="talent-catalog-library" hidden>
      <div class="talent-catalog-tools"><label>搜索专家<input id="talent-expert-search" type="search" placeholder="姓名、领域或专业方向" aria-controls="talent-catalog-experts"></label><label>专业领域<select id="talent-expert-domain" aria-controls="talent-catalog-experts"><option value="">全部领域</option>${[...new Set(experts.map(expert => expert.tags[0]))].map(tag => `<option value="${escapeHTML(tag)}">${escapeHTML(tag)}</option>`).join('')}</select></label></div>
      <p class="talent-catalog-count" id="talent-catalog-count" role="status" aria-live="polite"></p><div class="talent-expert-list" id="talent-catalog-experts"></div><p class="talent-catalog-empty" id="talent-catalog-empty" hidden>暂无匹配专家，请调整关键词或选择全部领域。</p>
    </div>
    <div class="talent-service-catalog-list" id="talent-catalog-services" hidden>${services.map(service => `<article class="talent-service-card"><small>${escapeHTML(service.type)}</small><h3>${escapeHTML(service.title)}</h3><p>${escapeHTML(service.desc)}</p><ul>${service.agenda.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul><a class="primary" href="talent-application.html?service=${encodeURIComponent(service.id)}" data-application-url="talent-application.html?service=${encodeURIComponent(service.id)}" aria-label="申请${escapeHTML(service.title)}">提交申请</a></article>`).join('')}</div>`;
  hub.after(catalog);
  const dialog = document.createElement('dialog');
  dialog.className = 'talent-expert-dialog';
  dialog.setAttribute('aria-labelledby', 'expert-dialog-title');
  dialog.innerHTML = '<div class="talent-expert-dialog-header"><img alt=""><div><h2 id="expert-dialog-title"></h2><p></p></div></div><div class="talent-expert-dialog-copy"></div><div class="talent-expert-dialog-actions"><button type="button" class="secondary" data-expert-close>关闭</button><a class="expert-book">预约咨询</a></div>';
  document.body.append(dialog);

  function renderLibrary(container, list = experts) {
    container.innerHTML = list.map(expert => `<article class="talent-expert-card"><div class="talent-expert-top"><img src="${escapeHTML(expert.avatar)}" alt="${escapeHTML(expert.name)}"><div><h3><button type="button" data-expert="${escapeHTML(expert.id)}">${escapeHTML(expert.name)}</button></h3><small>${escapeHTML(expert.role)}</small></div></div><div class="talent-expert-tags">${expert.tags.map(escapeHTML).join(' · ')}</div><div class="talent-expert-actions"><button type="button" data-expert="${escapeHTML(expert.id)}">查看详情</button><a class="expert-book" href="${escapeHTML(applicationUrl(expert))}" data-application-url="${escapeHTML(applicationUrl(expert))}">预约咨询</a></div></article>`).join('');
  }

  function openExpert(id) {
    const expert = experts.find(item => item.id === id);
    if (!expert) return;
    dialog.querySelector('img').src = expert.avatar;
    dialog.querySelector('img').alt = expert.name;
    dialog.querySelector('h2').textContent = expert.name;
    dialog.querySelector('.talent-expert-dialog-header p').textContent = expert.role;
    dialog.querySelector('.talent-expert-dialog-copy').innerHTML = `<p>${escapeHTML(expert.desc)}</p><p>${escapeHTML(expert.detail)}</p><p><b>专业方向：</b>${expert.tags.map(escapeHTML).join('、')}</p>`;
    const book = dialog.querySelector('.expert-book');
    book.href = applicationUrl(expert);
    book.dataset.applicationUrl = applicationUrl(expert);
    dialog.showModal();
  }

  function selectExpert(id) {
    selectedExpert = experts.find(expert => expert.id === id) || null;
    const form = document.querySelector('#apply-form');
    let field = form.querySelector('#selected-expert-field');
    if (!field) {
      field = document.createElement('div');
      field.className = 'field';
      field.id = 'selected-expert-field';
      field.innerHTML = '<label for="selected-expert">所选专家</label><input id="selected-expert" name="expertName" readonly placeholder="请先在人才库选择专家"><input id="selected-expert-id" name="expertId" type="hidden">';
      form.prepend(field);
    }
    field.hidden = active.id !== 'expert-pool';
    form.querySelector('#selected-expert').value = selectedExpert ? `${selectedExpert.name} · ${selectedExpert.role}` : '';
    form.querySelector('#selected-expert-id').value = selectedExpert ? selectedExpert.id : '';
    form.dataset.expertId = selectedExpert ? selectedExpert.id : '';
    return selectedExpert;
  }

  function renderPreview() {
    const pageCount = Math.ceil(experts.length / previewSize);
    previewPage = (previewPage + pageCount) % pageCount;
    renderLibrary(hub.querySelector('#talent-library-list'), experts.slice(previewPage * previewSize, (previewPage + 1) * previewSize));
    hub.querySelector('#talent-preview-status').textContent = `${previewPage + 1} / ${pageCount}`;
  }

  function filterLibrary() {
    const query = catalog.querySelector('#talent-expert-search').value.trim().toLocaleLowerCase();
    const domain = catalog.querySelector('#talent-expert-domain').value;
    const matches = experts.filter(expert => (!domain || expert.tags.includes(domain)) && `${expert.name} ${expert.role} ${expert.tags.join(' ')} ${expert.desc}`.toLocaleLowerCase().includes(query));
    renderLibrary(catalog.querySelector('#talent-catalog-experts'), matches);
    catalog.querySelector('#talent-catalog-count').textContent = `显示 ${matches.length} / ${experts.length} 位专家`;
    catalog.querySelector('#talent-catalog-empty').hidden = matches.length > 0;
  }

  function renderView(view = 'center', {updateUrl = true, replace = false} = {}) {
    const nextView = ['library', 'services'].includes(view) ? view : 'center';
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.delete('service');
      url.searchParams.delete('expert');
      url.hash = nextView === 'center' ? 'talent' : `talent/${nextView}`;
      if (url.href !== location.href) history[replace ? 'replaceState' : 'pushState'](null, '', url);
    }
    closeItem(false);
    if (dialog.open) dialog.close();
    catalog.hidden = nextView === 'center';
    hub.hidden = !catalog.hidden;
    catalog.querySelector('#talent-catalog-library').hidden = nextView !== 'library';
    catalog.querySelector('#talent-catalog-services').hidden = nextView !== 'services';
    if (catalog.hidden) return;
    const isLibrary = nextView === 'library';
    const title = isLibrary ? '完整人才库' : '完整服务目录';
    setHubBreadcrumb(title);
    catalog.querySelector('#talent-catalog-title').textContent = title;
    catalog.querySelector('#talent-catalog-description').textContent = isLibrary ? '按领域或关键词查找专家，查看专业背景并预约咨询。' : '了解两项现有服务的支持内容，按企业需求提交申请。';
    if (isLibrary) filterLibrary();
    if (updateUrl && !replace) catalog.querySelector('#talent-catalog-title').focus({preventScroll: true});
  }

  hub.addEventListener('click', event => {
    const control = event.target.closest('[data-talent-page]');
    if (!control) return;
    previewPage += Number(control.dataset.talentPage);
    renderPreview();
  });
  narrowScreen.addEventListener('change', event => {
    const firstExpert = previewPage * previewSize;
    previewSize = event.matches ? 1 : 2;
    previewPage = Math.floor(firstExpert / previewSize);
    renderPreview();
  });
  catalog.querySelector('#talent-expert-search').addEventListener('input', filterLibrary);
  catalog.querySelector('#talent-expert-domain').addEventListener('change', filterLibrary);
  // Capture the core breadcrumb before closeItem() replaces the URL without hiding our catalog.
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-talent-view]');
    const back = !catalog.hidden && event.target.closest('[data-back]');
    if (!link && !back) return;
    if (link?.tagName === 'A' && (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    renderView(link ? link.dataset.talentView : 'center');
  }, true);
  document.addEventListener('hub:item-open', () => { catalog.hidden = true; });
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-expert]');
    if (trigger) openExpert(trigger.dataset.expert);
    if (event.target.closest('[data-expert-close]') || event.target === dialog) dialog.close();
    if (event.target.closest('.expert-book') && dialog.open) dialog.close();
  });
  window.talentCenter = {renderLibrary, selectExpert, applicationUrl, renderView, getSelectedExpert: () => selectedExpert};
  renderPreview();
})();
