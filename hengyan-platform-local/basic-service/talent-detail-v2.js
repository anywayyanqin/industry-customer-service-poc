(() => {
  if (mode !== 'talent') return;
  const configs = {
    'talent-demand': {
      title: '专业人才输送',
      lead: '围绕企业风险管理、交易、研究、风控及财务等岗位需求，提供从需求澄清、人才画像到候选资源匹配与沟通支持的一体化服务。',
      why: [['专业岗位识别', '结合业务阶段与组织分工，协助明确岗位职责、能力结构和优先级。'], ['产业人才匹配', '围绕期现业务、套期保值、风险管理与财务协同等方向开展定向匹配。'], ['过程持续跟进', '对需求受理、候选沟通和后续进展进行统一记录与持续跟进。']],
      formTitle: '提交人才需求', formText: '填写岗位方向、人数、经验与到岗计划后，服务人员将在工作台流程中受理并联系。'
    },
    'exchange-internship': {
      title: '双向人员交流或实习',
      lead: '面向产业企业与专业机构的交流、跟岗和实习需求，协助明确交流目标、参与对象、周期安排及实践主题，推动人才培养与产业经验双向流动。',
      why: [['交流方案设计', '根据培养目标与业务主题，协助确定交流形式、周期和成果要求。'], ['资源协同对接', '对接产业企业、专业团队及相关岗位资源，提升交流安排的匹配度。'], ['过程与成果管理', '统一记录申请、沟通、实施与反馈，便于在工作台持续跟进。']],
      formTitle: '提交交流或实习需求', formText: '填写交流目的、参与对象、时间安排和实践方向后，服务人员将在工作台流程中受理。'
    }
  };

  function customize(service, expertId) {
    const detail = document.getElementById('detail');
    if (!detail.classList.contains('active')) return;
    const selected = window.talentCenter.selectExpert(service === 'expert-pool' ? expertId : '');
    const url = new URL(location.href);
    url.searchParams.set('service', service);
    if (selected) url.searchParams.set('expert', selected.id);
    else url.searchParams.delete('expert');
    url.hash = 'talent';
    history.replaceState(null, '', url);
    if (service === 'expert-pool') {
      document.body.classList.remove('talent-detail-view');
      const library = document.getElementById('agenda');
      library.classList.add('talent-expert-list');
      window.talentCenter.renderLibrary(library);
      return;
    }
    const config = Object.hasOwn(configs, service) ? configs[service] : null;
    if (!config) return;
    if (!document.querySelector('link[href*="talent-detail-v2.css"]')) {
      const styleLink = document.createElement('link');
      styleLink.rel = 'stylesheet';
      styleLink.href = 'talent-detail-v2.css?v=20260821-2';
      document.head.append(styleLink);
    }
    document.body.classList.add('talent-detail-view');
    document.getElementById('detail-title').textContent = config.title;
    document.getElementById('detail-desc').textContent = config.lead;
    const panel = document.createElement('section');
    panel.className = 'talent-detail-explanation';
    panel.innerHTML = `<div class="talent-detail-copy"><h2>服务支持</h2><div class="talent-detail-points">${config.why.map((item, index) => `<article><span>0${index + 1}</span><div><h3>${escapeHTML(item[0])}</h3><p>${escapeHTML(item[1])}</p></div></article>`).join('')}</div></div><aside class="talent-form-entry"><h2>${escapeHTML(config.formTitle)}</h2><p>${escapeHTML(config.formText)}</p><a class="talent-form-button" href="talent-application.html?service=${encodeURIComponent(service)}">进入申请表单</a></aside>`;
    detail.querySelector('.detail-main').append(panel);
  }

  document.addEventListener('hub:item-open', event => customize(event.detail.serviceId, event.detail.expertId));
  document.addEventListener('click', event => {
    if (event.target.closest('[data-back-talent], .back-list, #detail .back-link')) closeItem();
  });
  function initializeFromUrl() {
    if (!location.hash.includes('talent')) return;
    const query = new URLSearchParams(location.search);
    const service = query.get('service');
    if (query.get('applicationEmbed') === '1' && service === 'expert-pool') {
      openItem(service, {expertId: query.get('expert')});
    } else {
      const legacyLibrary = service === 'expert-pool' && !query.get('expert');
      const view = location.hash === '#talent/library' ? 'library' : location.hash === '#talent/services' ? 'services' : legacyLibrary ? 'library' : 'center';
      // Preserve expert/service deep links for application-drawer.js; only normalize the old library URL.
      window.talentCenter.renderView(view, {updateUrl: legacyLibrary, replace: true});
    }
  }
  window.addEventListener('popstate', initializeFromUrl);
  window.addEventListener('hashchange', initializeFromUrl);
  initializeFromUrl();
})();
