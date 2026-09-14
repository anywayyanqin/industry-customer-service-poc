(function () {
  if (!document.querySelector('link[href*="talent-detail-v2.css"]')) {
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = 'talent-detail-v2.css?v=20260821-2';
    document.head.appendChild(styleLink);
  }
  const configs = {
    'talent-demand': {
      title: '专业人才输送', breadcrumb: '人才服务中心 / 专业人才输送',
      lead: '围绕企业风险管理、交易、研究、风控及财务等岗位需求，提供从需求澄清、人才画像到候选资源匹配与沟通支持的一体化服务。',
      why: [['专业岗位识别', '结合业务阶段与组织分工，协助明确岗位职责、能力结构和优先级。'], ['产业人才匹配', '围绕期现业务、套期保值、风险管理与财务协同等方向开展定向匹配。'], ['过程持续跟进', '对需求受理、候选沟通和后续进展进行统一记录与持续跟进。']],
      formTitle: '提交人才需求', formText: '填写岗位方向、人数、经验与到岗计划后，服务人员将在工作台流程中受理并联系。'
    },
    'exchange-internship': {
      title: '双向人员交流或实习', breadcrumb: '人才服务中心 / 双向人员交流或实习',
      lead: '面向产业企业与专业机构的交流、跟岗和实习需求，协助明确交流目标、参与对象、周期安排及实践主题，推动人才培养与产业经验双向流动。',
      why: [['交流方案设计', '根据培养目标与业务主题，协助确定交流形式、周期和成果要求。'], ['资源协同对接', '对接产业企业、专业团队及相关岗位资源，提升交流安排的匹配度。'], ['过程与成果管理', '统一记录申请、沟通、实施与反馈，便于在工作台持续跟进。']],
      formTitle: '提交交流或实习需求', formText: '填写交流目的、参与对象、时间安排和实践方向后，服务人员将在工作台流程中受理。'
    }
  };

  function customize(service) {
    const config = configs[service];
    if (!config) return;
    const detail = document.getElementById('detail');
    if (!detail || !detail.classList.contains('active')) return;
    document.body.classList.add('talent-detail-view');
    const title = document.getElementById('detail-title');
    const desc = document.getElementById('detail-desc');
    const crumb = document.getElementById('crumb-name');
    if (title) title.textContent = config.title;
    if (desc) desc.textContent = config.lead;
    if (crumb) {
      const container=crumb.closest('.crumb');
      if(container)container.innerHTML=`<button data-go="basic-service-home.html">基础服务</button><span>/</span><button data-go="service-hubs.html#talent">人才服务</button><span>/</span><b id="crumb-name">${config.title}</b><button class="home" data-go="basic-service-home.html">← 返回基础服务首页</button>`;
    }
    const canonical='service-hubs.html?service='+service+'#talent';
    if(!location.search.includes('service='+service))history.replaceState(null,'',canonical);
    let panel = detail.querySelector('.talent-detail-explanation');
    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'talent-detail-explanation';
      (detail.querySelector('.detail-content, .service-detail-content, .talent-detail-main') || detail).appendChild(panel);
    }
    panel.innerHTML = `<div class="talent-detail-copy"><p class="talent-detail-kicker">人才资源服务</p><h2>为什么选择本项服务</h2><p class="talent-detail-lead">${config.lead}</p><div class="talent-detail-points">${config.why.map((item, index) => `<article><span>0${index + 1}</span><div><h3>${item[0]}</h3><p>${item[1]}</p></div></article>`).join('')}</div></div><aside class="talent-form-entry"><span>下一步</span><h2>${config.formTitle}</h2><p>${config.formText}</p><a class="talent-form-button" href="talent-application.html?service=${service}">进入申请表单</a></aside>`;
  }

  document.addEventListener('click', function (event) {
    const serviceLink = event.target.closest('[data-talent-service],[data-item]');
    const service = serviceLink && (serviceLink.getAttribute('data-talent-service') || serviceLink.getAttribute('data-item'));
    if (configs[service]) setTimeout(() => customize(service), 20);
    if (event.target.closest('[data-back-talent], .back-list, #detail .back-link')) setTimeout(() => document.body.classList.remove('talent-detail-view'), 10);
  }, true);

  function initializeFromUrl() {
    const service = new URLSearchParams(location.search).get('service');
    if (configs[service]) setTimeout(() => customize(service), 50);
  }
  window.addEventListener('hashchange', initializeFromUrl);
  initializeFromUrl();
})();
