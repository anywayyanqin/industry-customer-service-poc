(function () {
  'use strict';
  var primaryNavStyle = document.createElement('style');
  primaryNavStyle.textContent = '.main-header nav>button:nth-child(2){display:none!important}.tool-page.smart-page>.wrap>.tool-title,.tool-page.research-page>.wrap>.tool-title{display:none!important}.data-disclaimer,.prototype-notice{display:none!important}';
  document.head.appendChild(primaryNavStyle);
  // 金融服务案例复用基础服务内容服务页模板。
  (function loadFinancialCaseTemplate() {
    var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = '/basic-service/content-service-templates.css?v=20260821-15'; document.head.appendChild(css);
    var template = document.createElement('script'); template.src = '/basic-service/content-service-templates.js?v=20260821-15';
    template.onload = function () { var cases = document.createElement('script'); cases.src = '/financial-case-content.js?v=2'; document.body.appendChild(cases); };
    document.head.appendChild(template);
  }());
  function mount() {
    var shell = document.querySelector('.site-shell');
    var main = document.querySelector('main');
    var copies = document.querySelectorAll('.hx-basic-workspace-summary');
    var old = document.getElementById('formal-basic-workspace');
    copies.forEach(function (node) { node.remove(); });
    return;
    var panel = document.createElement('section');
    panel.id = 'formal-basic-workspace';
    panel.className = 'hx-basic-workspace-summary panel';
    panel.innerHTML = '<div><small>BASIC SERVICES</small><h2>基础服务记录</h2><p>咨询申请、课程学习、活动预约和人才服务统一跟进</p></div><dl><div><dt>在办申请</dt><dd>2</dd></div><div><dt>我的活动</dt><dd>1</dd></div><div><dt>学习中课程</dt><dd>2</dd></div><div><dt>关注服务</dt><dd>1</dd></div></dl><button type="button">进入基础服务工作台 ›</button>';
    panel.querySelector('button').onclick = function () {
      var basic = Array.prototype.find.call(document.querySelectorAll('.main-header nav button'), function (b) { return b.textContent.trim() === '基础服务'; });
      if (basic) basic.click();
      setTimeout(function () { var frame = document.querySelector('#hxb-app iframe'); if (frame) frame.src = '/basic-service/index.html#workbench'; }, 200);
    };
    main.insertBefore(panel, main.firstElementChild);
  }
  function addBasicApplications() {
    var center = document.querySelector('.application-center');
    var table = center && center.querySelector('.application-table tbody');
    if (!table) return;
    var source = center.querySelector('.table-filters select');
    if (source && !Array.from(source.options).some(function (o) { return o.textContent === '基础服务'; })) {
      var option = document.createElement('option'); option.textContent = '基础服务'; option.value = '基础服务'; source.appendChild(option);
    }
    if (table.querySelector('[data-basic-native]')) return;
    var rows = [
      ['ZX20260821001','基础服务','业务开展可行性分析','2026-08-21','陈嘉宁','已提交'],
      ['RC20260821002','基础服务','专业人才输送','2026-08-21','客户服务组','已受理']
    ];
    rows.forEach(function (r) {
      var tr = document.createElement('tr'); tr.setAttribute('data-basic-native','1');
      tr.innerHTML = r.map(function (x,i) { return '<td>' + (i===5?'<span class="status submitted">'+x+'</span>':x) + '</td>'; }).join('') + '<td><button class="link-button" data-open-basic-workbench>查看详情</button></td>';
      table.appendChild(tr);
    });
    center.querySelectorAll('[data-open-basic-workbench]').forEach(function (b) { b.onclick=function(){openBasic('/basic-service/index.html#workbench');}; });
    if (!center.querySelector('.native-course-strip')) {
      var courses = document.createElement('section'); courses.className='native-course-strip';
      courses.innerHTML='<div><small>基础服务 · 我的课程</small><h3>套保会计实务</h3><p>6 章节 · 已学习 2 章 · 进度 33%</p></div><div class="course-progress"><i style="width:33%"></i></div><button data-native-course>继续学习 ›</button>';
      courses.querySelector('button').onclick=function(){openBasic('/basic-service/training-center.html#course/hedge-accounting');}; center.appendChild(courses);
    }
  }
  function addBasicFollow() {
    var center=document.querySelector('.follow-center'); if(!center||center.querySelector('[data-basic-follow]'))return;
    var card=document.createElement('article'); card.className='native-basic-item'; card.setAttribute('data-basic-follow','1');
    card.innerHTML='<span>基础服务专题</span><div><b>监管政策解读及案例分析</b><p>关注的政策专题有 1 条新更新</p></div><button>进入专题 ›</button>';
    card.querySelector('button').onclick=function(){openBasic('/basic-service/basic-service-home.html#content/policy-center');}; center.appendChild(card);
  }
  function addBasicActivity() {
    var center=document.querySelector('.activity-center'); if(!center||center.querySelector('[data-basic-activity]'))return;
    var card=document.createElement('article'); card.className='native-basic-item activity'; card.setAttribute('data-basic-activity','1');
    card.innerHTML='<span>26<small>08月</small></span><div><b>监管政策解读及企业合规专题直播</b><p>基础服务 · 线上直播 · 已预约</p></div><button>查看详情 ›</button>';
    card.querySelector('button').onclick=function(){openBasic('/basic-service/activity-detail.html?id=policy-live');}; center.appendChild(card);
  }
  function mountNativeWorkspace(){
    var shell=document.querySelector('.site-shell'); if(!shell||shell.getAttribute('data-view')!=='workspace')return;
    document.querySelectorAll('.hx-basic-workspace-summary').forEach(function(n){n.remove();});
    document.querySelectorAll('[data-basic-native],.native-course-strip,[data-basic-follow],[data-basic-activity]').forEach(function(n){n.remove();});
    var nav=document.querySelector('.workspace-nav'); if(!nav)return;
    var button=nav.querySelector('[data-basic-workspace-nav]');
    if(!button){
      button=document.createElement('button'); button.setAttribute('data-basic-workspace-nav','1');
      button.innerHTML='<span>基础服务</span><b>6</b>';
      button.onclick=function(){
        nav.querySelectorAll('button').forEach(function(b){b.classList.remove('active');}); button.classList.add('active');
        renderBasicWorkspace();
      };
      var account=Array.from(nav.children).find(function(x){return (x.textContent||'').indexOf('账户服务')>=0;});
      nav.insertBefore(button,account||null);
    }
  }
  function renderBasicWorkspace(){
    var box=document.querySelector('.workspace-content'); if(!box)return;
    box.querySelector('.native-basic-workspace')?.remove(); box.classList.add('native-basic-mode'); var holder=document.createElement('div'); holder.innerHTML='<section class="native-basic-workspace"><div class="block-title"><div><small>BASIC SERVICES</small><h2>基础服务</h2><p>集中查看咨询申请、课程学习、活动预约和关注专题</p></div><button data-basic-home>进入基础服务 ›</button></div><div class="native-basic-stats"><div><span>在办申请</span><b>2</b></div><div><span>我的活动</span><b>1</b></div><div><span>学习中课程</span><b>2</b></div><div><span>关注服务</span><b>1</b></div></div><div class="native-basic-columns"><section><div class="native-basic-head"><h3>在办申请</h3><span>2 项</span></div><article><div><small>咨询服务</small><b>业务开展可行性分析</b><p>ZX20260821001 · 已提交</p></div><button data-basic-go="/basic-service/index.html#workbench">查看详情 ›</button></article><article><div><small>人才服务</small><b>专业人才输送</b><p>RC20260821002 · 已受理</p></div><button data-basic-go="/basic-service/service-hubs.html?service=talent-demand#talent">查看详情 ›</button></article></section><section><div class="native-basic-head"><h3>课程与活动</h3><span>3 项</span></div><article><div><small>学习中 · 33%</small><b>套保会计实务</b><p>6 章节 · 已学习 2 章</p></div><button data-basic-go="/basic-service/training-center.html#course/hedge-accounting">继续学习 ›</button></article><article><div><small>已预约 · 08月26日</small><b>监管政策解读专题直播</b><p>线上直播 · 14:00</p></div><button data-basic-go="/basic-service/activity-detail.html?id=policy-live">查看活动 ›</button></article></section></div><section class="native-basic-follow"><div><small>我关注的服务</small><h3>监管政策解读及案例分析</h3><p>最近更新：新旧业务管理要求智能差异分析</p></div><button data-basic-go="/basic-service/basic-service-home.html#content/policy-center">进入专题 ›</button></section></section>'; box.appendChild(holder.firstElementChild);
    box.querySelector('[data-basic-home]').onclick=function(){openBasic('/basic-service/basic-service-home.html');};
    box.querySelectorAll('[data-basic-go]').forEach(function(b){b.onclick=function(){openBasic(b.dataset.basicGo);};});
  }
  function openBasic(path) {
    if (/\/basic-service\/training-center\.html/.test(path) && path.indexOf('v=20260825-3') < 0) {
      path = path.replace('training-center.html', 'training-center.html?v=20260825-3');
    }
    document.dispatchEvent(new CustomEvent('open-migrated-basic', { detail: { path: path } }));
  }
  function cleanDemoLabels(doc) {
    if (!doc || !doc.body) return;
    doc.querySelectorAll('.data-disclaimer,.prototype-notice').forEach(function (node) { node.remove(); });
    var walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      var text = node.nodeValue;
      if (!text || !/(模拟|原型|示例|不提供真实下单|未连接真实AI|仅供参考)/.test(text)) continue;
      text = text
        .replace(/·\s*延时行情\s*·\s*模拟环境/g, '')
        .replace(/延时行情\s*·\s*模拟演示数据，?不提供真实下单/g, '行情数据')
        .replace(/模拟环境/g, '交易环境')
        .replace(/模拟演示数据/g, '业务数据')
        .replace(/原型模拟数据/g, '业务数据')
        .replace(/原型模拟信息/g, '业务信息')
        .replace(/原型模拟/g, '业务参考')
        .replace(/原型演示数据/g, '业务参考数据')
        .replace(/原型演示内容/g, '业务参考内容')
        .replace(/原型演示正文/g, '业务参考正文')
        .replace(/原型演示口径/g, '业务口径')
        .replace(/原型演示/g, '业务参考')
        .replace(/原型中的/g, '')
        .replace(/未连接真实AI/g, 'AI 辅助分析')
        .replace(/不提供真实下单/g, '请按正式权限办理')
        .replace(/示例资料/g, '参考资料')
        .replace(/示例模板/g, '参考模板')
        .replace(/示例课程/g, '课程')
        .replace(/示例文件/g, '参考文件')
        .replace(/原型说明/g, '业务说明');
      node.nodeValue = text;
    }
  }
  function cleanAllDemoLabels() {
    cleanDemoLabels(document);
    document.querySelectorAll('iframe').forEach(function (frame) {
      try { cleanDemoLabels(frame.contentDocument); } catch (e) {}
    });
  }
  function mountMenu() {
    if (document.getElementById('formal-basic-mega')) return;
    var header = document.querySelector('.main-header');
    var basic = Array.prototype.find.call(document.querySelectorAll('.main-header nav button'), function (b) { return b.textContent.trim() === '基础服务'; });
    if (!header || !basic) return;
    var menu = document.createElement('section');
    menu.id = 'formal-basic-mega';
    menu.className = 'formal-basic-mega';
    menu.innerHTML = '<button data-path="/basic-service/basic-service-home.html" class="mega-home">基础服务首页 <span>查看全部服务 ›</span></button><div class="mega-grid"><div><h3>咨询服务</h3><button data-path="/basic-service/consulting-center.html">进入咨询服务中心</button><button data-path="/basic-service/index.html">业务开展可行性分析</button><button data-path="/basic-service/hedge-accounting-service.html">套保会计咨询服务</button><button data-path="/basic-service/basic-service-home.html?view=internal-control#content/internal-control">内控管理制度建设</button><button data-path="/basic-service/basic-service-home.html?view=policy-center#content/policy-center">监管政策解读及案例分析</button></div><div><h3>培训课程</h3><button data-path="/basic-service/training-center.html">进入课程中心</button><button data-path="/basic-service/training-center.html#course/hedge-accounting">套保会计实务</button><button data-path="/basic-service/training-center.html#course/risk-foundation">风险管理基础知识</button><button data-path="/basic-service/course-experience.html#derivative">衍生品工具应用实例</button></div><div><h3>活动与调研</h3><button data-path="/basic-service/service-hubs.html#activity">进入活动与调研中心</button><button data-path="/basic-service/service-hubs.html?category=policy#activity">政策直播</button><button data-path="/basic-service/service-hubs.html?category=research#activity">行业调研</button><button data-path="/basic-service/service-hubs.html?category=salon#activity">沙龙与峰会</button></div><div><h3>人才服务</h3><button data-path="/basic-service/service-hubs.html#talent">进入人才服务中心</button><button data-path="/basic-service/service-hubs.html?service=talent-demand#talent">专业人才输送</button><button data-path="/basic-service/service-hubs.html?service=exchange-internship#talent">双向人员交流或实习</button><button data-path="/basic-service/service-hubs.html?service=expert-pool#talent">外部专家资源库</button></div></div>';
    header.appendChild(menu);
    basic.addEventListener('mouseenter', function () { menu.classList.add('open'); });
    basic.addEventListener('click', function (event) { event.preventDefault(); event.stopImmediatePropagation(); menu.classList.toggle('open'); }, true);
    header.addEventListener('mouseleave', function () { menu.classList.remove('open'); });
    menu.querySelectorAll('[data-path]').forEach(function (button) { button.onclick = function (e) { e.preventDefault(); menu.classList.remove('open'); openBasic(button.dataset.path); }; });
  }
  setInterval(mount, 500);
  setInterval(mountNativeWorkspace, 500);
  setInterval(mountMenu, 700);
  setInterval(cleanAllDemoLabels, 500);
  document.addEventListener('click', function (event) {
    var clicked = event.target && event.target.closest ? event.target : null;
    if (clicked) {
      var analystButton = clicked.closest('.analyst-grid article footer button');
      if (analystButton && analystButton.textContent.trim() === '研究员主页') {
        var analystCard = analystButton.closest('article');
        var analystName = analystCard && analystCard.querySelector('h3') ? analystCard.querySelector('h3').textContent.trim() : '';
        var analystIds = { '周正': 'zz', '林洲': 'lz', '韩熙': 'lt' };
        if (analystIds[analystName]) {
          event.preventDefault();
          event.stopPropagation();
          document.dispatchEvent(new CustomEvent('open-research-analyst', { detail: { id: analystIds[analystName] } }));
          return;
        }
      }
      var terminalSide = clicked.closest('.access-layout aside button');
      var terminalCard = clicked.closest('.access-rows article');
      var terminalAction = clicked.closest('.access-layout button, .access-layout a');
      var terminalText = [terminalSide, terminalCard, terminalAction].filter(Boolean).map(function (node) {
        return (node.textContent || '').replace(/\s+/g, '');
      }).join(' ');
      if (/终端下载|交易终端下载|选择终端/.test(terminalText)) {
        event.preventDefault();
        event.stopPropagation();
        location.href = '/terminal-download.html';
        return;
      }
    }
    var target = event.target && event.target.closest ? event.target.closest('.workspace-nav button:not([data-basic-workspace-nav])') : null;
    var custom = document.querySelector('.native-basic-workspace');
    if (!target || !custom) return;
    var box = document.querySelector('.workspace-content');
    if (box) box.classList.remove('native-basic-mode');
    custom.remove();
    var basic = document.querySelector('[data-basic-workspace-nav]');
    if (basic) basic.classList.remove('active');
  }, true);
  document.addEventListener('DOMContentLoaded', function () { mount(); mountMenu(); cleanAllDemoLabels(); });
})();
