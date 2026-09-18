(() => {
  if (mode !== 'activity' || typeof activity === 'undefined') return;
  document.body.classList.add('activity-center-mode');
  const hub = document.querySelector('#hub');
  const industryMap = {'policy-live': '综合', 'industry-research': '能源化工', 'industry-salon': '综合'};
  const publishMap = {'policy-live': '2026-08-20', 'industry-research': '2026-08-16', 'industry-salon': '2026-08-18'};
  const categories = {all: '', policy: '政策直播', research: '行业调研', salon: '沙龙峰会'};
  const queryCategory = new URLSearchParams(location.search).get('category');
  let category = Object.hasOwn(categories, queryCategory) ? queryCategory : 'all';
  let view = 'recent', keyword = '', sort = 'date', industry = '全部', page = 1;
  const pageSize = 5, recentSize = 3;
  const all = activity.map(item => ({...item, industry: industryMap[item.id] || '综合', published: publishMap[item.id] || ''}));
  let featureId = all[0]?.id;
  const style = document.createElement('style');
  style.textContent = `
    #hub.activity-directory{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr);gap:18px;padding:18px;align-items:stretch;min-width:0}
    #hub[hidden],#hub.activity-directory [hidden]{display:none!important}
    #hub.activity-directory *{box-sizing:border-box}
    #hub #activity-feature{position:relative;isolation:isolate;display:flex;flex-direction:column;min-width:0;min-height:364px;margin:0;padding:24px;overflow:hidden;border-radius:10px;background:radial-gradient(ellipse at 100% 0,rgba(80,165,255,.4),transparent 55%),linear-gradient(135deg,#092453,#0b438d 70%,#1269b6);color:#fff}
    #activity-feature:before,#activity-feature:after{content:'';position:absolute;z-index:-1;width:190px;height:190px;right:-95px;top:65px;border:1px solid rgba(255,255,255,.18);border-radius:50%;pointer-events:none}
    #activity-feature:before{width:260px;height:260px;right:-130px;top:30px}
    #activity-feature .activity-feature-kicker{margin:0 0 10px;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:3px;color:#a9d1ff}
    #activity-feature .activity-feature-badge{display:inline-block;border:1px solid #7095c2;border-radius:4px;padding:3px 8px;font-size:11px;line-height:1.3;color:#e6f1ff}
    #activity-feature h2{margin:10px 0 6px;font-size:clamp(21px,1.75vw,24px);line-height:1.35;overflow-wrap:anywhere}
    #activity-feature .activity-feature-description{margin:0;font-size:12px;line-height:1.6;color:#d3e4fc;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}
    #activity-feature .activity-feature-facts{display:grid;gap:2px;margin:10px 0;color:#e0edff;font-size:12px;line-height:1.4;overflow-wrap:anywhere}
    #activity-feature .activity-feature-links{display:flex;flex-wrap:wrap;gap:8px}
    #activity-feature .activity-feature-links a{display:inline-flex;align-items:center;justify-content:center;min-height:34px;padding:7px 14px;border:1px solid #fff;border-radius:5px;background:#fff;color:#123d77;font-size:12px;font-weight:700;text-decoration:none}
    #activity-feature .activity-feature-links a:last-child{background:rgba(255,255,255,.08);border-color:#8eb1dc;color:#fff}
    #activity-feature .activity-feature-nav{display:flex;align-items:center;gap:8px;margin-top:auto;padding-top:14px}
    #activity-feature .activity-feature-nav button{min-width:0;min-height:32px;border:1px solid rgba(255,255,255,.3);border-radius:4px;background:transparent;color:#daeaff;cursor:pointer}
    #activity-feature .activity-feature-nav>button{flex:0 0 30px;padding:0;font-size:18px}
    #activity-feature .activity-feature-nav button:disabled{opacity:.35;cursor:default}
    #activity-feature .activity-feature-indicators{display:flex;flex:1;min-width:0;gap:5px}
    #activity-feature .activity-feature-indicators button{flex:1;padding:5px 2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px}
    #activity-feature .activity-feature-indicators button.active{background:#e5f0ff;border-color:#e5f0ff;color:#123d77;font-weight:700}
    #activity-feature a:focus-visible,#activity-feature button:focus-visible{outline:2px solid #fff;outline-offset:3px}
    #activity-feature .activity-feature-empty{margin:auto 0;color:#d3e4fc;font-size:13px;line-height:1.7}
    .activity-directory-panel{display:flex;flex-direction:column;min-width:0;padding:2px 0}
    .activity-directory-head,.activity-view-tabs,.activity-list-footer{display:flex;align-items:center;gap:8px}
    .activity-directory-head{justify-content:space-between;flex-wrap:wrap;border-bottom:1px solid var(--l);padding-bottom:10px}
    .activity-view-tabs button{border:0;background:transparent;padding:6px 10px;color:var(--m);cursor:pointer;white-space:nowrap}
    .activity-view-tabs button.active{background:#edf4ff;color:var(--b);font-weight:700;border-radius:5px}
    #activity-result-count{font-size:11px;color:var(--m)}
    .activity-list-tools{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,112px) minmax(0,100px);gap:7px;margin:12px 0 4px}
    .activity-list-tools input,.activity-list-tools select{width:100%;min-width:0;height:34px;border:1px solid var(--l);border-radius:5px;padding:5px 7px;background:#fff;font-size:12px}
    #activity-results{min-width:0;flex:1}
    .activity-directory-row{display:grid;grid-template-columns:88px minmax(0,1fr) auto;gap:10px;align-items:center;padding:13px 0;border-bottom:1px solid #e8edf3}
    .activity-directory-row>div{min-width:0}.activity-directory-row h3{font-size:14px;line-height:1.5;margin:0 0 4px;overflow-wrap:anywhere}
    .activity-directory-row h3 a{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .activity-directory-row a{color:var(--i);text-decoration:none}.activity-directory-row a:hover{color:var(--b)}
    .activity-directory-row time,.activity-directory-row small,.activity-directory-row .activity-place{color:var(--m);font-size:11px;line-height:1.6;overflow-wrap:anywhere}
    .activity-directory-row .activity-place{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .activity-directory-row .activity-apply{color:var(--b);border:1px solid #b9cae0;padding:6px 8px;border-radius:5px;white-space:nowrap;font-size:12px}
    .activity-list-footer{justify-content:flex-end;flex-wrap:wrap;margin-top:10px;min-height:32px;font-size:12px}.activity-list-footer button{padding:5px 10px}
    .activity-empty-row{padding:30px 0;text-align:center;color:var(--m)}
    @media(max-width:800px){#hub.activity-directory{grid-template-columns:minmax(0,1fr);padding:14px;gap:16px}#hub #activity-feature{min-height:0;padding:22px}.activity-list-tools{grid-template-columns:minmax(0,1fr) 112px 100px}}
    @media(max-width:480px){#hub.activity-directory{padding:10px}#hub #activity-feature{padding:20px}.activity-list-tools{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.activity-list-tools input{grid-column:1/-1}.activity-directory-row{grid-template-columns:minmax(0,1fr) auto;gap:4px 10px}.activity-directory-row time{grid-column:1}.activity-directory-row>div{grid-column:1}.activity-directory-row .activity-apply{grid-column:2;grid-row:1/3}.activity-directory-head{gap:6px}.activity-view-tabs{gap:4px}}
  `;
  document.head.append(style);
  hub.classList.add('activity-directory');
  hub.innerHTML = `<article id="activity-feature" class="activity-feature" aria-label="热门活动"><p class="activity-feature-kicker">热门活动 · 精选推荐</p><div id="activity-feature-content" aria-live="polite" aria-atomic="true"></div><nav class="activity-feature-nav" aria-label="切换热门活动"><button type="button" id="activity-feature-prev" aria-label="上一个热门活动" aria-controls="activity-feature-content">‹</button><div class="activity-feature-indicators" id="activity-feature-indicators"></div><button type="button" id="activity-feature-next" aria-label="下一个热门活动" aria-controls="activity-feature-content">›</button></nav></article><section class="activity-directory-panel" aria-label="活动目录"><div class="activity-directory-head"><div class="activity-view-tabs" role="tablist" aria-label="活动范围"><button type="button" id="activity-recent-tab" role="tab" data-activity-view="recent" aria-controls="activity-results">近期活动</button><button type="button" id="activity-all-tab" role="tab" data-activity-view="all" aria-controls="activity-results">全部活动</button></div><span id="activity-result-count" aria-live="polite"></span></div><div class="activity-list-tools"><input id="activity-search" type="search" aria-label="搜索活动" placeholder="搜索活动"><select id="activity-sort" aria-label="活动排序"><option value="date">按活动时间</option><option value="published">按最新发布</option></select><select id="activity-industry" aria-label="所属行业"><option>全部行业</option><option>综合</option><option>能源化工</option><option>农产品</option><option>金属</option><option>金融</option></select></div><div id="activity-results" role="tabpanel"></div><div class="activity-list-footer"><button class="secondary" type="button" id="activity-more">查看更多</button><button class="secondary" type="button" id="activity-prev">上一页</button><span id="activity-page" aria-live="polite"></span><button class="secondary" type="button" id="activity-next">下一页</button></div></section>`;

  function featureItems() {
    return all.filter(item => !categories[category] || item.type === categories[category]);
  }

  function renderFeature(step = 0) {
    const items = featureItems();
    const current = Math.max(0, items.findIndex(item => item.id === featureId));
    const item = items.length ? items[(current + step + items.length) % items.length] : null;
    featureId = item?.id;
    hub.querySelector('#activity-feature-content').innerHTML = item ? `<span class="activity-feature-badge">${escapeHTML(item.type)}</span><h2>${escapeHTML(item.title)}</h2><p class="activity-feature-description">${escapeHTML(item.desc)}</p><div class="activity-feature-facts"><time>时间 · ${escapeHTML(item.date)}</time><span>地点 · ${escapeHTML(item.place)}</span></div><div class="activity-feature-links"><a href="${escapeHTML(`activity-detail.html?id=${encodeURIComponent(item.id)}`)}">查看详情</a><a href="${escapeHTML(`activity-application.html?id=${encodeURIComponent(item.id)}`)}">立即预约</a></div>` : '<h2>暂无热门活动</h2><p class="activity-feature-empty">当前分类暂无活动，请切换其他分类查看。</p>';
    hub.querySelector('#activity-feature-indicators').innerHTML = items.map((entry, index) => `<button type="button" data-feature-index="${escapeHTML(String(index))}" class="${escapeHTML(entry.id === featureId ? 'active' : '')}" aria-pressed="${escapeHTML(String(entry.id === featureId))}" aria-label="${escapeHTML(`查看热门活动：${entry.title}`)}" title="${escapeHTML(entry.title)}" aria-controls="activity-feature-content">${escapeHTML(String(index + 1).padStart(2, '0'))} ${escapeHTML(entry.type)}</button>`).join('');
    hub.querySelector('#activity-feature-prev').disabled = items.length < 2;
    hub.querySelector('#activity-feature-next').disabled = items.length < 2;
    hub.querySelector('.activity-feature-nav').hidden = !items.length;
  }

  function filtered() {
    return all.filter(item => (!categories[category] || item.type === categories[category]) &&
      (industry === '全部' || item.industry === industry) &&
      (!keyword || (item.title + item.desc + item.place).toLowerCase().includes(keyword)))
      .sort((a, b) => sort === 'published' ? b.published.localeCompare(a.published) : a.date.localeCompare(b.date));
  }

  function renderResults() {
    const matches = filtered();
    const totalPages = Math.max(1, Math.ceil(matches.length / pageSize));
    page = Math.min(page, totalPages);
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const visible = view === 'recent' ? matches.filter(item => item.date.slice(0, 10) >= today).slice(0, recentSize) : matches.slice((page - 1) * pageSize, page * pageSize);
    hub.querySelector('#activity-result-count').textContent = view === 'recent' ? `近期 ${visible.length} 项 / 共 ${matches.length} 项` : `共 ${matches.length} 项`;
    hub.querySelectorAll('[data-activity-view]').forEach(button => {
      const selected = button.dataset.activityView === view;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    const results = hub.querySelector('#activity-results');
    results.setAttribute('aria-labelledby', view === 'recent' ? 'activity-recent-tab' : 'activity-all-tab');
    results.innerHTML = visible.length ? visible.map(item => `<article class="activity-directory-row"><time>${escapeHTML(item.date)}</time><div><h3><a href="${escapeHTML(`activity-detail.html?id=${encodeURIComponent(item.id)}`)}" title="${escapeHTML(item.title)}">${escapeHTML(item.title)}</a></h3><small>${escapeHTML(item.type)} · ${escapeHTML(item.industry)}</small><span class="activity-place" title="${escapeHTML(item.place)}">${escapeHTML(item.place)}</span></div><a class="activity-apply" href="${escapeHTML(`activity-application.html?id=${encodeURIComponent(item.id)}`)}">立即预约</a></article>`).join('') : '<div class="activity-empty-row">暂无符合条件的活动</div>';
    hub.querySelector('#activity-more').hidden = view !== 'recent';
    ['#activity-prev', '#activity-page', '#activity-next'].forEach(selector => { hub.querySelector(selector).hidden = view !== 'all'; });
    hub.querySelector('#activity-page').textContent = `${page} / ${totalPages} 页`;
    hub.querySelector('#activity-prev').disabled = page <= 1;
    hub.querySelector('#activity-next').disabled = page >= totalPages;
  }

  function setView(nextView) { view = nextView; page = 1; renderResults(); }
  hub.addEventListener('click', event => {
    if (event.target.closest('#activity-feature-prev')) renderFeature(-1);
    if (event.target.closest('#activity-feature-next')) renderFeature(1);
    const indicator = event.target.closest('[data-feature-index]');
    if (indicator) {
      const index = Number(indicator.dataset.featureIndex);
      const item = featureItems()[index];
      if (item) {
        featureId = item.id;
        renderFeature();
        hub.querySelectorAll('[data-feature-index]')[index].focus();
      }
    }
    const tab = event.target.closest('[data-activity-view]');
    if (tab) setView(tab.dataset.activityView);
    if (event.target.closest('#activity-more')) {
      setView('all');
      hub.querySelector('#activity-all-tab').focus();
    }
    if (event.target.closest('#activity-prev') && page > 1) { page--; renderResults(); }
    if (event.target.closest('#activity-next') && page < Math.ceil(filtered().length / pageSize)) { page++; renderResults(); }
  });
  hub.querySelector('.activity-view-tabs').addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    setView(event.key === 'Home' ? 'recent' : event.key === 'End' ? 'all' : view === 'recent' ? 'all' : 'recent');
    hub.querySelector(`[data-activity-view="${view}"]`).focus();
  });
  hub.querySelector('#activity-search').addEventListener('input', event => { keyword = event.target.value.trim().toLowerCase(); page = 1; renderResults(); });
  hub.querySelector('#activity-sort').addEventListener('change', event => { sort = event.target.value; page = 1; renderResults(); });
  hub.querySelector('#activity-industry').addEventListener('change', event => { industry = event.target.value === '全部行业' ? '全部' : event.target.value; page = 1; renderResults(); });
  document.addEventListener('activity-category-change', event => {
    category = Object.hasOwn(categories, event.detail) ? event.detail : 'all';
    page = 1;
    renderFeature();
    renderResults();
  });
  renderFeature();
  renderResults();
})();
