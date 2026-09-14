/* ============================================================
   产业版优化方案 v1.1 · 交互增强层
   注入方式：index.html 末尾加载，不修改原编译产物
   覆盖优化点：W0-1 / W0-2 / W0-5 / W1-1~W1-5 / W4-3 / W4-4 / W4-5 /
              W4-6 / W4'-6 / W5-1~5-4 / X-2 / X-4 /
              投研支持·研究员主页（hxr，参考样式复刻，虚构演示数据）
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 全局状态 ---------- */
  var state = { signed: true };

  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var $$ = $all; /* 别名：现货报价卡历史代码使用 $$ */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function isHx(node) { return !!(node.closest && node.closest('.hx-toolbar,.hx-msg-panel,.hx-mask,.hx-ai-drawer,.hx-ai-ball,.hx-note,.hx-guest-ribbon')); }

  /* ---------- 轻提示 toast ---------- */
  function toast(text) {
    var t = el('div', '', text);
    t.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);z-index:1000;' +
      'background:#0b1f3a;color:#fff;padding:10px 18px;border-radius:8px;font-size:13px;' +
      'box-shadow:0 10px 25px rgba(11,31,58,.3);opacity:0;transition:opacity .2s';
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.style.opacity = '1'; });
    setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 250); }, 2600);
  }

  /* ==========================================================
     1. 演示工具条：签约身份切换（W0-2 / W1-1 / X-4）
     ========================================================== */
  function buildToolbar() {
    var bar = el('div', 'hx-toolbar');
    bar.innerHTML =
      '<b>演示工具 <small>v1.1 增强</small></b>' +
      '<div class="hx-seg">' +
      '<button data-role="signed" class="on">已签约 · 华辰金属</button>' +
      '<button data-role="guest">未签约访客</button>' +
      '</div>' +
      '<p>切换身份体验：未签约访客点击业务入口将触发签约引导（W0-2/X-4）。</p>';
    document.body.appendChild(bar);
    $all('.hx-seg button', bar).forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.signed = btn.getAttribute('data-role') === 'signed';
        $all('.hx-seg button', bar).forEach(function (b) { b.classList.toggle('on', b === btn); });
        decorate();
        toast(state.signed ? '已切换：签约客户「华辰金属」视图' : '已切换：未签约访客视图，业务入口将引导签约');
      });
    });
  }

  /* ==========================================================
     2. 签约引导模态框（X-4：价值说明 + 签约引导 + 联系客户经理）
     ========================================================== */
  var mask, modal;
  function buildModal() {
    mask = el('div', 'hx-mask');
    modal = el('div', 'hx-modal');
    mask.appendChild(modal);
    document.body.appendChild(mask);
    mask.addEventListener('click', function (e) { if (e.target === mask) mask.classList.remove('open'); });
  }
  function showSignModal() {
    modal.innerHTML =
      '<h3>开通产业客户服务</h3>' +
      '<p class="hx-modal-sub">您正在以访客身份浏览。以下业务需完成企业签约后使用：</p>' +
      '<ul>' +
      '<li>一单一策定制套保方案（场景模板 → 计划书交付）</li>' +
      '<li>大宗采销信息发布与意向对接</li>' +
      '<li>套保额度申请 / 交割进度跟踪 / 专属客户经理 1v1</li>' +
      '</ul>' +
      '<div class="hx-modal-actions">' +
      '<button class="hx-btn text" data-act="browse">继续浏览内容</button>' +
      '<button class="hx-btn primary" data-act="contact">联系客户经理了解签约</button>' +
      '</div>';
    mask.classList.add('open');
    $('[data-act=browse]', modal).onclick = function () { mask.classList.remove('open'); };
    $('[data-act=contact]', modal).onclick = function () {
      mask.classList.remove('open');
      toast('已通知专属客户经理「顾明远」，将在 1 个工作日内与您联系');
    };
  }
  function showSuitModal() {
    modal.innerHTML =
      '<h3>适当性校验（W4-5）</h3>' +
      '<p class="hx-modal-sub">提交申请前需完成适当性测评。测评约需 3 分钟，结果在有效期内无需重复作答。</p>' +
      '<div class="hx-modal-actions">' +
      '<button class="hx-btn text" data-act="back">返回修改</button>' +
      '<button class="hx-btn primary" data-act="kyc">去完成测评</button>' +
      '</div>';
    mask.classList.add('open');
    $('[data-act=back]', modal).onclick = function () { mask.classList.remove('open'); };
    $('[data-act=kyc]', modal).onclick = function () {
      mask.classList.remove('open');
      var kycBtn = $all('.site-shell button').filter(function (b) { return /风险偏好/.test(b.textContent); })[0];
      if (kycBtn) { kycBtn.click(); toast('已跳转至风险偏好 KYC 测评'); }
      else toast('请从左侧导航进入「风险偏好」完成测评');
    };
  }

  /* ==========================================================
     3. 点击拦截（capture 阶段，先于 React 事件）
        - 未签约访客 → 业务入口触发签约引导（W0-2 / W1-1）
        - 一单一策提交 → 适当性校验（W4-5）
     ========================================================== */
  var BUSINESS_TEXT = /发布需求|用此模板|提交申请|申请开通|进入交易|管理关注/;
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!(t instanceof Element)) return;
    if (isHx(t)) return;
    var btn = t.closest('button');
    if (!btn) return;
    var view = ($('.site-shell') || {}).getAttribute ? $('.site-shell').getAttribute('data-view') : '';

    if (!state.signed) {
      var isBusiness = btn.closest('.quick-services') || btn.closest('[data-need-sign]') || BUSINESS_TEXT.test(btn.textContent);
      if (isBusiness) { e.stopPropagation(); e.preventDefault(); showSignModal(); return; }
    }
    if (state.signed && view === 'scenario' && /提交申请/.test(btn.textContent)) {
      e.stopPropagation(); e.preventDefault(); showSuitModal(); return;
    }
  }, true);

  /* ==========================================================
     4. 消息中心：分级面板（W0-5）
     ========================================================== */
  var MSG = {
    biz: [
      { t: '一单一策申请 RM20260812031 状态更新', p: '已进入「方案沟通」，预计 2 个工作日内反馈', time: '10:24' },
      { t: '采销信息 CS20260813008 审核通过', p: '您发布的「出售·碳酸锂 99.5%」已公开展示', time: '09:12' }
    ],
    risk: [
      { t: '持仓风险指标接近预警线', p: '沪铜 CU2609 多头持仓敞口达预设阈值 85%，建议关注', time: '11:02', warn: true },
      { t: '保证金比例调整通知', p: '交易所上调螺纹钢保证金至 9%，请留意资金安排', time: '昨天', warn: true }
    ],
    content: [
      { t: '有色板块新增 3 篇研报', p: '周正《铜：库存去化速度仍是定价关键》等', time: '08:30' },
      { t: '《监管政策解读》专栏更新', p: '您关注的分类有新内容', time: '昨天' }
    ]
  };
  var msgPanel;
  function buildMsgPanel() {
    msgPanel = el('div', 'hx-msg-panel');
    document.body.appendChild(msgPanel);
  }
  function renderMsgPanel(tab) {
    if (!msgPanel || !msgPanel.isConnected) buildMsgPanel();
    var tabs = [['biz', '业务状态'], ['risk', '风控通知'], ['content', '内容更新']];
    msgPanel.innerHTML =
      '<header><b>消息中心</b><button data-close="1">✕</button></header>' +
      '<div class="hx-msg-tabs">' + tabs.map(function (x) {
        return '<button data-tab="' + x[0] + '" class="' + (x[0] === tab ? 'on' : '') + '">' + x[1] + '</button>';
      }).join('') + '</div>' +
      '<div class="hx-msg-list">' + MSG[tab].map(function (m) {
        return '<div class="hx-msg-item' + (m.warn ? ' warn' : '') + '"><i></i><div><h4>' + m.t + '</h4><p>' + m.p + '</p></div><time>' + m.time + '</time></div>';
      }).join('') + '</div>';
    $('[data-close]', msgPanel).onclick = function () { msgPanel.classList.remove('open'); };
    $all('[data-tab]', msgPanel).forEach(function (b) {
      b.onclick = function () { renderMsgPanel(b.getAttribute('data-tab')); };
    });
  }
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!(t instanceof Element)) return;
    var bell = t.closest('.bell');
    if (bell) {
      e.stopPropagation(); e.preventDefault();
      renderMsgPanel('biz');
      msgPanel.classList.toggle('open');
    } else if (!t.closest('.hx-msg-panel') && msgPanel.classList.contains('open')) {
      msgPanel.classList.remove('open');
    }
  }, true);

  /* ==========================================================
     5. AI 助理：悬浮球 + 抽屉（W5-1 ~ W5-4）
     ========================================================== */
  var aiDrawer;
  var AI_SCENES = [
    { k: 'delivery', b: '交割日历', s: '查交易所交割日程', q: '沪铜 CU2609 的交割日期是什么时候？', a: '沪铜 CU2609：最后交易日 9月15日，最后交割日 9月18日；仓单提交截止 9月17日 15:00。需要查看其他品种可继续问我。' },
    { k: 'account', b: '账户查询', s: '小账类资金持仓', q: '查询我的保证金可用余额', a: '您尾号 6028 的期货账户：保证金可用 ¥1,286,400，持仓占用 ¥2,143,700，风险度 62.4%。数据为原型演示。' },
    { k: 'riskrule', b: '风控规则', s: '小控类规则问答', q: '强平预警线是多少？', a: '默认风控规则：风险度 ≥ 85% 触发预警通知，≥ 100% 进入追保流程。您的企业可与客户经理约定个性化阈值。' }
  ];
  function aiAnswer(q) {
    if (/交割|日历/.test(q)) return AI_SCENES[0].a;
    if (/账户|资金|保证金|余额/.test(q)) return AI_SCENES[1].a;
    if (/风控|强平|规则|预警/.test(q)) return AI_SCENES[2].a;
    return null;
  }
  function buildAI() {
    var ball = el('button', 'hx-ai-ball', '🤖');
    ball.title = 'AI 助理（引导式问答）';
    document.body.appendChild(ball);

    aiDrawer = el('div', 'hx-ai-drawer');
    aiDrawer.innerHTML =
      '<div class="hx-ai-head"><b>🤖 AI 助理</b><button data-close="1">✕</button></div>' +
      '<div class="hx-ai-scenes">' + AI_SCENES.map(function (s) {
        return '<button data-q="' + s.q + '"><b>' + s.b + '</b><small>' + s.s + '</small></button>';
      }).join('') + '</div>' +
      '<div class="hx-ai-chat"><div class="hx-ai-msg bot">您好，我是产业版 AI 助理。点击上方便捷场景，或直接输入问题。</div></div>' +
      '<div class="hx-ai-bound">💡 我可以回答交割日程 / 账户查询 / 风控规则相关问题（引导式问答，限定标准答案范围）</div>' +
      '<div class="hx-ai-input"><input placeholder="请输入问题，如：CU2609 交割日期" /><button class="hx-btn primary" data-send="1">发送</button></div>' +
      '<div class="hx-ai-foot"><span class="hx-ai-status"><i></i>人工客服 · 24h 值守 · 在线</span><button data-human="1">转人工客服</button></div>';
    document.body.appendChild(aiDrawer);

    ball.addEventListener('click', function () { aiDrawer.classList.toggle('open'); });
    $('[data-close]', aiDrawer).addEventListener('click', function () { aiDrawer.classList.remove('open'); });
    $all('.hx-ai-scenes button', aiDrawer).forEach(function (b) {
      b.addEventListener('click', function () { aiAsk(b.getAttribute('data-q')); });
    });
    var input = $('.hx-ai-input input', aiDrawer);
    function submit() {
      var q = input.value.trim();
      if (!q) return;
      input.value = '';
      aiAsk(q);
    }
    $('[data-send]', aiDrawer).addEventListener('click', submit);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
    $('[data-human]', aiDrawer).addEventListener('click', function () {
      aiBot('已为您转接人工客服（24h 值守）。工单号 KF20260814-019，客服「顾明远」将尽快接入；您也可拨打服务热线 400-800-2026。');
    });
  }
  function aiUser(text) {
    var chat = $('.hx-ai-chat', aiDrawer);
    var m = el('div', 'hx-ai-msg user');
    m.textContent = text;
    chat.appendChild(m);
    chat.scrollTop = chat.scrollHeight;
  }
  function aiBot(html) {
    var chat = $('.hx-ai-chat', aiDrawer);
    chat.appendChild(el('div', 'hx-ai-msg bot', html));
    chat.scrollTop = chat.scrollHeight;
  }
  function aiAsk(q) {
    aiUser(q);
    var a = aiAnswer(q);
    setTimeout(function () {
      if (a) { aiBot(a); return; }
      var m = el('div', 'hx-ai-msg bot',
        '该问题超出我的服务范围（交割日程 / 账户查询 / 风控规则）。建议联系您的专属客户经理获得解答。' +
        '<button class="hx-human-link">转人工客服</button>');
      $('.hx-ai-chat', aiDrawer).appendChild(m);
      $('.hx-human-link', m).addEventListener('click', function () {
        aiBot('已为您转接人工客服（24h 值守）。工单号 KF20260814-019，客服将尽快接入。');
      });
      $('.hx-ai-chat', aiDrawer).scrollTop = 1e6;
    }, 350);
  }

  /* ==========================================================
     6. 视图级注入（W1-1 / W4-3 / W4-4 / W4-6 / W4'-6）
        MutationObserver 跟随 React 重渲染保持生效
     ========================================================== */
  var NOTES = {
    sourcing: ['info', '信息口径', '信息由我司审核后发布；平台仅提供信息发布与意向对接服务，意向请联系客户经理。一期不提供线上撮合。'],
    applications: ['', '时效承诺（W4-6）', '响应时效承诺：受理申请后 2 个工作日内首次反馈；方案类申请预计 5 个工作日内交付计划书 PDF。'],
    scenario: ['amber', '风险偏好 KYC（W4-4）', '尚未完成风险偏好测评？可「按中性偏好处理」先行提交，或先完成测评获得更适配的方案建议；未完成测评不阻断提交。'],
    exposure: ['', '敞口分析说明（W4-3）', '当前敞口分析基于期货持仓与套保信号；现货敞口请在一单一策需求表单中一并描述。'],
    stress: ['', '压力测试说明', '压力测试复用风控侧能力；套保预算化场景规划中。'],
    kyc: ['', '测评说明', '测评结果用于一单一策方案的风险偏好带出；未完成测评不阻断业务提交（W4-4 软引导）。']
  };

  /* ==========================================================
     首页 · 现货报价紧凑卡（参考华泰天玑现货报价结构）
     - 收敛为「报价列表/我的监控」两 Tab；申请与提醒记录归平台统一模块
     - 基差/涨跌：正红负绿；免责声明常驻；查看更多 → 独立关注品种现货页
     ========================================================== */
  var hxq = { tab: 'list', alerts: {} };
  var HX_QUOTES = {
    list: [
      { name: '热轧板卷', spec: '4.75mm · 汇总价格：上海', unit: '元/吨', spot: '3260', chg: 0, fold: '3260', fut: 'HC2610', futPrice: '3251', basis: 9, basisChg: -18 },
      { name: '螺纹钢', spec: 'HRB400E Φ18 · 汇总价格：上海', unit: '元/吨', spot: '3030', chg: -10, fold: null, fut: 'RB2610', futPrice: '3016', basis: 14, basisChg: -14 },
      { name: '沪铜', spec: '1#电解铜 · 汇总价格：上海', unit: '元/吨', spot: '79240', chg: 180, fold: '79240', fut: 'CU2609', futPrice: '79160', basis: 80, basisChg: 35 }
    ],
    watch: [
      { name: '沪铜', spec: '1#电解铜 · 汇总价格：上海', unit: '元/吨', spot: '79240', chg: 180, fold: '79240', fut: 'CU2609', futPrice: '79160', basis: 80, basisChg: 35 }
    ]
  };
  function fmtNum(n) {
    if (n > 0) return '<span class="hxq-up">+' + n + '</span>';
    if (n < 0) return '<span class="hxq-down">' + n + '</span>';
    return '<span class="hxq-flat">0</span>';
  }
  function buildQuoteCard() {
    var p = el('section', 'hxq-panel');
    renderHxq(p);
    return p;
  }
  function renderHxq(p) {
    var rows = hxq.tab === 'list' ? HX_QUOTES.list : HX_QUOTES.watch;
    var body = rows.map(function (r) {
      var alertKey = r.fut;
      var done = hxq.alerts[alertKey];
      return '<tr><td class="hxq-name"><b>' + r.name + ' <small>' + r.unit + '</small></b><small>' + r.spec + '</small></td>' +
        '<td>2026-08-14</td><td>' + r.spot + '</td><td>' + fmtNum(r.chg) + '</td>' +
        '<td>' + (r.fold || '-') + '</td>' +
        '<td>' + r.futPrice + '<br><span class="hxq-fut">主 ' + r.fut + '</span></td>' +
        '<td>' + fmtNum(r.basis) + '</td><td>' + fmtNum(r.basisChg) + '</td>' +
        '<td><button class="hxq-alert' + (done ? ' done' : '') + '" data-k="' + alertKey + '">' + (done ? '已提醒 ✓' : '新增提醒') + '</button></td></tr>';
    }).join('');
    var empty = hxq.tab === 'watch' && rows.length === 0
      ? '<tr><td colspan="9" style="text-align:center;color:rgba(0,0,0,.45);padding:26px">暂无监控品种，在报价列表点「新增提醒」即可加入监控</td></tr>' : '';
    p.innerHTML =
      '<div class="hxq-head"><h2>现货报价</h2>' +
      '<small>不构成投资建议，据此操作，风险自担。</small>' +
      '<button class="hxq-more">更多 ›</button></div>' +
      '<div class="hxq-tabs">' +
      '<button data-t="list" class="' + (hxq.tab === 'list' ? 'on' : '') + '">报价列表</button>' +
      '<button data-t="watch" class="' + (hxq.tab === 'watch' ? 'on' : '') + '">我的监控</button></div>' +
      '<table class="hxq-table"><thead><tr><th>品种</th><th>日期</th><th>现货价格</th><th>涨跌</th><th>现货折盘面价</th><th>期货价格</th><th>基差</th><th>基差变化</th><th>操作</th></tr></thead>' +
      '<tbody>' + (body || empty) + '</tbody></table>';
    $$('.hxq-tabs button', p).forEach(function (b) {
      b.addEventListener('click', function () { hxq.tab = b.dataset.t; renderHxq(p); });
    });
    $('.hxq-more', p).addEventListener('click', function () {
      location.href = '/spot-market.html';
    });
    $$('.hxq-alert', p).forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.classList.contains('done')) return;
        hxq.alerts[b.dataset.k] = true;
        toast('已添加基差提醒：' + b.dataset.k + '，触发阈值后消息通知');
        renderHxq(p);
      });
    });
  }

  function decorate() {
    var shell = $('.site-shell');
    if (!shell) return;
    var view = shell.getAttribute('data-view') || 'home';

    /* W0-1 一级导航红点：投研支持 / 基础服务 */
    $all('.main-header nav button').forEach(function (b) {
      var needDot = /投研支持|基础服务/.test(b.textContent);
      b.classList.toggle('hx-nav-dot', needDot);
    });
    bindTopNav(shell);

    /* 品牌字样：恒衍 → 国泰 / 国泰君安期货 */
    var logoSpan = $('.main-header .logo span');
    if (logoSpan && logoSpan.textContent !== '国泰') logoSpan.textContent = '国泰';
    var utilFirst = $('.utility > div > span');
    if (utilFirst && utilFirst.textContent !== '国泰君安期货') utilFirst.textContent = '国泰君安期货';

    /* W0-5 铃铛徽标 */
    var bell = $('.header-actions .bell');
    if (bell && !$('.hx-bell-badge', bell)) {
      bell.appendChild(el('i', 'hx-bell-badge', '6'));
    }

    /* 视图级提示条：插入 main 顶部（仅直接子级，避免误删重建模块内的提示条） */
    var main = $('main', shell);
    if (main) {
      var old = main.querySelector(':scope > .hx-note');
      if (old) old.remove();
      var cfg = NOTES[view];
      if (cfg) {
        var note = el('div', 'hx-note ' + cfg[0], '<b>' + cfg[1] + '</b><span>' + cfg[2] + '</span>');
        var firstWrap = main.firstElementChild;
        if (firstWrap) main.insertBefore(note, firstWrap);
        else main.appendChild(note);
      }
    }

    /* W1 首页重建 + W-NAV 基础服务重建 + W-RSR 研究员主页：覆盖渲染，离开卸载 */
    var homeApp = document.getElementById('hxw-app');
    var basicApp = document.getElementById('hxb-app');
    var researchApp = document.getElementById('hxr-app');
    if (main) {
      main.classList.toggle('hx-main-override', view === 'home' || view === 'basic');
      if (view === 'home') {
        if (!homeApp) main.appendChild(buildHomeApp());
        else renderHwKingkong(homeApp); /* W1-1 身份切换时重排金刚区 */
      } else if (homeApp) { stopHwBanner(); homeApp.remove(); hw.lastSigned = null; }
      if (view === 'basic') {
        if (!basicApp) main.appendChild(buildBasicApp());
      } else if (basicApp) basicApp.remove();
      if (view === 'research') {
        /* 二级目录为顶部 hover 下拉菜单；原侧栏隐藏，内容占满整页 */
        var rLayout = $('.research-layout', shell);
        if (rLayout) {
          rLayout.classList.toggle('hxr-on', !!hxr.mode);
          var wantId = hxr.mode === 'analyst' ? 'hxr-app' : (hxr.mode === 'reports' ? 'hxd-app' : (hxr.mode === 'weekly' ? 'hxwk-app' : (hxr.mode === 'api' ? 'hxa-app' : '')));
          ['hxr-app', 'hxd-app', 'hxwk-app', 'hxa-app'].forEach(function (id) {
            var n = document.getElementById(id);
            if (id !== wantId && n) n.remove();
          });
          if (wantId) {
            var cur = document.getElementById(wantId);
            if (!cur || cur.parentNode !== rLayout) {
              if (cur) cur.remove();
              rLayout.appendChild(wantId === 'hxr-app' ? buildResearchApp() : (wantId === 'hxd-app' ? buildReportApp() : (wantId === 'hxwk-app' ? buildWeeklyApp() : buildApiApp())));
            }
          }
        }
      } else {
        /* 注意：不在此重置 hxr.mode——React 重渲染期间 data-view 可能
           短暂停留旧值，重置会冲掉深链/点击设置的子板块；
           重置时机改在一级导航点击（bindTopNav） */
        if (researchApp) researchApp.remove();
        var reportApp = document.getElementById('hxd-app');
        if (reportApp) reportApp.remove();
        var weeklyApp = document.getElementById('hxwk-app');
        if (weeklyApp) weeklyApp.remove();
        var apiApp = document.getElementById('hxa-app');
        if (apiApp) apiApp.remove();
      }

      /* 智能交易工作台：替换原占位工作台；交易接入服务页面保持原样 */
      var tradeApp = document.getElementById('hxt-app');
      if (view === 'smart') {
        var legacy = $('.legacy-trading', shell);
        if (legacy && (!tradeApp || tradeApp.parentNode !== legacy.parentNode)) {
          if (tradeApp) tradeApp.remove();
          legacy.parentNode.insertBefore(buildTradeApp(), legacy);
        }
      } else if (tradeApp) tradeApp.remove();
    }

    /* 下拉二级菜单：元素只建一次，但激活项高亮需每次 decorate 同步 */
    buildNavDrop(shell);

    /* 首页 · 现货报价紧凑卡：保留在 W1 模块之后，离开首页卸载 */
    var qCard = document.querySelector('.hxq-panel');
    if (main) {
      if (view === 'home') {
        if (!qCard) {
          homeApp = document.getElementById('hxw-app');
          if (homeApp) main.insertBefore(buildQuoteCard(), homeApp.nextSibling);
        }
      } else if (qCard) qCard.remove();
    }

    /* W1-1 未签约访客提示带 */
    var oldRibbon = $('.hx-guest-ribbon');
    if (oldRibbon) oldRibbon.remove();
    if (!state.signed) {
      var ribbon = el('div', 'hx-guest-ribbon',
        '当前为未签约访客视图：内容栏目可自由浏览，业务办理入口将引导签约。 <button data-sign="1">了解签约 ›</button>');
      var header = $('.main-header', shell);
      if (header && header.nextSibling) shell.insertBefore(ribbon, header.nextSibling);
      $('[data-sign]', ribbon).addEventListener('click', showSignModal);
    }

    /* X-2 即将上线统一置灰 + tooltip */
    $all('.site-shell button').forEach(function (b) {
      var soon = /即将上线|规划中/.test(b.textContent) && b.textContent.length < 30;
      b.classList.toggle('hx-coming-soon', soon);
      if (soon) b.title = '规划中，敬请期待';
    });
  }

  /* ==========================================================
     7. 基础服务 · W-NAV 模板A 重建
        侧栏：咨询与知识[C] / 工具与案例库[C] / 活动与调研[R↗]
              / 人才服务[C+F] / 仓单及交割指南[C+R↗]
     ========================================================== */
  var HXB_TABS = ['全部', '政策解读', '套保会计', '内控制度', '基础知识'];
  var HXB_DOT_TABS = ['政策解读'];            /* W2-1 红点分类 */
  /* W2 侧栏分类树：咨询与知识子分类（CMS 分类树，监管解读🔴复用关注链路） */
  var HXB_CONSULT_CHILDREN = [
    { name: '可行性分析', tab: '可行性分析' },
    { name: '内控制度', tab: '内控制度' },
    { name: '监管解读', tab: '政策解读', dot: true },
    { name: '套保会计', tab: '套保会计' },
    { name: '基础知识', tab: '基础知识' }
  ];
  var HXB_ARTICLES = [
    { cat: '政策解读', title: '《期货和衍生品法》实施要点与企业合规清单', date: '08-12', isNew: true, file: '企业合规清单.pdf' },
    { cat: '政策解读', title: '场外衍生品业务监管新规解读：对产业客户的影响', date: '08-05' },
    { cat: '套保会计', title: '套保会计实操：现金流量套期的会计处理', date: '08-08', file: '分录示例.xlsx' },
    { cat: '套保会计', title: '套期有效性评估的常见问答', date: '07-28' },
    { cat: '内控制度', title: '企业衍生品业务内控制度模板（可下载）', date: '07-20', file: '内控制度模板.docx' },
    { cat: '内控制度', title: '衍生品业务授权与审批流程设计要点', date: '07-12' },
    { cat: '基础知识', title: '期货期权基础图解：从远期到期权', date: '07-10' },
    { cat: '基础知识', title: '交割与仓单业务入门速查', date: '07-02' }
    /* 可行性分析：暂无内容 → 演示 W2-5 空态 */
  ];
  /* C/R/F 仅为内部功能分类标注，界面不展示（HXB_SECTIONS 仅存结构与红点） */
  var HXB_SECTIONS = [
    { id: 'consult', name: '咨询与知识', dot: true },
    { id: 'tools', name: '工具与案例库' },
    { id: 'events', name: '活动与调研' },
    { id: 'talent', name: '人才服务' },
    { id: 'guide', name: '仓单及交割', jump: true }   /* W2-2 复用型跳转项，不建本地内容 */
  ];
  var HXB_EVENTS = [
    { d: '20', m: '8月', title: '有色产业链沙龙', meta: '线下 · 上海 · 15:00—17:00', type: '沙龙' },
    { d: '02', m: '9月', title: '黑色产业链秋季供需展望', meta: '线上直播 · 15:00—16:30', type: '峰会' },
    { d: '22', m: '9月', title: '华东铜加工企业调研行', meta: '线下调研 · 江苏常州 · 审核中', type: '调研' }
  ];
  var hxb = { section: 'consult', tab: '全部', page: 1, article: null, fav: {}, talentDone: false };

  function resetMigratedBasicScroll(frame) {
    var reset = function () {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      try {
        if (frame && frame.contentWindow) frame.contentWindow.scrollTo(0, 0);
        if (frame && frame.contentDocument) {
          frame.contentDocument.documentElement.scrollTop = 0;
          frame.contentDocument.body.scrollTop = 0;
        }
      } catch (ignore) {}
    };
    reset();
    window.requestAnimationFrame(reset);
    setTimeout(reset, 80);
    setTimeout(reset, 260);
  }

  function buildBasicApp() {
    var app = el('div', 'hxb-migrated-shell', ''); app.id = 'hxb-app';
    var frame = document.createElement('iframe');
    frame.className = 'hxb-migrated-frame';
    frame.style.cssText = 'display:block;width:100%;min-width:100%;min-height:720px;border:0;background:transparent;';
    frame.title = '基础服务';
    frame.src = migratedBasicTarget || '/basic-service/basic-service-home.html';
    frame.addEventListener('load', function () {
      resetMigratedBasicScroll(frame);
      try {
        var doc = frame.contentDocument;
        var style = doc.createElement('style');
        style.textContent = 'header,.header,.utility,.top,.site-footer,footer,.data-disclaimer,.prototype-notice,.service-mega,.mega-menu{display:none!important}body{background:transparent!important;font-family:inherit!important;padding-top:0!important}main{padding-top:0!important}.crumb{margin-top:16px!important}';
        doc.head.appendChild(style);
        doc.addEventListener('click', function (event) {
          var control = event.target && event.target.closest ? event.target.closest('a,button,[data-link],[data-go],[data-page-link],[data-action]') : null;
          if (!control) return;
          var destination = control.getAttribute('href') || control.getAttribute('data-link') || control.getAttribute('data-go') || control.getAttribute('data-page-link') || '';
          var action = control.getAttribute('data-action') || '';
          var label = (control.textContent || '').trim();
          if (!/workbench/i.test(destination + ' ' + action) && label.indexOf('工作台') < 0) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          var entry = document.querySelector('.workspace-entry');
          if (entry) entry.click();
        }, true);
        var syncHeight = function () { frame.style.height = Math.max(720, doc.documentElement.scrollHeight) + 'px'; };
        syncHeight();
        if (window.ResizeObserver) new ResizeObserver(syncHeight).observe(doc.body);
      } catch (ignore) {}
    });
    app.appendChild(frame);
    return app;
  }
  function renderHxbSide(app) {
    var side = $('.hxb-side', app);
    side.innerHTML = '';
    HXB_SECTIONS.forEach(function (s) {
      var b = el('button');
      b.className = s.id === hxb.section ? 'on' : '';
      b.innerHTML = (s.dot ? '<i class="hxb-dot"></i>' : '') + '<span>' + s.name + '</span>' + (s.jump ? '<i class="hxb-jump">↗</i>' : '');
      b.addEventListener('click', function () {
        if (s.jump) { toast('已带来源参数跳转主经纪商服务·' + s.name + '（W2-2，不重复开发），返回时回到本栏目'); return; }
        hxb.section = s.id; hxb.article = null; hxb.page = 1;
        renderHxbSide(app); renderHxbMain(app);
      });
      side.appendChild(b);
      /* 咨询与知识展开 CMS 分类树子项 */
      if (s.id === 'consult' && hxb.section === 'consult') {
        HXB_CONSULT_CHILDREN.forEach(function (c) {
          var cb = el('button', 'hxb-child' + (hxb.tab === c.tab ? ' on' : ''));
          cb.innerHTML = (c.dot ? '<i class="hxb-dot"></i>' : '') + '<span>' + c.name + '</span>';
          cb.addEventListener('click', function () {
            hxb.tab = c.tab; hxb.article = null; hxb.page = 1;
            renderHxbSide(app); renderHxbMain(app);
          });
          side.appendChild(cb);
        });
      }
    });
  }
  function hxbCrumb(name) {
    return '<div class="hxb-crumb">产业版首页 › 基础服务 › <b>' + name + '</b></div>';
  }
  function renderHxbMain(app) {
    var box = $('.hxb-main', app);
    if (hxb.section === 'consult') return renderHxbConsult(box);
    if (hxb.section === 'tools') return renderHxbTools(box);
    if (hxb.section === 'events') return renderHxbEvents(box);
    if (hxb.section === 'talent') return renderHxbTalent(box);
  }
  /* 咨询与知识：Tab + 列表 + 详情（W2-1 / W2-3 / W2-5） */
  function renderHxbConsult(box) {
    if (hxb.article) return renderHxbDetail(box, hxb.article);
    var html = hxbCrumb('咨询与知识') +
      '<h3 class="hxb-section-title">咨询与知识</h3>' +
      '<p class="hxb-section-sub">CMS 供稿 · 复用研报详情模板与关注链路；🔴 = 关注分类有更新</p>' +
      '<div class="hxb-tabs">' + HXB_TABS.map(function (t) {
        return '<button data-tab="' + t + '" class="' + (t === hxb.tab ? 'on' : '') + '">' + t +
          (HXB_DOT_TABS.indexOf(t) >= 0 ? '<i class="hxb-dot"></i>' : '') + '</button>';
      }).join('') + '</div><div class="hxb-list"></div><div class="hxb-pager"></div>';
    box.innerHTML = html;
    var list = $('.hxb-list', box);
    var items = HXB_ARTICLES.filter(function (a) { return hxb.tab === '全部' || a.cat === hxb.tab; });
    if (!items.length) {
      list.innerHTML = '<div class="hxb-empty"><b>内容整理中（W2-5 空态）</b>「' + hxb.tab + '」分类暂无内容，可订阅提醒，上线后通过消息🔔通知。</div>';
      $('.hxb-empty', list).appendChild(hxbBtn('订阅提醒', '', function () { toast('已订阅「' + hxb.tab + '」更新提醒'); }));
    }
    /* 列表分页：每页 5 条 */
    var PAGE = 5;
    var pages = Math.max(1, Math.ceil(items.length / PAGE));
    if (hxb.page > pages) hxb.page = pages;
    items.slice((hxb.page - 1) * PAGE, hxb.page * PAGE).forEach(function (a) {
      var row = el('div', 'hxb-item');
      row.innerHTML = '<span class="hxb-cat">' + a.cat + '</span><h4>📄 ' + a.title + '</h4>' +
        (a.isNew ? '<span class="hxb-new">NEW</span>' : '') +
        '<time>' + a.date + '</time>' +
        '<button class="hxb-star' + (hxb.fav[a.title] ? ' on' : '') + '" title="收藏">' + (hxb.fav[a.title] ? '★' : '☆') + '</button>';
      $('.hxb-star', row).addEventListener('click', function (e) {
        e.stopPropagation();
        hxb.fav[a.title] = !hxb.fav[a.title];
        renderHxbConsult(box);
        toast(hxb.fav[a.title] ? '已收藏' : '已取消收藏');
      });
      row.addEventListener('click', function () { hxb.article = a; renderHxbMain($('#hxb-app')); });
      list.appendChild(row);
    });
    var pager = $('.hxb-pager', box);
    if (pages > 1) {
      var pHtml = '<button data-p="prev"' + (hxb.page === 1 ? ' disabled' : '') + '>‹</button>';
      for (var pi = 1; pi <= pages; pi++) pHtml += '<button data-p="' + pi + '" class="' + (pi === hxb.page ? 'on' : '') + '">' + pi + '</button>';
      pHtml += '<button data-p="next"' + (hxb.page === pages ? ' disabled' : '') + '>›</button>';
      pager.innerHTML = pHtml;
      $all('button', pager).forEach(function (b) {
        b.addEventListener('click', function () {
          var p = b.getAttribute('data-p');
          if (p === 'prev') hxb.page = Math.max(1, hxb.page - 1);
          else if (p === 'next') hxb.page = Math.min(pages, hxb.page + 1);
          else hxb.page = +p;
          renderHxbConsult(box);
        });
      });
    }
    $all('[data-tab]', box).forEach(function (b) {
      b.addEventListener('click', function () { hxb.tab = b.getAttribute('data-tab'); hxb.page = 1; renderHxbConsult(box); });
    });
  }
  function renderHxbDetail(box, a) {
    box.innerHTML = hxbCrumb('咨询与知识') +
      '<div class="hxb-detail">' +
      '<h2>' + a.title + '</h2>' +
      '<div class="hxb-meta">' + a.date + ' · ' + a.cat + ' · 内容运营供稿（复用研报详情模板）</div>' +
      '<p>本篇为原型演示正文。实际生产中由 CMS 供稿，正文、附件与分类关注能力复用研报详情页模板，无需重复开发。</p>' +
      '<p>要点包括：适用场景、操作流程、合规边界与常见问题；配套模板/工具以附件形式提供下载。</p>' +
      (a.file ? '<div class="hxb-file">📎 ' + a.file + '</div>' : '') +
      '<div class="hxb-actions"></div></div>';
    var actions = $('.hxb-actions', box);
    if (a.file) $('.hxb-file', box).appendChild(hxbBtn('下载附件', 'primary', function () { toast('附件下载已开始（演示）'); }));
    actions.appendChild(hxbBtn('‹ 返回列表', 'text', function () { hxb.article = null; renderHxbMain($('#hxb-app')); }));
    actions.appendChild(hxbBtn('关注该分类', 'primary', function () {
      toast('已关注「' + a.cat + '」：后续更新将通过消息🔔推送并在侧栏显示红点（W2-3 闭环）');
    }));
  }
  /* 工具与案例库 */
  function renderHxbTools(box) {
    var tools = [
      { b: '制度模板库', p: '内控制度、授权审批、业务台账等模板，可直接下载使用。', f: '制度模板包.zip' },
      { b: '测算工具', p: '套保比例测算表、基差/榨利测算模板（Excel）。', f: '测算工具包.xlsx' },
      { b: '行业案例集', p: '有色/黑色/能化产业链套保案例汇编（去公司名）。', f: '案例集.pdf' }
    ];
    box.innerHTML = hxbCrumb('工具与案例库') +
      '<h3 class="hxb-section-title">工具与案例库</h3>' +
      '<p class="hxb-section-sub">制度模板 / 测算工具 / 行业案例下载（CMS 供稿）</p>' +
      '<div class="hxb-cards">' + tools.map(function (t) {
        return '<div class="hxb-card"><b>' + t.b + '</b><p>' + t.p + '</p><small style="color:var(--muted,#6d7989)">📎 ' + t.f + '</small></div>';
      }).join('') + '</div>';
    $all('.hxb-card', box).forEach(function (c, i) {
      c.appendChild(hxbBtn('下载', '', function () { toast('「' + tools[i].b + '」下载已开始（演示）'); }));
    });
  }
  /* 活动与调研：R·复用会议预约 */
  function renderHxbEvents(box) {
    box.innerHTML = hxbCrumb('活动与调研') +
      '<h3 class="hxb-section-title">活动与调研</h3>' +
      '<p class="hxb-section-sub">沙龙 / 培训 / 产地调研报名 · 复用线下会议预约链路 [R↗]</p>' +
      '<div>' + HXB_EVENTS.map(function (ev) {
        return '<div class="hxb-event"><time><b>' + ev.d + '</b><span>' + ev.m + '</span></time>' +
          '<div><h4>' + ev.title + '</h4><p>' + ev.type + ' · ' + ev.meta + '</p></div></div>';
      }).join('') + '</div>';
    $all('.hxb-event', box).forEach(function (row, i) {
      row.appendChild(hxbBtn('报名', 'primary', function () {
        toast('已带来源参数跳转「会议预约」（R·复用，不重复开发）：' + HXB_EVENTS[i].title);
      }));
    });
  }
  /* 人才服务：C+F 培训计划报名 + 专家库空态 */
  function renderHxbTalent(box) {
    box.innerHTML = hxbCrumb('人才服务') +
      '<h3 class="hxb-section-title">产业人才培训计划</h3>' +
      '<p class="hxb-section-sub">套保会计/期货入门/定制内训 · 提交报名后由人力资源部对接 [C+F]</p>' +
      (hxb.talentDone
        ? '<div class="hx-note info"><b>已提交</b><span>报名已受理，人力资源部将在 2 个工作日内与您联系。</span></div>'
        : '<form class="hxb-form">' +
          '<label>企业名称<input required placeholder="如：华辰金属"/></label>' +
          '<label>联系人<input required placeholder="姓名"/></label>' +
          '<label>联系电话<input required placeholder="手机/座机"/></label>' +
          '<label>意向方向<select><option>套保会计培训</option><option>期货入门培训</option><option>定制内训（上门）</option></select></label>' +
          '<label class="full">备注<textarea rows="2" placeholder="可选：人数、期望时间等"></textarea></label>' +
          '<div class="full"></div></form>') +
      '<div class="hxb-empty"><b>外部专家资源库</b>模块建设中（一期降级为内容介绍，见待确认问题 Q3）</div>';
    if (!hxb.talentDone) {
      var holder = $('.hxb-form .full', box);
      holder.appendChild(hxbBtn('提交报名', 'primary', function (e) {
        e.preventDefault();
        hxb.talentDone = true;
        renderHxbTalent(box);
        toast('报名已提交，将同步至「我的意向单」状态跟踪');
      }));
      $('.hxb-form', box).addEventListener('submit', function (e) { e.preventDefault(); });
    }
    var empty = $('.hxb-empty', box);
    empty.appendChild(hxbBtn('订阅提醒', '', function () { toast('已订阅「外部专家资源库」上线提醒'); }));
  }
  function hxbBtn(text, kind, fn) {
    var b = el('button', 'hx-btn' + (kind ? ' ' + kind : ''), '');
    b.textContent = text;
    b.addEventListener('click', fn);
    return b;
  }

  /* ==========================================================
     8. 首页 · W1 线框稿重建（分流枢纽，不承载功能）
        Banner 轮播 + 我的工作台聚合(W1-2) + 金刚区(W1-1)
        + 产业投研精选(W1-4) + 政策解读 + 采销速览(W1-3) + 研究与活动(W1-5)
     ========================================================== */
  var hw = { slide: 0, timer: null, lastSigned: null, workbenchPreview: 'biz' };

  function goNav(name) {
    var btns = document.querySelectorAll('.main-header nav button');
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].textContent.trim() === name) { btns[i].click(); return; }
    }
  }
  var migratedBasicTarget = '/basic-service/basic-service-home.html';
  document.addEventListener('open-migrated-basic', function (event) {
    var target = event && event.detail && event.detail.path;
    if (!target) return;
    migratedBasicTarget = target;
    var shell = document.querySelector('.site-shell');
    var main = document.querySelector('main');
    if (!shell || !main) return;
    shell.setAttribute('data-view', 'basic');
    resetMigratedBasicScroll();
    var app = document.getElementById('hxb-app');
    if (!app) {
      main.appendChild(buildBasicApp());
      app = document.getElementById('hxb-app');
    }
    var frame = app && app.querySelector('iframe');
    if (frame && frame.getAttribute('src') !== target) frame.src = target;
    resetMigratedBasicScroll(frame);
  });
  function goBasic(section, tab) {
    var target = '/basic-service/basic-service-home.html';
    if (section === 'consult') target = '/basic-service/consulting-center.html';
    if (section === 'events') target = '/basic-service/service-hubs.html#activity';
    if (section === 'talent') target = '/basic-service/service-hubs.html#talent';
    migratedBasicTarget = target;
    goNav('基础服务');
    var frame = document.querySelector('#hxb-app iframe');
    if (frame) frame.src = target;
  }

  function decorateBasicWorkspace(main, view) {
    var panel = document.getElementById('hx-basic-workspace-summary');
    if (view !== 'workspace') { if (panel) panel.remove(); return; }
    if (panel || !main) return;
    panel = el('section', 'hx-basic-workspace-summary panel',
      '<div><small>BASIC SERVICES</small><h2>基础服务记录</h2><p>查看咨询申请、课程学习、活动预约和人才服务进度</p></div>' +
      '<dl><div><dt>在办申请</dt><dd>2</dd></div><div><dt>我的活动</dt><dd>1</dd></div><div><dt>学习中课程</dt><dd>2</dd></div><div><dt>关注服务</dt><dd>1</dd></div></dl>' +
      '<button type="button">进入基础服务工作台 ›</button>');
    panel.querySelector('button').addEventListener('click', function () {
      var app = document.getElementById('hxb-app');
      migratedBasicTarget = '/basic-service/index.html#workbench';
      var shell = document.querySelector('.site-shell');
      shell.setAttribute('data-view', 'basic');
      if (!app) main.appendChild(buildBasicApp());
    });
    main.insertBefore(panel, main.firstElementChild);
  }

  var HW_BANNERS = [
    { t: '产业版一站式服务', p: '研究洞察 · 风险管理 · 大宗采销 · 交易接入，面向产业客户的全流程服务枢纽', b: '了解服务边界', act: function () { goNav('产业咨询'); } },
    { t: '君英汇 · 黑色产业链秋季峰会', p: '09-02 上海 · 线下峰会报名通道已开启', b: '立即报名', act: function () { toast('已带来源参数跳转「会议预约」（R·复用）：黑色产业链秋季峰会'); } },
    { t: '新功能上线：AI 助理', p: '交割日历 / 账户查询 / 风控规则引导式问答，24h 人工客服值守', b: '立即体验', act: function () { aiDrawer.classList.add('open'); } }
  ];
  var HW_KING = [
    { k: 'quota', ico: '🛡', name: '套保额度', biz: 1, go: function () { goNav('风险管理'); } },
    { k: 'delivery', ico: '📦', name: '仓单交割', biz: 1, go: function () { toast('已带来源参数跳转主经纪商服务·仓单及交割（W2-2），返回时回到首页'); } },
    { k: 'suit', ico: '📋', name: '一单一策', biz: 1, go: function () { goNav('风险管理'); } },
    { k: 'sourcing', ico: '🚚', name: '采销信息', biz: 1, go: function () { goNav('大宗采销'); } },
    { k: 'risk', ico: '⚖️', name: '风险管理', biz: 1, go: function () { goNav('风险管理'); } },
    { k: 'research', ico: '📈', name: '研报中心', biz: 0, go: function () { goNav('投研支持'); } },
    { k: 'events', ico: '📅', name: '会议报名', biz: 0, go: function () { goBasic('events'); } },
    { k: 'manager', ico: '🤝', name: '联系客户经理', biz: 0, go: function () { toast('已通知专属客户经理「顾明远」，将在 1 个工作日内与您联系'); } }
  ];

  function buildHomeApp() {
    var app = el('div', ''); app.id = 'hxw-app';
    app.innerHTML =
      '<div class="hw-top">' +
      '<div class="hw-banner"><div class="hw-slides"></div><div class="hw-dots"></div></div>' +
      '<aside class="hw-workbench panel"></aside>' +
      '</div>' +
      '<div class="hw-kingkong panel"></div>' +
      '<div class="hw-grid">' +
      '<section class="hw-research panel"></section>' +
      '<section class="hw-policy panel"></section>' +
      '<section class="hw-sourcing panel"></section>' +
      '<section class="hw-events panel"></section>' +
      '</div>';
    renderHwBanner(app);
    renderHwWorkbench(app);
    renderHwKingkong(app);
    renderHwResearch(app);
    renderHwPolicy(app);
    renderHwSourcing(app);
    renderHwEvents(app);
    return app;
  }

  /* Banner 轮播：5s 自动 + 圆点手动 */
  function renderHwBanner(app) {
    var slides = $('.hw-slides', app), dots = $('.hw-dots', app);
    slides.innerHTML = HW_BANNERS.map(function (s, i) {
      return '<div class="hw-slide s' + i + '"><div><h2>' + s.t + '</h2><p>' + s.p + '</p>' +
        '<button data-i="' + i + '">' + s.b + '</button></div></div>';
    }).join('');
    dots.innerHTML = HW_BANNERS.map(function (s, i) {
      return '<button data-i="' + i + '" aria-label="第' + (i + 1) + '屏"></button>';
    }).join('');
    function show(i) {
      hw.slide = i;
      $all('.hw-slide', slides).forEach(function (n, j) { n.classList.toggle('on', j === i); });
      $all('button', dots).forEach(function (n, j) { n.classList.toggle('on', j === i); });
    }
    function restart() {
      stopHwBanner();
      hw.timer = setInterval(function () { show((hw.slide + 1) % HW_BANNERS.length); }, 5000);
    }
    show(0);
    $all('button', slides).forEach(function (b) {
      b.addEventListener('click', function () { HW_BANNERS[+b.getAttribute('data-i')].act(); });
    });
    $all('button', dots).forEach(function (b) {
      b.addEventListener('click', function () { show(+b.getAttribute('data-i')); restart(); });
    });
    restart();
  }
  function stopHwBanner() { if (hw.timer) { clearInterval(hw.timer); hw.timer = null; } }

  /* 我的工作台（W1-2：聚合各模块申请单状态，不在首页另建状态） */
  function renderHwWorkbench(app) {
    var w = $('.hw-workbench', app);
    var previews = {
      biz: {
        title: '在办业务待办',
        items: [
          ['铜原料采购敞口管理', '顾问方案待确认 · 今天 16:00', '跟进中', 'applications'],
          ['华东地区电解铜采购需求', '等待确认交货窗口 · 08月26日', '已受理', 'applications']
        ]
      },
      risk: {
        title: '风控通知待办',
        items: [
          ['沪铜持仓风险度接近预警线', '风险度 85% · 11:02', '需关注', 'risk'],
          ['螺纹钢保证金比例调整', '新比例 9% · 明日生效', '待确认', 'risk']
        ]
      },
      follow: {
        title: '我的关注更新',
        items: [
          ['周正发布铜产业链最新观点', '有色研究 · 12分钟前', '新观点', 'analyst-zz'],
          ['华东铜升贴水触发关注阈值', '当前 +120 元/吨 · 35分钟前', '已触发', 'indicators']
        ]
      }
    };
    var active = previews[hw.workbenchPreview];
    var previewHtml = active ? '<section class="hw-wb-preview"><header><b>' + active.title + '</b><button data-w-detail="' + hw.workbenchPreview + '">查看全部 ›</button></header>' +
      active.items.map(function (item) {
        return '<button type="button" class="hw-wb-task" data-w-item="' + item[3] + '"><i></i><span><strong>' + item[0] + '</strong><small>' + item[1] + '</small></span><em>' + item[2] + '</em><b>›</b></button>';
      }).join('') + '</section>' : '';
    w.innerHTML =
      '<div class="block-title"><div><h2>我的工作台</h2></div>' +
      '<button class="link-button" data-w="all">全部记录 ›</button></div>' +
      '<div class="hw-wb-tabs">' +
      '<button class="hw-wb-item' + (hw.workbenchPreview === 'biz' ? ' active' : '') + '" data-w="biz"><b>在办业务</b><em>3 项</em><i>›</i></button>' +
      '<button class="hw-wb-item' + (hw.workbenchPreview === 'risk' ? ' active' : '') + '" data-w="risk"><b>风控通知</b><em class="warn">⚠ 2</em><i>›</i></button>' +
      '<button class="hw-wb-item' + (hw.workbenchPreview === 'follow' ? ' active' : '') + '" data-w="follow"><b>我的关注</b><em class="dot">7</em><i>›</i></button></div>' + previewHtml;
    var acts = {
      all: function () { var b = $('.workspace-entry'); if (b) b.click(); },
      biz: function () { hw.workbenchPreview = 'biz'; renderHwWorkbench(app); },
      risk: function () { hw.workbenchPreview = 'risk'; renderHwWorkbench(app); },
      follow: function () { hw.workbenchPreview = 'follow'; renderHwWorkbench(app); }
    };
    $all('[data-w]', w).forEach(function (b) {
      b.addEventListener('click', function () { acts[b.getAttribute('data-w')](); });
    });
    $all('[data-w-item]', w).forEach(function (b) {
      b.addEventListener('click', function () { openWorkbenchItem(b.getAttribute('data-w-item')); });
    });
    var detail = $('[data-w-detail]', w);
    if (detail) detail.addEventListener('click', function () {
      var type = detail.getAttribute('data-w-detail');
      if (type === 'risk') { renderMsgPanel('risk'); msgPanel.classList.add('open'); return; }
      if (type === 'follow') { goNav('投研支持'); return; }
      var entry = $('.workspace-entry'); if (entry) entry.click();
    });
  }

  function openWorkspaceFollow(tabName) {
    var entry = $('.workspace-entry');
    if (entry) entry.click();
    var tries = 0;
    (function seek() {
      var navButton = $all('.workspace-nav button').filter(function (b) { return b.textContent.indexOf('我的关注') >= 0; })[0];
      if (!navButton && tries++ < 12) { setTimeout(seek, 80); return; }
      if (navButton) navButton.click();
      setTimeout(function () {
        var tabButton = $all('.follow-tabs button').filter(function (b) { return b.textContent.indexOf(tabName) >= 0; })[0];
        if (tabButton) tabButton.click();
      }, 100);
    })();
  }
  function openWorkbenchItem(action) {
    if (action === 'risk') { renderMsgPanel('risk'); msgPanel.classList.add('open'); return; }
    if (action === 'analyst-zz') {
      document.dispatchEvent(new CustomEvent('open-research-analyst', { detail: { id: 'zz' } }));
      return;
    }
    if (action === 'indicators') { openWorkspaceFollow('指标'); return; }
    var entry = $('.workspace-entry'); if (entry) entry.click();
  }

  /* 金刚区（W1-1：按签约状态差异化排序；业务入口未签约点击走签约引导） */
  function renderHwKingkong(app) {
    var box = $('.hw-kingkong', app);
    if (!box || (hw.lastSigned === state.signed && box.childElementCount)) return;
    hw.lastSigned = state.signed;
    var items = HW_KING.slice().sort(function (a, b) {
      return state.signed ? (b.biz - a.biz) : (a.biz - b.biz);
    });
    box.innerHTML =
      '<div class="hw-king-head"><h2>高频服务</h2></div>' +
      '<div class="hw-king-grid">' + items.map(function (it) {
        return '<button data-k="' + it.k + '"' + (it.biz ? ' data-need-sign="1"' : '') + '>' +
          '<span>' + it.ico + '</span><b>' + it.name + '</b></button>';
      }).join('') + '</div>';
    $all('[data-k]', box).forEach(function (b) {
      var it = HW_KING.filter(function (x) { return x.k === b.getAttribute('data-k'); })[0];
      b.addEventListener('click', function () { it.go(); });
    });
  }

  /* 产业投研精选（W1-4：复用市场洞察只读缩略视图） */
  var HW_BASIS = [85, 40, 65, 20, 55, 75, 30, 60, 15, 45, 70, 25, 50, 35, 80, 10, 62, 28];
  function basisSvg() {
    var cells = '';
    for (var i = 0; i < HW_BASIS.length; i++) {
      cells += '<rect x="' + (i % 6) * 21 + '" y="' + Math.floor(i / 6) * 20 + '" width="19" height="18" rx="2" fill="var(--blue,#143c6b)" fill-opacity="' + (HW_BASIS[i] / 100).toFixed(2) + '"/>';
    }
    return '<svg viewBox="0 0 125 58" role="img" aria-label="基差地图缩略">' + cells + '</svg>';
  }
  function curveSvg() {
    return '<svg viewBox="0 0 125 58" role="img" aria-label="榨利曲线缩略">' +
      '<polyline points="0,44 20,40 40,32 60,34 80,24 100,18 120,12" fill="none" stroke="var(--blue,#143c6b)" stroke-width="2"/>' +
      '<polyline points="0,50 20,48 40,44 60,46 80,42 100,40 120,36" fill="none" stroke="var(--muted,#6d7989)" stroke-width="1.5" stroke-dasharray="3 3"/>' +
      '</svg>';
  }
  function renderHwResearch(app) {
    var box = $('.hw-research', app);
    box.innerHTML =
      '<div class="block-title"><div><small>RESEARCH PICKS</small><h2>产业投研精选</h2></div>' +
      '<button class="link-button" data-more="1">更多 ›</button></div>' +
      '<div class="hw-thumbs">' +
      '<div class="hw-thumb"><b>基差地图</b>' + basisSvg() + '<small>沪铜 +80 · 螺纹 +14 · 原油 +3.6</small></div>' +
      '<div class="hw-thumb"><b>榨利曲线</b>' + curveSvg() + '<small>豆粕盘面榨利 · 近月走强</small></div>' +
      '</div>';
    $('[data-more]', box).addEventListener('click', function () { goNav('投研支持'); });
  }

  /* 政策与解读（内容中心 Feed 标题流） */
  var HW_POLICY = [
    { c: '监管政策解读', t: '《期货和衍生品法》实施要点与企业合规清单', d: '08-12' },
    { c: '产业导向专题', t: '有色产业链三季度供需展望：库存去化仍是主线', d: '08-10' },
    { c: '监管政策解读', t: '场外衍生品业务监管新规解读：对产业客户的影响', d: '08-05' }
  ];
  function renderHwPolicy(app) {
    var box = $('.hw-policy', app);
    box.innerHTML =
      '<div class="block-title"><div><small>POLICY FEED</small><h2>政策与解读</h2></div>' +
      '<button class="link-button" data-more="1">更多 ›</button></div>' +
      '<div class="hw-policy-list">' + HW_POLICY.map(function (a, i) {
        return '<div class="hw-policy-item" data-i="' + i + '"><span class="hw-cat">' + a.c + '</span><h4>' + a.t + '</h4><time>' + a.d + '</time></div>';
      }).join('') + '</div>';
    $('[data-more]', box).addEventListener('click', function () { goBasic('consult', '政策解读'); });
    $all('.hw-policy-item', box).forEach(function (row) {
      row.addEventListener('click', function () {
        goBasic('consult', HW_POLICY[+row.getAttribute('data-i')].c === '监管政策解读' ? '政策解读' : '全部');
      });
    });
  }

  /* 采销信息速览（W1-3：只读卡片流 + 信息示例标注） */
  function renderHwSourcing(app) {
    var box = $('.hw-sourcing', app);
    box.innerHTML =
      '<div class="block-title"><div><small>SOURCING FEED</small><h2>采销信息速览</h2></div>' +
      '<button class="hx-btn primary" data-pub="1">发布需求</button></div>' +
      '<div class="hw-src-list">' +
      '<div class="hw-src-item"><em class="sell">出售</em><div><b>碳酸锂 99.5%</b><p>500 吨 · 华东 · 08-13 发布</p></div></div>' +
      '<div class="hw-src-item"><em class="buy">求购</em><div><b>不锈钢 304</b><p>2000 吨 · 华南 · 08-12 发布</p></div></div>' +
      '<div class="hw-src-item"><em class="sell">出售</em><div><b>电解铜 1#</b><p>300 吨 · 华北 · 08-11 发布</p></div></div>' +
      '</div>';
    $('[data-pub]', box).addEventListener('click', function () { goNav('大宗采销'); });
  }

  /* 研究与活动（W1-5：活动日历与研究合并一卡，复用会议预约） */
  function renderHwEvents(app) {
    var box = $('.hw-events', app);
    box.innerHTML =
      '<div class="block-title"><div><h2>研究与活动</h2></div>' +
      '<button class="link-button" data-more="1">全部 ›</button></div>' +
      '<div class="event-row"><time><b>20</b><span>8月</span></time><div><em>线下沙龙</em><h3>有色产业链沙龙</h3><p>上海 · 15:00—17:00</p></div><button class="outline-button" data-ev="0">报名</button></div>' +
      '<div class="event-row"><time><b>02</b><span>9月</span></time><div><em>线上直播</em><h3>黑色产业链秋季供需展望</h3><p>15:00—16:30 · 峰会</p></div><button class="outline-button" data-ev="1">报名</button></div>' +
      '<div class="event-row"><time><b>22</b><span>9月</span></time><div><em class="offline">线下调研</em><h3>华东铜加工企业调研行</h3><p>江苏常州 · 审核中</p></div><button class="outline-button" data-ev="2">详情</button></div>';
    $all('[data-ev]', box).forEach(function (b) {
      b.addEventListener('click', function () { toast('已带来源参数跳转「会议预约」（R·复用，不重复开发）'); });
    });
    $('[data-more]', box).addEventListener('click', function () { goBasic('events'); });
  }

  /* ==========================================================
     9. 投研支持 · 研究员主页（hxr）
        保留原投研支持页框架（research-nav 侧栏 + 标题），点击
        二级目录「研究员」后仅替换右侧内容列；模块呈现参考
        「研究服务-分析师主页」（观点追踪/强弱评级/行情卡），
        姓名、团队、观点均为虚构演示数据，头像用首字占位
     ========================================================== */
  var hxr = { mode: '', field: 'all', kw: '', analystId: 'sw', tab: '观点追踪', sub: '全部动态', variety: '全部', page: 1, range: '近90日', followed: { sw: true } };

  var HXR_FIELDS = [
    { id: 'all', name: '全部' },
    { id: 'black', name: '黑色', dot: true },
    { id: 'nf', name: '有色及贵金属' },
    { id: 'ec', name: '能源化工' },
    { id: 'agri', name: '农产品' },
    { id: 'macro', name: '宏观策略' }
  ];
  var HXR_ANALYSTS = [
    { id: 'sw', field: 'black', name: '沈望', title: '首席分析师', role: '黑色研究负责人', cert: 'Z0000001（演示）', varieties: ['螺纹钢', '热轧卷板', '铁矿石'], quote: { name: '螺纹钢主力', code: 'rb2610.SHFE', price: '3,017', chg: '+0.27%', up: true, state: '休盘中' }, intro: '长期深耕黑色产业链研究，擅长将产业供需格局与宏观情绪结合，为产业客户提供采购节奏与套保时机建议。' },
    { id: 'lz', field: 'black', name: '林洲', title: '高级分析师', cert: 'Z0000002（演示）', varieties: ['铁矿石', '焦煤焦炭'], quote: { name: '铁矿石主力', code: 'i2609.DCE', price: '768.5', chg: '-0.45%', up: false, state: '交易中' }, intro: '聚焦铁矿与煤焦供需平衡表研究，跟踪港口库存与发运节奏，服务多家钢厂原料采购决策。' },
    { id: 'gx', field: 'black', name: '高小满', title: '分析师', cert: 'Z0000003（演示）', varieties: ['螺纹钢', '热轧卷板'], quote: { name: '热轧卷板主力', code: 'hc2610.SHFE', price: '3,251', chg: '+0.18%', up: true, state: '交易中' }, intro: '负责成材端高频数据跟踪与利润测算，输出周度产销与库存快评。' },
    { id: 'zz', field: 'nf', name: '周正', title: '首席分析师', role: '有色研究负责人', cert: 'Z0000004（演示）', varieties: ['沪铜', '沪铝'], quote: { name: '沪铜主力', code: 'cu2609.SHFE', price: '79,240', chg: '+1.26%', up: true, state: '交易中' }, intro: '专注铜铝产业链研究，关注库存去化速度、冶炼利润与供应扰动，为加工企业提供套保与点价建议。' },
    { id: 'lt', field: 'ec', name: '韩熙', title: '首席分析师', role: '能化研究负责人', cert: 'Z0000005（演示）', varieties: ['原油', '燃料油', '甲醇'], quote: { name: '原油主力', code: 'sc2610.INE', price: '612.8', chg: '+0.78%', up: true, state: '交易中' }, intro: '覆盖原油及下游能化品种，擅长月差结构与地缘溢价分析，服务炼厂与贸易商风险管理。' },
    { id: 'cy', field: 'agri', name: '程一粟', title: '高级分析师', cert: 'Z0000006（演示）', varieties: ['豆粕', '棕榈油'], quote: { name: '豆粕主力', code: 'm2609.DCE', price: '3,148', chg: '+0.31%', up: true, state: '交易中' }, intro: '跟踪油脂油料全球供需与天气窗口，输出压榨利润与进口成本测算。' },
    { id: 'gc', field: 'macro', name: '顾沧海', title: '首席宏观分析师', cert: 'Z0000007（演示）', varieties: ['宏观策略'], quote: { name: '沪深300股指', code: 'if2609.CFFEX', price: '4,128.6', chg: '+0.52%', up: true, state: '交易中' }, intro: '负责宏观总量与政策研究，为产业客户的跨品种套保与资产配置提供宏观框架支持。' }
  ];
  var HXR_VP_TITLES = {
    '螺纹钢': ['螺纹钢：板块情绪共振，关注利润变动', '螺纹钢：需求进入验证期，成本支撑边际走弱', '螺纹钢：库存去化速度仍是定价关键'],
    '热轧卷板': ['热轧卷板：需求复苏有限，区间震荡为主', '热轧卷板：利润收缩，关注减产动态'],
    '铁矿石': ['铁矿石：港口库存去化加快，价格上方承压', '铁矿石：政策调控预期增强，警惕高位波动'],
    '焦煤焦炭': ['焦煤焦炭：提降落地，产业链利润再分配'],
    '沪铜': ['铜：宏观预期改善，库存去化速度仍是关键', '铜：冶炼利润与供应扰动并存'],
    '沪铝': ['电解铝：产能天花板临近，需求端仍有韧性'],
    '原油': ['原油：月差走强，地缘溢价再度抬升', '原油：关注 OPEC+ 政策与需求季节性'],
    '燃料油': ['燃料油：供应宽松缓解，关注内外价差收敛'],
    '甲醇': ['甲醇：成本端波动，港口库存去化放缓'],
    '豆粕': ['豆粕：美豆天气窗口，关注单产预期摆动'],
    '棕榈油': ['棕榈油：增产季压力显现，关注出口节奏'],
    '宏观策略': ['宏观：国内政策重心与全球流动性脉络', '宏观：高频数据解读与三季度展望']
  };
  var HXR_VP_BRIEF = [
    '供需格局边际变化有限，短期价格以区间震荡对待，建议产业客户结合基差水平安排采购与套保节奏。',
    '库存周期与利润结构共同指向当前定价矛盾，关注后续政策与需求端验证信号。',
    '月差结构与基差走势提供对冲窗口，建议逢高布局保值头寸并动态调整套保比例。'
  ];
  var HXR_VP_TYPES = ['日报', '快评', '日报', '研报', '周报', '快评', '日报'];
  var HXR_VP_OFFS = [0, 1, 2, 4, 5, 7, 9, 11, 14, 16, 19, 22, 26, 30];
  var HXR_TABS = ['观点追踪', '研究报告', '实时快评', '策略研究', '数据看板', '直播路演'];
  var HXR_STRATEGIES = [
    { t: '三季度品种套保策略季报', p: '面向产业客户的库存保值与利润锁定思路，含套保比例与移仓节奏建议。', tag: '季报' },
    { t: '主力合约月间价差策略更新', p: '基于库存周期与基差结构的月差组合跟踪，附历史回测区间。', tag: '月更' },
    { t: '产业客户期权保护方案示例', p: '领口、累购等期权结构在采购与库存场景中的适用性说明。', tag: '专题' }
  ];
  var HXR_LIVES = [
    { d: '21', m: '8月', title: '品种周度电话会', meta: '线上直播 · 15:30—16:15' },
    { d: '28', m: '8月', title: '产业客户套保实务路演', meta: '线上路演 · 14:00—15:30' },
    { d: '05', m: '9月', title: '产业链秋季供需展望峰会', meta: '线下峰会 · 上海 · 审核中' }
  ];

  function hxrAnalyst() {
    return HXR_ANALYSTS.filter(function (a) { return a.id === hxr.analystId; })[0] || HXR_ANALYSTS[0];
  }
  function hxrViewpoints(a) {
    var out = [], d0 = new Date(2026, 7, 19);
    for (var i = 0; i < HXR_VP_OFFS.length; i++) {
      var v = a.varieties[i % a.varieties.length];
      var pool = HXR_VP_TITLES[v] || ['品种跟踪：供需与库存周度观察'];
      var d = new Date(d0.getTime() - HXR_VP_OFFS[i] * 864e5);
      out.push({
        date: d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2),
        type: HXR_VP_TYPES[i % HXR_VP_TYPES.length],
        variety: v,
        title: pool[i % pool.length],
        brief: HXR_VP_BRIEF[i % HXR_VP_BRIEF.length]
      });
    }
    return out;
  }
  function hxrBtn(text, kind, fn) {
    var b = el('button', 'hx-btn' + (kind ? ' ' + kind : ''), '');
    b.textContent = text;
    b.addEventListener('click', fn);
    return b;
  }

  /* 顶部二级菜单：hover「投研支持」弹出下拉，选中项切换对应子板块，移开鼠标收起 */
  var HX_SUBNAV = ['研报总览', '最新研报', '策略信号', '研究员主页', '指标中心', '专题研究', '数据与 API'];
  var HX_RESEARCH_MEGAS = [
    { title: '研究内容', items: ['研报总览', '最新研报'] },
    { title: '策略工具', items: ['策略信号', '指标中心'] },
    { title: '专家与专题', items: ['研究员主页', '专题研究'] },
    { title: '数据服务', items: ['数据与 API'] }
  ];
  function subnavMode(name) {
    return name === '研究员主页' ? 'analyst' : (name === '最新研报' ? 'reports' : (name === '策略信号' ? 'weekly' : (name === '数据与 API' ? 'api' : '')));
  }
  function researchMegaHtml() {
    return '<button data-nav="研报总览" class="research-mega-home">投研支持首页 <span>查看全部研究服务 ›</span></button>' +
      '<div class="research-mega-grid">' + HX_RESEARCH_MEGAS.map(function (g) {
        return '<div><h3>' + g.title + '</h3>' + g.items.map(function (n) {
          return '<button data-nav="' + n + '">' + n + '</button>';
        }).join('') + '</div>';
      }).join('') + '<div><h3>活动与交流</h3><button data-research-path="/basic-service/service-hubs.html#activity">活动中心</button><button data-research-path="/basic-service/service-hubs.html?category=salon#activity">线下会议</button></div></div>';
  }
  function buildNavDrop(shell) {
    var nav = $('.main-header nav', shell);
    if (!nav) return;
    var btn = null;
    $all('button', nav).forEach(function (b) { if (b.textContent.trim() === '投研支持') btn = b; });
    if (!btn) return;
    var drop = document.getElementById('hx-drop');
    var header = $('.main-header', shell);
    if (drop && drop.parentNode !== header) { drop.remove(); drop = null; }
    if (!drop && header) {
      drop = el('section', 'research-mega'); drop.id = 'hx-drop';
      drop.innerHTML = researchMegaHtml();
      header.appendChild(drop);
      var timer = 0;
      var show = function () {
        clearTimeout(timer);
        drop.classList.add('open');
      };
      var hide = function () { clearTimeout(timer); timer = setTimeout(function () { drop.classList.remove('open'); }, 160); };
      btn.addEventListener('mouseenter', show);
      btn.addEventListener('mouseleave', hide);
      drop.addEventListener('mouseenter', function () { clearTimeout(timer); });
      drop.addEventListener('mouseleave', hide);
      $all('[data-nav]', drop).forEach(function (b) {
        b.addEventListener('click', function () {
          hxr.mode = subnavMode(b.getAttribute('data-nav'));
          hxr.page = 1;
          drop.classList.remove('open');
          goNav('投研支持');
          decorate();
        });
      });
      $all('[data-research-path]', drop).forEach(function (b) {
        b.addEventListener('click', function () {
          drop.classList.remove('open');
          document.dispatchEvent(new CustomEvent('open-migrated-basic', {
            detail: { path: b.getAttribute('data-research-path') }
          }));
        });
      });
    }
    var want = hxr.mode === 'analyst' ? '研究员主页' : (hxr.mode === 'reports' ? '最新研报' : (hxr.mode === 'weekly' ? '策略信号' : (hxr.mode === 'api' ? '数据与 API' : '研报总览')));
    $all('[data-nav]', drop).forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-nav') === want);
    });
  }

  function buildResearchApp() {
    var app = el('div', ''); app.id = 'hxr-app';
    app.innerHTML =
      '<div class="hxr-picker"></div>' +
      '<div class="hxr-cards"></div>' +
      '<div class="hxr-profile"></div>' +
      '<div class="hxr-tabs"></div>' +
      '<div class="hxr-body"></div>';
    renderHxr(app);
    return app;
  }
  function renderHxr(app) {
    renderHxrPicker(app);
    renderHxrCards(app);
    renderHxrProfile(app);
    renderHxrTabs(app);
    renderHxrBody(app);
  }

  /* 板块筛选 + 姓名搜索 */
  function renderHxrPicker(app) {
    var box = $('.hxr-picker', app);
    box.innerHTML = HXR_FIELDS.map(function (f) {
      return '<button class="hxr-field' + (hxr.field === f.id ? ' on' : '') + '" data-f="' + f.id + '">' +
        (f.dot ? '<i class="hxb-dot"></i>' : '') + f.name + '</button>';
    }).join('') +
      '<div class="hxr-search"><input placeholder="请输入研究员姓名" value="' + hxr.kw + '" /></div>';
    $all('.hxr-field', box).forEach(function (b) {
      b.addEventListener('click', function () { hxr.field = b.getAttribute('data-f'); renderHxrPicker(app); renderHxrCards(app); });
    });
    var input = $('.hxr-search input', box);
    input.addEventListener('input', function () { hxr.kw = input.value.trim(); renderHxrCards(app); });
  }
  function hxrFiltered() {
    return HXR_ANALYSTS.filter(function (a) {
      var okField = hxr.field === 'all' || a.field === hxr.field;
      var okKw = !hxr.kw || a.name.indexOf(hxr.kw) >= 0;
      return okField && okKw;
    });
  }
  /* 研究员卡片：首字头像占位（不使用真实头像） */
  function renderHxrCards(app) {
    var box = $('.hxr-cards', app);
    var list = hxrFiltered();
    if (!list.length) {
      box.innerHTML = '<div class="hxr-empty"><b>未找到匹配的研究员</b>调整筛选条件或清空搜索关键词后重试。</div>';
      return;
    }
    box.innerHTML = list.map(function (a) {
      var fol = hxr.followed[a.id];
      return '<button class="hxr-card' + (a.id === hxr.analystId ? ' on' : '') + '" data-id="' + a.id + '">' +
        '<span class="hxr-avatar">' + a.name.charAt(0) + '</span>' +
        '<span class="hxr-card-info"><b>' + a.name + '</b><small>' + a.title + ' · ' + a.varieties.join('/') + '</small></span>' +
        '<i class="hxr-star' + (fol ? ' on' : '') + '" title="' + (fol ? '已关注' : '关注') + '">' + (fol ? '★' : '☆') + '</i></button>';
    }).join('');
    $all('.hxr-card', box).forEach(function (c) {
      c.addEventListener('click', function () {
        hxr.analystId = c.getAttribute('data-id');
        hxr.page = 1; hxr.variety = '全部'; hxr.sub = '全部动态';
        renderHxrCards(app); renderHxrProfile(app); renderHxrBody(app);
      });
      $('.hxr-star', c).addEventListener('click', function (e) {
        e.stopPropagation();
        var id = c.getAttribute('data-id');
        hxr.followed[id] = !hxr.followed[id];
        renderHxrCards(app); renderHxrProfile(app);
        toast(hxr.followed[id] ? '已关注研究员，新动态将通过消息🔔推送（复用研报关注链路）' : '已取消关注');
      });
    });
  }
  /* 研究员信息卡 */
  function renderHxrProfile(app) {
    var box = $('.hxr-profile', app);
    var a = hxrAnalyst();
    var fol = hxr.followed[a.id];
    box.innerHTML =
      '<span class="hxr-avatar hxr-avatar-lg">' + a.name.charAt(0) + '</span>' +
      '<div class="hxr-profile-info">' +
      '<h2>' + a.name + '<small class="hxr-title">' + a.title + '</small>' + (a.role ? '<small class="hxr-role">' + a.role + '</small>' : '') + '</h2>' +
      '<div class="hxr-cert">交易咨询资格证号：' + a.cert + '</div>' +
      '<div class="hxr-tags"><span class="hxr-tag-k">研究品种：</span>' + a.varieties.map(function (v) { return '<span>' + v + '</span>'; }).join('') + '</div>' +
      '<p>' + a.intro + '</p></div>' +
      '<div class="hxr-profile-actions"></div>';
    var acts = $('.hxr-profile-actions', box);
    acts.appendChild(hxrBtn(fol ? '取消关注' : '关注', fol ? '' : 'primary', function () {
      hxr.followed[a.id] = !hxr.followed[a.id];
      renderHxrCards(app); renderHxrProfile(app);
      toast(hxr.followed[a.id] ? '已关注「' + a.name + '」，新动态将通过消息🔔推送' : '已取消关注「' + a.name + '」');
    }));
    acts.appendChild(hxrBtn('分享', '', function () { toast('研究员主页链接已复制（演示）'); }));
  }
  /* Tab 切换 */
  function renderHxrTabs(app) {
    var box = $('.hxr-tabs', app);
    box.innerHTML = HXR_TABS.map(function (t) {
      return '<button class="' + (t === hxr.tab ? 'on' : '') + '" data-t="' + t + '">' + t + '</button>';
    }).join('');
    $all('button', box).forEach(function (b) {
      b.addEventListener('click', function () {
        hxr.tab = b.getAttribute('data-t');
        hxr.page = 1;
        renderHxrTabs(app); renderHxrBody(app);
      });
    });
  }
  /* Tab 内容 */
  function renderHxrBody(app) {
    var box = $('.hxr-body', app);
    if (hxr.tab === '观点追踪') return renderHxrViewpoint(box, app);
    if (hxr.tab === '研究报告') return renderHxrReports(box);
    if (hxr.tab === '实时快评') return renderHxrFlash(box);
    if (hxr.tab === '策略研究') return renderHxrStrategy(box);
    if (hxr.tab === '数据看板') return renderHxrBoard(box);
    if (hxr.tab === '直播路演') return renderHxrLives(box);
  }
  /* 行情卡：主力合约 + 涨跌语义色（红涨绿跌） */
  function hxrQuoteHtml(a) {
    var q = a.quote;
    return '<div class="hxr-quote-card">' +
      '<div class="hxr-quote-name"><b>' + q.name + '</b><small>' + q.code + '</small></div>' +
      '<div class="hxr-quote-price ' + (q.up ? 'up' : 'down') + '">' + q.price +
      '<small>' + q.chg + '</small></div>' +
      '<span class="hxr-quote-state">' + q.state + '</span>' +
      '<button class="hxr-quote-k">日K</button>' +
      '<small class="hxr-quote-tip">行情为原型演示数据</small></div>';
  }
  /* 盘面印证：气泡图占位（点击气泡查看观点的示意） */
  function hxrBubbleSvg() {
    var pts = [[12, 44, 'w', 6], [26, 36, 'm', 5], [40, 28, 's', 7], [54, 34, 'm', 5], [66, 22, 's', 8], [80, 30, 'w', 5], [92, 16, 's', 6]];
    var color = { s: 'var(--gj-color-error,#ef3432)', w: 'var(--gj-color-success,#05b96a)', m: 'rgba(0,0,0,.25)' };
    var cells = pts.map(function (p) {
      return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[3] + '" fill="' + color[p[2]] + '" fill-opacity=".55"/>';
    }).join('');
    return '<svg viewBox="0 0 104 56" role="img" aria-label="盘面印证气泡示意">' +
      '<line x1="0" y1="30" x2="104" y2="30" stroke="rgba(0,0,0,.06)"/>' + cells + '</svg>';
  }
  /* 观点追踪 */
  function renderHxrViewpoint(box, app) {
    var a = hxrAnalyst();
    var vps = hxrViewpoints(a);
    var subs = ['盘面印证', '强弱评级', '全部动态'];
    box.innerHTML = '<div class="hxr-panel">' +
      '<div class="hxr-subrow">' +
      '<div class="hxr-subtabs">' + subs.map(function (s) {
        return '<button class="hxr-field' + (hxr.sub === s ? ' on' : '') + '" data-s="' + s + '">' + s + '</button>';
      }).join('') + '</div>' +
      '<div class="hxr-varieties">' + ['全部'].concat(a.varieties).map(function (v) {
        return '<button class="hxr-chip' + (hxr.variety === v ? ' on' : '') + '" data-v="' + v + '">' + v + '</button>';
      }).join('') + '</div></div>' +
      (hxr.sub === '盘面印证' ? hxrQuoteHtml(a) +
        '<div class="hxr-bubble">' + hxrBubbleSvg() +
        '<p>点击图表气泡查看具体观点（原型演示）</p>' +
        '<div class="hxr-range"><button data-r="近90日" class="' + (hxr.range === '近90日' ? 'on' : '') + '">近90日</button>' +
        '<button data-r="近半年" class="' + (hxr.range === '近半年' ? 'on' : '') + '">近半年</button>' +
        '<small>' + (hxr.range === '近90日' ? '2026-04-10 ~ 2026-08-19 共90个交易日' : '2026-02-19 ~ 2026-08-19 共124个交易日') + '</small></div></div>' : '') +
      (hxr.sub === '强弱评级' ? renderHxrRatingHtml(a) : '') +
      '<div class="hxr-vp-head"><b>研究动态(' + vps.filter(function (x) { return hxr.variety === '全部' || x.variety === hxr.variety; }).length + ')</b>' +
      '<span>摘要为系统自动生成，仅供参考，请以正文阐述为准</span></div>' +
      '<div class="hxr-vplist"></div><div class="hxr-pager"></div></div>';
    $all('.hxr-subtabs button', box).forEach(function (b) {
      b.addEventListener('click', function () { hxr.sub = b.getAttribute('data-s'); renderHxrBody(app); });
    });
    $all('.hxr-chip', box).forEach(function (b) {
      b.addEventListener('click', function () { hxr.variety = b.getAttribute('data-v'); hxr.page = 1; renderHxrBody(app); });
    });
    $all('.hxr-range button', box).forEach(function (b) {
      b.addEventListener('click', function () { hxr.range = b.getAttribute('data-r'); renderHxrBody(app); });
    });
    var kBtn = $('.hxr-quote-k', box);
    if (kBtn) kBtn.addEventListener('click', function () { toast('已打开「' + a.quote.name + '」日K 图表（复用市场洞察，演示）'); });
    /* 研究动态列表 + 分页（每页5条） */
    var items = vps.filter(function (x) { return hxr.variety === '全部' || x.variety === hxr.variety; });
    var PAGE = 5, pages = Math.max(1, Math.ceil(items.length / PAGE));
    if (hxr.page > pages) hxr.page = pages;
    var list = $('.hxr-vplist', box);
    items.slice((hxr.page - 1) * PAGE, hxr.page * PAGE).forEach(function (x) {
      var row = el('div', 'hxr-vp');
      row.innerHTML = '<time>' + x.date + '</time>' +
        '<span class="hxr-vp-type t-' + x.type + '">' + x.type + '</span>' +
        '<div><h4>' + x.title + '</h4><p>' + x.brief + '</p></div>';
      $('h4', row).addEventListener('click', function () { toast('已跳转研报详情页（复用研报详情模板）：' + x.title); });
      list.appendChild(row);
    });
    var pager = $('.hxr-pager', box);
    if (pages > 1) {
      var from = (hxr.page - 1) * PAGE + 1, to = Math.min(hxr.page * PAGE, items.length);
      var pHtml = '<small>显示 ' + from + '-' + to + ' / 共' + items.length + '条</small>' +
        '<button data-p="prev"' + (hxr.page === 1 ? ' disabled' : '') + '>‹</button>';
      for (var pi = 1; pi <= pages; pi++) pHtml += '<button data-p="' + pi + '" class="' + (pi === hxr.page ? 'on' : '') + '">' + pi + '</button>';
      pHtml += '<button data-p="next"' + (hxr.page === pages ? ' disabled' : '') + '>›</button>';
      pager.innerHTML = pHtml;
      $all('button', pager).forEach(function (b) {
        b.addEventListener('click', function () {
          var p = b.getAttribute('data-p');
          if (p === 'prev') hxr.page = Math.max(1, hxr.page - 1);
          else if (p === 'next') hxr.page = Math.min(pages, hxr.page + 1);
          else hxr.page = +p;
          renderHxrBody(app);
        });
      });
    }
  }
  /* 强弱评级：品种评级 + 内容计数徽章 */
  function renderHxrRatingHtml(a) {
    var grades = ['强', '中', '弱'];
    return '<div class="hxr-rating">' + a.varieties.map(function (v, i) {
      var g = grades[i % 3];
      var cls = g === '强' ? 'g-strong' : (g === '弱' ? 'g-weak' : 'g-mid');
      return '<div class="hxr-rating-row">' +
        '<span class="hxr-grade ' + cls + '">' + g + '</span>' +
        '<b>' + v + '</b><small>评级更新 2026-08-18</small>' +
        '<span class="hxr-counts"><i>研报 ' + (12 + i * 7) + '</i><i>快评 ' + (26 + i * 9) + '</i><i>风险事件 ' + (i % 2) + '</i></span></div>';
    }).join('') + '<p class="hxr-rating-tip">强弱评级为研究员对品种中期方向的主观判断，不构成投资建议。</p></div>';
  }
  /* 研究报告 */
  function renderHxrReports(box) {
    var a = hxrAnalyst();
    var items = hxrViewpoints(a).filter(function (x) { return x.type === '研报' || x.type === '周报'; });
    box.innerHTML = '<div class="hxr-panel"><div class="hxr-vp-head"><b>研究报告(' + items.length + ')</b><span>复用研报详情模板与关注链路</span></div>' +
      '<div class="hxr-vplist"></div></div>';
    var list = $('.hxr-vplist', box);
    items.forEach(function (x) {
      var row = el('div', 'hxr-vp');
      row.innerHTML = '<time>' + x.date + '</time><span class="hxr-vp-type t-' + x.type + '">' + x.type + '</span>' +
        '<div><h4>' + x.title + '</h4><p>' + x.brief + '</p></div>';
      row.appendChild(hxrBtn('查看', '', function () { toast('已跳转研报详情页（复用研报详情模板）'); }));
      list.appendChild(row);
    });
  }
  /* 实时快评 */
  function renderHxrFlash(box) {
    var a = hxrAnalyst();
    var items = hxrViewpoints(a).filter(function (x) { return x.type === '快评'; });
    var times = ['09:42', '10:15', '13:36', '14:20'];
    box.innerHTML = '<div class="hxr-panel"><div class="hxr-vp-head"><b>实时快评(' + items.length + ')</b><span>盘中短平快观点，仅供盘前盘后参考</span></div>' +
      '<div class="hxr-vplist">' + items.map(function (x, i) {
        return '<div class="hxr-vp"><time>' + x.date.slice(5) + ' ' + times[i % times.length] + '</time>' +
          '<span class="hxr-vp-type t-快评">快评</span><div><h4>' + x.title + '</h4><p>' + x.brief + '</p></div></div>';
      }).join('') + '</div></div>';
    $all('h4', box).forEach(function (h) {
      h.addEventListener('click', function () { toast('已跳转快评详情（演示）'); });
    });
  }
  /* 策略研究 */
  function renderHxrStrategy(box) {
    box.innerHTML = '<div class="hxr-panel"><div class="hxr-vp-head"><b>策略研究</b><span>面向产业客户的策略类产出</span></div>' +
      '<div class="hxr-strategies">' + HXR_STRATEGIES.map(function (s) {
        return '<div class="hxr-strategy"><span class="hxr-tag">' + s.tag + '</span><h4>' + s.t + '</h4><p>' + s.p + '</p></div>';
      }).join('') + '</div></div>';
    $all('.hxr-strategy', box).forEach(function (c, i) {
      c.appendChild(hxrBtn('获取', 'primary', function () { toast('已申请获取《' + HXR_STRATEGIES[i].t + '》，将由客户经理送达（演示）'); }));
    });
  }
  /* 数据看板：品种关键指标（演示数据） */
  function renderHxrBoard(box) {
    var a = hxrAnalyst();
    var rows = {
      '螺纹钢': ['3,017', '+0.27%', '+14', '4,836,100'], '热轧卷板': ['3,251', '+0.18%', '-18', '2,318,400'],
      '铁矿石': ['768.5', '-0.45%', '+3.6', '12,860 万吨'], '焦煤焦炭': ['1,182', '+0.62%', '-22', '1,946 万吨'],
      '沪铜': ['79,240', '+1.26%', '+80', '201,342'], '沪铝': ['20,685', '+0.35%', '-40', '684,200'],
      '原油': ['612.8', '+0.78%', '+3.6', '5,421,000'], '燃料油': ['3,042', '-0.21%', '+12', '386,700'],
      '甲醇': ['2,436', '+0.41%', '-15', '1,092,300'], '豆粕': ['3,148', '+0.31%', '-18', '781,200'],
      '棕榈油': ['8,236', '-0.12%', '+26', '512,800'], '宏观策略': ['—', '—', '—', '—']
    };
    box.innerHTML = '<div class="hxr-panel"><div class="hxr-vp-head"><b>数据看板</b><span>品种关键指标 · 原型演示数据，不构成投资建议</span></div>' +
      '<table class="hxr-table"><thead><tr><th>品种</th><th>最新价</th><th>涨跌幅</th><th>基差</th><th>库存</th></tr></thead><tbody>' +
      a.varieties.map(function (v) {
        var r = rows[v] || ['—', '—', '—', '—'];
        var up = r[1].charAt(0) === '+', down = r[1].charAt(0) === '-';
        return '<tr><td><b>' + v + '</b></td><td>' + r[0] + '</td>' +
          '<td class="' + (up ? 'up' : down ? 'down' : '') + '">' + r[1] + '</td>' +
          '<td>' + r[2] + '</td><td>' + r[3] + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  /* 直播路演：复用会议预约链路 */
  function renderHxrLives(box) {
    box.innerHTML = '<div class="hxr-panel"><div class="hxr-vp-head"><b>直播路演</b><span>报名复用「会议预约」链路 [R↗]</span></div>' +
      '<div>' + HXR_LIVES.map(function (ev) {
        return '<div class="hxr-event"><time><b>' + ev.d + '</b><span>' + ev.m + '</span></time>' +
          '<div><h4>' + ev.title + '</h4><p>' + ev.meta + '</p></div></div>';
      }).join('') + '</div></div>';
    $all('.hxr-event', box).forEach(function (row, i) {
      row.appendChild(hxrBtn('报名', 'primary', function () {
        toast('已带来源参数跳转「会议预约」（R·复用，不重复开发）：' + HXR_LIVES[i].title);
      }));
    });
  }

  /* ==========================================================
     10. 投研支持 · 最新研报 · 三栏阅读器（hxd）
        版式参考研报阅读产品：左=研报列表（来源/标签/页数/时间），
        中=摘要+问答，右=全文（收藏/下载/转发/全屏 + 检索/翻页/缩放）；
        机构、报告与问答均为虚构演示数据
     ========================================================== */
  var hxd = { tag: '全部', kw: '', reportId: 'r1', midTab: '摘要', page: 1, zoom: 1, fav: {}, msgs: [] };

  var HXD_REPORTS = [
    { id: 'r1', title: '螺纹钢：板块情绪共振，关注利润变动', source: '国泰君安期货·黑色组', author: '沈望', tag: '日报', pages: 6, date: '08-19', rating: '中性',
      abstract: ['我们维持对螺纹钢的区间震荡判断，并将 2026 年四季度波动中枢设定在 2,950—3,150 元/吨，仍应用不变的利润约束框架。我们维持对全年粗钢平控政策下供给弹性有限的判断。', '· 我们认为，对该品种而言更重要的变化是电炉利润持续压缩后减产预期的兑现节奏。2026 年二季度表观需求同比降幅收窄至 1.8%。', '· 剩余的核心约束是现货成交的持续性以及库存去化速度，剔除季节性后我们估计三季度去库斜率弱于往年同期。'],
      qa: [{ q: '当前定价的核心矛盾是什么？', a: '核心矛盾在于电炉减产预期与需求验证节奏的错位：利润压缩已至临界，但现货成交尚未给出持续性信号。' }, { q: '产业客户应如何安排套保节奏？', a: '建议结合基差水平分批保值：盘面升水扩大时逢高建立卖出保值头寸，套保比例控制在 30%—50%。' }],
      full: [{ h: '一、市场回顾', p: '本周螺纹钢主力合约震荡上行，持仓集中度抬升；现货成交日均 12.4 万吨，环比回升 6.2%。基差 +14 元/吨，处于近三年同期偏低水平。' }, { h: '二、供需平衡分析', p: '供给端：电炉平电利润 -80 元/吨，产能利用率 41.3%；长流程利润修复后复产斜率温和。需求端：建材出库与水泥发运同步改善，但持续性待验证。' }, { h: '三、策略建议', p: '单边：区间操作为主；跨期：关注 10-01 正套机会；产业：盘面利润高于现金成本 150 元/吨以上时建议钢厂锁定虚拟利润。' }] },
    { id: 'r2', title: '铜：宏观预期改善，库存去化速度仍是关键', source: '国泰君安期货·有色组', author: '周正', tag: '研报', pages: 13, date: '08-18', rating: '偏多',
      abstract: ['我们上调对铜的季度评级至偏多，并将 2026 年四季度目标区间从 76,000—80,000 元/吨上调至 78,000—84,000 元/吨，仍应用不变的供需平衡表框架。', '· 我们认为，连续三个季度库存去化未进一步上修已降低价格的下行风险，但海外显性库存仍处高位、资本密度上升，仍不支持更乐观的评级。', '· 剩余的核心约束是冶炼加工费与供应扰动的边际变化，剔除集体诉讼等一次性因素后我们估计 2026 年矿产铜增速 2.1%。'],
      qa: [{ q: '上调评级至偏多的依据？', a: '依据有三：国内库存连续去化、宏观预期改善、冶炼减产预期升温；但海外高库存制约上行空间。' }, { q: '加工企业如何运用该观点？', a: '建议逢低分批建立买入保值头寸，并可考虑领口结构降低套保成本。' }],
      full: [{ h: '一、核心观点', p: '宏观预期改善与现货升水走强共同支撑价格，但海外显性库存仍处高位，产业客户应结合采购节奏关注 78,000 元/吨附近波动。' }, { h: '二、平衡表与库存', p: '2026 年全球矿产铜增速 2.1%，需求增速 2.8%；国内社会库存去化斜率好于季节性，LME 库存去化缓慢。' }, { h: '三、风险提示', p: '海外衰退预期反复、冶炼复产超预期、汇率波动。' }] },
    { id: 'r3', title: '全球经济展望摘要', source: '国泰君安期货·宏观组', author: '顾沧海', tag: '周报', pages: 6, date: '08-18', rating: '中性',
      abstract: ['我们维持对全球增长的中性判断，三季度全球制造业 PMI 大概率于荣枯线附近反复；主要央行降息路径分化仍将主导资产波动。', '· 我们认为，对大宗商品而言更重要的变量是美元流动性与全球贸易量的边际变化。'],
      qa: [{ q: '对大宗商品的整体看法？', a: '整体呈结构分化：有色受益于流动性改善，能化受制于需求季节性，黑色以国内政策预期为主线。' }],
      full: [{ h: '一、全球增长脉络', p: '发达经济体软着陆概率上升，新兴市场制造业修复延续；全球贸易量同比 +1.9%。' }, { h: '二、资产含义', p: '风险资产波动率中枢下移，商品指数配置价值回升；关注实际利率下行对贵金属的支撑。' }] },
    { id: 'r4', title: '原油：月差走强，地缘溢价再度抬升', source: '国泰君安期货·能化组', author: '陆听澜', tag: '快评', pages: 3, date: '08-17', rating: '偏多',
      abstract: ['SC 近月月差走强至 8 元/桶，地缘事件驱动溢价再度抬升；我们维持三季度布伦特 78—86 美元/桶区间判断，上沿风险来自供应扰动。'],
      qa: [{ q: '地缘溢价会持续多久？', a: '历史同类事件溢价衰减周期约 2—3 周，若供应实质中断则延长至 6 周以上。' }],
      full: [{ h: '一、事件与结构', p: '月差走强反映近端供应偏紧预期；炼厂开工率回升支撑原油裂解价差。' }, { h: '二、策略含义', p: '炼厂客户可考虑买入近月看涨期权对冲原料成本上行风险。' }] },
    { id: 'r5', title: '全球金属与矿业：2026年7月新TSF同比上升24%', source: '第三方研究·金属矿业', author: '外部供稿', tag: '深度', pages: 9, date: '08-17', rating: '中性',
      abstract: ['2026 年 7 月全球金属与矿业新 TSF 同比上升 24%（前 7 个月同比下降 3%），资本开支周期拐点信号初现。', '· 我们认为，矿业资本开支回升将滞后 2—3 个季度传导至矿山产量与运输需求。'],
      qa: [{ q: '资本开支拐点对矿端意味着什么？', a: '意味着 2027 年后矿端供应增速抬升，中长期价格中枢承压，但短周期仍由现有产能约束主导。' }],
      full: [{ h: '一、数据解读', p: '新 TSF 同比 +24%，其中铜、金占比 61%；头部矿商指引普遍上调。' }, { h: '二、产业链映射', p: '矿山设备、海运运力需求滞后回升；关注干散货运价弹性。' }] },
    { id: 'r6', title: '豆粕：美豆天气窗口，关注单产预期摆动', source: '国泰君安期货·农产品组', author: '程一粟', tag: '研报', pages: 10, date: '08-15', rating: '中性',
      abstract: ['我们维持对豆粕的中性评级，并将 2026 年 12 月目标价从 3,050 元/吨上调至 3,200 元/吨，仍应用不变的 20 倍养殖利润约束框架。', '· 剩余的核心约束是美豆单产预期摆动以及国内到港节奏，剔除天气升水后我们估计四季度供需仍偏宽松。'],
      qa: [{ q: '天气升水有多少？', a: '当前盘面隐含约 120 元/吨天气升水，若 8 月降水正常存在回吐空间。' }],
      full: [{ h: '一、天气与单产', p: '美豆优良率 62%，同比 -3pct；历史同期修正幅度 ±2 蒲/英亩。' }, { h: '二、国内供需', p: '三季度到港充裕，油厂开机率回升；饲料企业物理库存 28 天，低于往年同期。' }, { h: '三、策略建议', p: '饲料企业建议随用随买 + 盘面逢低补库，不宜追高。' }] },
    { id: 'r7', title: '人工智能：推理前瞻——暂缓推进前沿领域', source: '第三方研究·科技', author: '外部供稿', tag: '深度', pages: 25, date: '08-15', rating: '中性',
      abstract: ['推理成本下降曲线快于预期，前沿模型训练投入边际回报递减；我们建议关注推理侧应用商业化进度而非参数竞赛。'],
      qa: [{ q: '对算力需求的含义？', a: '训练侧增速放缓、推理侧接力，算力结构从集中式大集群向分布式推理节点扩散。' }],
      full: [{ h: '一、成本曲线', p: '单位 token 推理成本年降 68%，快于训练成本下降速度。' }, { h: '二、商业化观察', p: '企业级 Agent 渗透率 17%，同比 +9pct；付费意愿集中于代码与客服场景。' }] }
  ];
  function hxdReport() {
    return HXD_REPORTS.filter(function (r) { return r.id === hxd.reportId; })[0] || HXD_REPORTS[0];
  }
  function buildReportApp() {
    var app = el('div', ''); app.id = 'hxd-app';
    app.innerHTML =
      '<div class="hxd-top"><b>最新研报</b><span>内容供稿 · 复用研报详情模板与关注链路；页面为原型演示数据</span>' +
      '<div class="hxd-filters"></div></div>' +
      '<div class="hxd-layout">' +
      '<div class="hxd-list"></div>' +
      '<div class="hxd-mid"></div>' +
      '<div class="hxd-doc"></div>' +
      '</div>';
    renderHxdFilters(app);
    renderHxdList(app);
    renderHxdMid(app);
    renderHxdDoc(app);
    return app;
  }
  /* 顶部筛选：标签 + 关键词 */
  function renderHxdFilters(app) {
    var box = $('.hxd-filters', app);
    var tags = ['全部', '日报', '研报', '周报', '快评', '深度'];
    box.innerHTML = tags.map(function (t) {
      return '<button class="hxr-field' + (hxd.tag === t ? ' on' : '') + '" data-t="' + t + '">' + t + '</button>';
    }).join('') + '<div class="hxr-search"><input placeholder="搜全文 / 请输入关键词" value="' + hxd.kw + '" /></div>';
    $all('.hxr-field', box).forEach(function (b) {
      b.addEventListener('click', function () { hxd.tag = b.getAttribute('data-t'); renderHxdFilters(app); renderHxdList(app); });
    });
    var input = $('.hxr-search input', box);
    input.addEventListener('input', function () { hxd.kw = input.value.trim(); renderHxdList(app); });
  }
  /* 左栏：研报列表（来源/标签/页数/时间） */
  function hxdFiltered() {
    return HXD_REPORTS.filter(function (r) {
      var okTag = hxd.tag === '全部' || r.tag === hxd.tag;
      var okKw = !hxd.kw || r.title.indexOf(hxd.kw) >= 0 || r.source.indexOf(hxd.kw) >= 0;
      return okTag && okKw;
    });
  }
  function renderHxdList(app) {
    var box = $('.hxd-list', app);
    var list = hxdFiltered();
    if (!list.length) {
      box.innerHTML = '<div class="hxr-empty"><b>暂无匹配的研报</b>调整标签或关键词后重试。</div>';
      return;
    }
    box.innerHTML = list.map(function (r) {
      return '<button class="hxd-item' + (r.id === hxd.reportId ? ' on' : '') + '" data-id="' + r.id + '">' +
        '<i class="hxd-pdf" aria-hidden="true"></i>' +
        '<div class="hxd-item-body"><h4>' + r.title + '</h4>' +
        (r.tag === '深度' ? '<span class="hxd-deep">深度</span>' : '') +
        '<div class="hxd-item-meta"><span class="hxd-src">' + r.source + '</span>' +
        '<span class="hxd-pages">' + r.pages + 'P</span><time>' + r.date + '</time></div></div></button>';
    }).join('');
    $all('.hxd-item', box).forEach(function (it) {
      it.addEventListener('click', function () {
        hxd.reportId = it.getAttribute('data-id');
        hxd.page = 1; hxd.msgs = []; hxd.midTab = '摘要';
        renderHxdList(app); renderHxdMid(app); renderHxdDoc(app);
      });
    });
  }
  /* 中栏：标题 + 摘要/问答 */
  function renderHxdMid(app) {
    var r = hxdReport();
    var box = $('.hxd-mid', app);
    box.innerHTML =
      '<div class="hxd-mid-head"><h3>' + r.title + '</h3>' +
      '<div class="hxd-mid-meta"><span>' + r.source + '</span><span>' + r.author + '</span>' +
      '<span class="hxr-tag">' + r.tag + '</span><time>' + r.date + ' 10:30</time></div></div>' +
      '<div class="hxd-mid-tabs"><button data-m="摘要" class="' + (hxd.midTab === '摘要' ? 'on' : '') + '">摘要</button>' +
      '<button data-m="问答" class="' + (hxd.midTab === '问答' ? 'on' : '') + '">问答</button></div>' +
      '<div class="hxd-mid-body"></div>' +
      '<div class="hxd-ask"><input placeholder="您可以向我提问，研读当前文档" /><button class="hx-btn primary" data-send="1">发送</button></div>';
    $all('.hxd-mid-tabs button', box).forEach(function (b) {
      b.addEventListener('click', function () { hxd.midTab = b.getAttribute('data-m'); renderHxdMid(app); });
    });
    var body = $('.hxd-mid-body', box);
    if (hxd.midTab === '摘要') {
      body.innerHTML = r.abstract.map(function (p) { return '<p>' + p + '</p>'; }).join('');
    } else {
      body.innerHTML = r.qa.map(function (x) {
        return '<div class="hxd-qa"><b>Q：' + x.q + '</b><p>A：' + x.a + '</p></div>';
      }).join('') + hxd.msgs.map(function (m) {
        return '<div class="hxd-qa' + (m.who === 'me' ? ' me' : '') + '">' + (m.who === 'me' ? '<b>Q：' + m.text + '</b>' : '<p>A：' + m.text + '</p>') + '</div>';
      }).join('');
      body.scrollTop = body.scrollHeight;
    }
    var input = $('.hxd-ask input', box);
    function send() {
      var q = input.value.trim();
      if (!q) return;
      input.value = '';
      hxd.midTab = '问答';
      hxd.msgs.push({ who: 'me', text: q });
      setTimeout(function () {
        var a = hxdAnswer(r, q);
        hxd.msgs.push({ who: 'ai', text: a });
        renderHxdMid(app);
      }, 300);
      renderHxdMid(app);
    }
    $('[data-send]', box).addEventListener('click', send);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });
  }
  function hxdAnswer(r, q) {
    if (/评级|目标价|观点/.test(q)) return '报告对' + r.title.split('：')[0] + '的评级为「' + r.rating + '」，详细逻辑见全文「核心观点」章节（原型演示）。';
    if (/套保|策略|建议/.test(q)) return r.full[r.full.length - 1].p;
    if (/风险/.test(q)) return '风险提示：' + (r.full.filter(function (s) { return /风险|提示/.test(s.h); })[0] || r.full[0]).p;
    return '根据《' + r.title + '》：' + r.abstract[0] + '（摘要为系统自动生成，仅供参考，请以正文阐述为准）';
  }
  /* 右栏：全文 + 动作（收藏/下载/转发/全屏）+ 工具条 */
  /* 逐页正文：第 1 页封面+首节，中间页按序承载章节、超出部分生成数据附录，末页附风险提示；
     保证不同页码呈现不同内容 */
  function hxdPageHtml(r, page) {
    var html = '';
    if (page === 1) {
      html += '<div class="hxd-doc-title"><small>' + r.source + ' · ' + r.date + '</small><h2>' + r.title + '</h2>' +
        '<div class="hxd-doc-rating">评级：<b class="' + (r.rating === '偏多' ? 'up' : 'mid') + '">' + r.rating + '</b>　作者：' + r.author + '　页数：' + r.pages + 'P</div></div>';
    }
    var s = r.full[page - 1];
    if (s) html += '<h5>' + s.h + '</h5><p>' + s.p + '</p>';
    else if (page > 1) html += hxdAppendixHtml(r, page);
    if (page === r.pages) html += '<p class="hxd-doc-risk">风险提示及免责声明：本报告为原型演示内容，不构成投资建议，据此操作风险自担。</p>';
    html += '<div class="hxd-doc-pagefoot">— 第 ' + page + ' 页 · 共 ' + r.pages + ' 页 —</div>';
    return html;
  }
  /* 数据附录页：按页码确定性生成不同口径的跟踪表（演示数据） */
  function hxdAppendixHtml(r, page) {
    var kinds = ['价格与价差跟踪', '库存与发运跟踪', '利润与成本跟踪', '持仓与成交跟踪'];
    var k = kinds[(page - 1) % kinds.length];
    var labels = ['现货', '主力合约', '近月合约', '远月合约', '跨期价差'];
    function rnd(seed) { var x = Math.sin(seed * 12.9898 + r.pages * 78.233) * 43758.5453; return x - Math.floor(x); }
    var rows = '';
    for (var i = 0; i < 5; i++) {
      var seed = page * 10 + i;
      var base = 2800 + Math.round(rnd(seed) * 42000);
      var chg = rnd(seed + 1) * 6 - 3;
      var up = chg >= 0;
      rows += '<tr><td>' + labels[i] + '</td><td>' + base.toLocaleString() + '</td><td class="' + (up ? 'up' : 'down') + '">' + (up ? '+' : '') + chg.toFixed(2) + '%</td></tr>';
    }
    return '<h5>附录 ' + (page - r.full.length) + ' · ' + k + '</h5>' +
      '<table class="hxd-doc-table"><thead><tr><th>指标</th><th>数值</th><th>较前日</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<p>本页数据为原型演示口径，按日终更新；指标定义与统计范围详见正文。</p>';
  }

  function renderHxdDoc(app) {
    var r = hxdReport();
    var box = $('.hxd-doc', app);
    var fav = hxd.fav[r.id];
    box.innerHTML =
      '<div class="hxd-doc-actions">' +
      '<button data-a="fav" class="' + (fav ? 'on' : '') + '" title="' + (fav ? '取消收藏' : '收藏') + '">' + (fav ? '★' : '☆') + '</button>' +
      '<button data-a="dl" title="下载">⬇</button>' +
      '<button data-a="share" title="转发">↗</button>' +
      '<button data-a="fs" title="全屏">⛶</button></div>' +
      '<div class="hxd-doc-bar">' +
      '<input class="hxd-doc-search" placeholder="输入关键词" />' +
      '<div class="hxd-doc-pager"><button data-p="prev">‹</button><b>' + hxd.page + '</b><span>/ ' + r.pages + '</span><button data-p="next">›</button></div>' +
      '<div class="hxd-doc-zoom"><button data-z="-">−</button><button data-z="+">＋</button><small>' + Math.round(hxd.zoom * 100) + '%</small></div>' +
      '<select class="hxd-doc-fit"><option>自动缩放</option><option>实际大小</option><option>适合宽度</option></select>' +
      '</div>' +
      '<div class="hxd-doc-body" style="font-size:' + (13 * hxd.zoom).toFixed(1) + 'px">' +
      '<div class="hxd-doc-paper">' + hxdPageHtml(r, hxd.page) + '</div></div>';
    /* 动作 */
    $('[data-a=fav]', box).addEventListener('click', function () {
      hxd.fav[r.id] = !hxd.fav[r.id];
      renderHxdDoc(app);
      toast(hxd.fav[r.id] ? '已收藏，可在「我的关注」查看（复用研报关注链路）' : '已取消收藏');
    });
    $('[data-a=dl]', box).addEventListener('click', function () { toast('《' + r.title + '》PDF 下载已开始（演示）'); });
    $('[data-a=share]', box).addEventListener('click', function () { toast('研报转发链接已复制（演示）'); });
    $('[data-a=fs]', box).addEventListener('click', function () {
      box.classList.toggle('hxd-fullscreen');
      $('[data-a=fs]', box).title = box.classList.contains('hxd-fullscreen') ? '退出全屏' : '全屏';
    });
    /* 工具条 */
    $all('.hxd-doc-pager button', box).forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.getAttribute('data-p') === 'prev') hxd.page = Math.max(1, hxd.page - 1);
        else hxd.page = Math.min(r.pages, hxd.page + 1);
        renderHxdDoc(app);
        var nb = $('.hxd-doc-body', app);
        if (nb) nb.scrollTop = 0;
      });
    });
    $all('.hxd-doc-zoom button', box).forEach(function (b) {
      b.addEventListener('click', function () {
        hxd.zoom = Math.min(1.4, Math.max(0.8, hxd.zoom + (b.getAttribute('data-z') === '+' ? 0.1 : -0.1)));
        renderHxdDoc(app);
      });
    });
    $('.hxd-doc-search', box).addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var kw = e.target.value.trim();
      if (!kw) return;
      var n = (r.title.split(kw).length - 1) + r.full.filter(function (s) { return s.p.indexOf(kw) >= 0 || s.h.indexOf(kw) >= 0; }).length;
      toast('文档检索（演示）：「' + kw + '」匹配 ' + n + ' 处');
    });
  }

  /* ==========================================================
     周度观点 · 策略信号工作台（hxw）
     基本面观点（日度/周度/月度）/ 多因子择时信号 / 套保信号；
     结构参考策略信号工作台截图，样式沿用本页 guojun token 与标题规范
     ========================================================== */
  var hxw = { tab: '基本面观点', sub: '晨报日度观点', hedge: '买入套保', sort: 0, followed: { '豆一': true, '焦煤': true } };

  var HXW_VARS = [
    { n: '螺纹', c: '黑色成材' }, { n: '热卷', c: '黑色成材' }, { n: '铁矿', c: '黑色成材' },
    { n: '焦炭', c: '黑色成材' }, { n: '焦煤', c: '黑色成材' }, { n: '硅铁', c: '黑色成材' }, { n: '锰硅', c: '黑色成材' },
    { n: '沪铜', c: '贵金属有色' }, { n: '沪铝', c: '贵金属有色' }, { n: '氧化铝', c: '贵金属有色' }, { n: '铸造铝合金', c: '贵金属有色' },
    { n: '沪金', c: '贵金属有色' }, { n: '沪银', c: '贵金属有色' },
    { n: '豆一', c: '农林产品' }, { n: '豆粕', c: '农林产品' }, { n: '棕榈油', c: '农林产品' },
    { n: '原油', c: '能源化工' }, { n: '燃料油', c: '能源化工' }, { n: 'PTA', c: '能源化工' }
  ];
  var HXW_PINS = ['铸造铝合金', '氧化铝', '沪铝', '豆一', '沪铜', '焦煤'];
  var HXW_CAL = '<svg class="hxw-ical" viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><rect x="1.5" y="2.5" width="13" height="12" rx="2" fill="none" stroke="currentColor"/><path d="M1.5 6.5h13M5 1v3M11 1v3" stroke="currentColor" fill="none"/></svg>';
  var HXW_PIN = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 1.5h8v13l-4-3.2-4 3.2z" fill="currentColor"/><path d="M8 4.6v4M6 6.6h4" stroke="#fff" stroke-width="1.1"/></svg>';

  function hxwSeed(s) { var x = Math.sin(s * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); }
  function hxwPeriod() {
    if (hxw.tab === '套保信号') return '月度';
    if (hxw.tab === '多因子择时信号') return '日度';
    return hxw.sub === '晨报日度观点' ? '日度' : (hxw.sub === '基本面周度观点' ? '周度' : '月度');
  }
  function hxwRow(v, i) {
    var seed = (hxw.tab.length * 31 + hxw.sub.length * 17 + hxw.hedge.length * 7) + i * 13;
    var chg = hxwSeed(seed) * 8 - 4;
    if (hxw.tab === '套保信号') chg = hxwSeed(seed) * 34 - 6;
    var sig;
    if (hxw.tab === '多因子择时信号') sig = Math.round((hxwSeed(seed + 9) * 2 - 1) * 100); /* 择时评分：真实数值 */
    else { var t = hxwSeed(seed + 5); sig = t < 0.45 ? '中性' : (t < 0.78 ? '强' : '弱'); }
    return { v: v, chg: chg, sig: sig };
  }
  function buildWeeklyApp() {
    var app = el('div', ''); app.id = 'hxwk-app';
    renderHxw(app);
    return app;
  }
  function renderHxw(app) {
    var period = hxwPeriod();
    var html = '<div class="hxw-top"><b>策略信号</b><span>基本面观点 · 多因子择时 · 套保信号工作台；页面为原型演示数据</span></div>';
    html += '<div class="hxw-tabs">' + ['基本面观点', '多因子择时信号', '套保信号'].map(function (t) {
      return '<button data-tab="' + t + '" class="' + (t === hxw.tab ? 'active' : '') + '">' + t + '</button>';
    }).join('') + '</div>';
    if (hxw.tab === '基本面观点') {
      html += '<div class="hxw-seg">' + ['晨报日度观点', '基本面周度观点', '商品月度观点'].map(function (s) {
        return '<button data-sub="' + s + '" class="' + (s === hxw.sub ? 'active' : '') + '">' + s + '</button>';
      }).join('') + '</div>';
    }
    /* 日期栏 */
    var dbar = '';
    if (hxw.tab === '套保信号') {
      dbar = '<div class="hxw-datebar"><span>2026-08-03</span><i>→</i><span>2026-08-31</span>' + HXW_CAL + '</div>' +
        '<select class="hxw-hedge" data-hedge><option' + (hxw.hedge === '买入套保' ? ' selected' : '') + '>买入套保</option><option' + (hxw.hedge === '卖出套保' ? ' selected' : '') + '>卖出套保</option></select>';
    } else if (hxw.tab === '多因子择时信号') {
      dbar = '<div class="hxw-datebar"><span>2026-08-20</span>' + HXW_CAL + '</div>';
    } else {
      dbar = '<div class="hxw-datebar">' + (hxw.sub === '晨报日度观点' ? '<span>2026-08-20</span>' : (hxw.sub === '基本面周度观点' ? '<span>2026-08-17</span><i>→</i><span>2026-08-21</span>' : '<span>2026-08</span>')) + HXW_CAL + '</div>';
    }
    html += '<div class="hxw-bars">' + dbar + '</div>';
    /* 信号表 */
    var rows = HXW_VARS.map(function (v, i) { return hxwRow(v, i); });
    if (hxw.sort === 1) rows.sort(function (a, b) { return a.chg - b.chg; });
    if (hxw.sort === 2) rows.sort(function (a, b) { return b.chg - a.chg; });
    html += '<div class="hxw-table"><table><thead><tr><th>品种</th>' +
      '<th data-sort="1">' + period + '信号<i class="hxw-sort' + (hxw.sort ? ' on' : '') + '">⇅</i></th>' +
      '<th class="num" data-sort="1">' + period + '涨跌幅<i class="hxw-sort' + (hxw.sort ? ' on' : '') + '">⇅</i></th></tr></thead><tbody>' +
      rows.map(function (r) {
        var pin = HXW_PINS.indexOf(r.v.n) >= 0;
        var fol = hxw.followed[r.v.n];
        return '<tr><td>' + (pin ? '<button class="hxw-pin' + (fol ? ' on' : '') + '" data-pin="' + r.v.n + '" title="' + (fol ? '取消关注' : '加入关注') + '">' + HXW_PIN + '</button>' : '') +
          '<span class="hxw-name">' + r.v.n + '</span><span class="hxw-chip">' + r.v.c + '</span></td>' +
          '<td>' + (typeof r.sig === 'number'
            ? '<b class="hxw-sig ' + (r.sig > 0 ? 'up' : (r.sig < 0 ? 'down' : 'mid')) + '">' + (r.sig > 0 ? '+' : '') + r.sig + '</b>'
            : '<b class="hxw-sig ' + (r.sig === '强' ? 'up' : (r.sig === '弱' ? 'down' : 'mid')) + '">' + r.sig + '</b>') + '</td>' +
          '<td class="num ' + (r.chg >= 0 ? 'up' : 'down') + '">' + r.chg.toFixed(2) + '%</td></tr>';
      }).join('') + '</tbody></table></div>';
    app.innerHTML = html;
    /* 绑定 */
    $all('[data-tab]', app).forEach(function (b) {
      b.addEventListener('click', function () { hxw.tab = b.getAttribute('data-tab'); hxw.sort = 0; renderHxw(app); });
    });
    $all('[data-sub]', app).forEach(function (b) {
      b.addEventListener('click', function () { hxw.sub = b.getAttribute('data-sub'); hxw.sort = 0; renderHxw(app); });
    });
    var hedge = $('[data-hedge]', app);
    if (hedge) hedge.addEventListener('change', function () { hxw.hedge = hedge.value; renderHxw(app); });
    $all('th[data-sort]', app).forEach(function (th) {
      th.addEventListener('click', function () { hxw.sort = (hxw.sort + 1) % 3; renderHxw(app); });
    });
    $all('[data-pin]', app).forEach(function (b) {
      b.addEventListener('click', function () {
        var n = b.getAttribute('data-pin');
        hxw.followed[n] = !hxw.followed[n];
        renderHxw(app);
        toast(hxw.followed[n] ? '已关注 ' + n + '，可在「我的关注」查看' : '已取消关注 ' + n);
      });
    });
  }

  /* ==========================================================
     数据与 API · 云市场接口目录（hxa）
     左=分组接口列表（搜索/折叠），右=接口文档；
     点击接口名称查看对应字段（参数表 + 示例 + 错误码）
     ========================================================== */
  var hxa = { apiId: 'morningSignal', kw: '', closed: {} };

  var HXA_APIS = [
    { id: 'morningSignal', g: '研究数据', nw: 1, name: '晨报日度观点信号', desc: '各品种日度基本面观点信号与涨跌幅。', addr: 'unicorn.cloudApi.morningSignal.queryLatest.do', update: '次日6:00更新上一交易日数据',
      req: [['reportDate', 'String', '可选', '报告日期 yyyy-MM-dd，默认最新交易日']],
      resp: [['varietyName', 'String', '品种名称'], ['category', 'String', '板块分类'], ['signal', 'String', '日度信号（强/弱/中性）'], ['changePct', 'Number', '日度涨跌幅（%）']],
      sample: [{ varietyName: '螺纹', category: '黑色成材', signal: '中性', changePct: -0.06 }, { varietyName: '焦炭', category: '黑色成材', signal: '强', changePct: 2.2 }] },
    { id: 'weeklySummary', g: '研究数据', name: '商品周度观点汇总', desc: '各品种周度信号、涨跌幅与核心逻辑摘要。', addr: 'unicorn.cloudApi.weeklySummary.query.do', update: '每周一 8:00 更新',
      req: [['weekDate', 'String', '可选', '所在周任一日期 yyyy-MM-dd']],
      resp: [['varietyName', 'String', '品种名称'], ['weekSignal', 'String', '周度信号'], ['weekChangePct', 'Number', '周涨跌幅（%）'], ['coreLogic', 'String', '核心逻辑摘要']],
      sample: [{ varietyName: '沪铜', weekSignal: '偏多', weekChangePct: 1.82, coreLogic: '库存去化延续，宏观预期改善。' }] },
    { id: 'basisData', g: '研究数据', name: '品种基差查询', desc: '各品种分区域现货价、期货价格与基差日度数据。', addr: 'unicorn.cloudApi.basisData.query.do', update: '次日6:00更新上一交易日数据',
      req: [['code', 'String', '可选', '品种代码，如 cu'], ['startReportDate', 'String', '可选', '开始日期 yyyy-MM-dd'], ['endReportDate', 'String', '可选', '结束日期 yyyy-MM-dd']],
      resp: [['codeName', 'String', '品种名称'], ['district', 'String', '区域'], ['spotPrice', 'Number', '现货价格'], ['contractCode', 'String', '主力合约代码'], ['futuresPrice', 'Number', '期货价格'], ['basisValue', 'Number', '基差']],
      sample: [{ codeName: '沪铜', district: '上海', spotPrice: 78650, contractCode: 'cu2610', futuresPrice: 78420, basisValue: 230 }] },
    { id: 'keyInventory', g: '研究数据', name: '品种重要库存', desc: '重点品种厂库/社会库存及周度变化。', addr: 'unicorn.cloudApi.keyInventory.query.do', update: '每周三 12:00 更新',
      req: [['code', 'String', '可选', '品种代码，如 rb']],
      resp: [['codeName', 'String', '品种名称'], ['inventoryType', 'String', '库存类型（厂库/社库）'], ['inventory', 'Number', '库存量'], ['unit', 'String', '单位'], ['changePct', 'Number', '周度变化（%）']],
      sample: [{ codeName: '螺纹', inventoryType: '社库', inventory: 62.4, unit: '万吨', changePct: -1.31 }] },
    { id: 'factorData', g: '研究数据', nw: 1, name: '因子数据', desc: '品种横截面因子值（动量/基差/库存周期）。', addr: 'unicorn.cloudApi.factorData.query.do', update: '次日6:00更新',
      req: [['factorName', 'String', '可选', '因子名称，默认全部']],
      resp: [['codeName', 'String', '品种名称'], ['factorName', 'String', '因子名称'], ['factorValue', 'Number', '因子值'], ['updateDate', 'String', '更新日期']],
      sample: [{ codeName: '铁矿', factorName: '动量', factorValue: 0.62, updateDate: '2026-08-20' }] },
    { id: 'marginRate', g: '交易参数', name: '保证金比例查询', desc: '各合约最新保证金比例与生效日期。', addr: 'unicorn.cloudApi.marginRate.query.do', update: '每日 17:00 更新',
      req: [['contractCode', 'String', '可选', '合约代码，默认全部主力']],
      resp: [['productCode', 'String', '品种代码'], ['contractCode', 'String', '合约代码'], ['marginRate', 'Number', '保证金比例（%）'], ['effectiveDate', 'String', '生效日期']],
      sample: [{ productCode: 'cu', contractCode: 'cu2610', marginRate: 10, effectiveDate: '2026-08-19' }] },
    { id: 'priceLimit', g: '交易参数', name: '涨跌停板幅度', desc: '各合约涨跌停板价格与幅度。', addr: 'unicorn.cloudApi.priceLimit.query.do', update: '每日 17:00 更新',
      req: [['productCode', 'String', '可选', '品种代码']],
      resp: [['contractCode', 'String', '合约代码'], ['preSettle', 'Number', '前结算价'], ['upLimitPrice', 'Number', '涨停价'], ['downLimitPrice', 'Number', '跌停价']],
      sample: [{ contractCode: 'rb2610', preSettle: 3050, upLimitPrice: 3233, downLimitPrice: 2867 }] },
    { id: 'realtimeQuote', g: '行情', name: '实时行情', desc: '全合约最新价、涨跌、成交与持仓。', addr: 'unicorn.cloudApi.realtimeQuote.query.do', update: '交易时段 3s 级推送',
      req: [['contractCode', 'String', '可选', '合约代码，默认全部']],
      resp: [['contractCode', 'String', '合约代码'], ['lastPrice', 'Number', '最新价'], ['upDown1', 'Number', '涨跌'], ['volume', 'Number', '成交量'], ['openInterest', 'Number', '持仓量']],
      sample: [{ contractCode: 'rb2610', lastPrice: 3072, upDown1: 14, volume: 623104, openInterest: 1420000 }] },
    { id: 'dailyKline', g: '行情', name: '日K线', desc: '合约日线 OHLCV 序列。', addr: 'unicorn.cloudApi.dailyKline.query.do', update: '每日收盘后更新',
      req: [['contractCode', 'String', '必选', '合约代码'], ['startReportDate', 'String', '可选', '开始日期'], ['endReportDate', 'String', '可选', '结束日期']],
      resp: [['tradeDate', 'String', '交易日'], ['open', 'Number', '开盘价'], ['high', 'Number', '最高价'], ['low', 'Number', '最低价'], ['close', 'Number', '收盘价'], ['volume', 'Number', '成交量']],
      sample: [{ tradeDate: '2026-08-20', open: 3058, high: 3085, low: 3041, close: 3072, volume: 623104 }] },
    { id: 'reportList', g: '研究动态', name: '研报列表', desc: '研究报告标题、作者与发布时间。', addr: 'unicorn.cloudApi.reportList.query.do', update: '发布后 10 分钟内',
      req: [['tag', 'String', '可选', '标签（日报/周报/深度…）'], ['pageNo', 'Number', '可选', '页码，默认 1']],
      resp: [['reportId', 'String', '研报ID'], ['title', 'String', '标题'], ['author', 'String', '作者'], ['publishDate', 'String', '发布时间']],
      sample: [{ reportId: 'r1', title: '螺纹钢：板块情绪共振，关注利润变动', author: '沈望', publishDate: '2026-08-19 10:30' }] }
  ];
  var HXA_GROUPS = ['研究数据', '交易参数', '行情', '研究动态'];
  function hxaApi() { for (var i = 0; i < HXA_APIS.length; i++) if (HXA_APIS[i].id === hxa.apiId) return HXA_APIS[i]; return HXA_APIS[0]; }
  function hxaTable(head, rows) {
    return '<div class="hxw-table"><table><thead><tr>' + head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  function hxaReqSample(a) {
    var demo = { code: 'cu', contractCode: 'cu2610', productCode: 'cu', reportDate: '2026-08-20', weekDate: '2026-08-17', startReportDate: '2026-08-01', endReportDate: '2026-08-20', factorName: '动量', tag: '日报', pageNo: 1 };
    var o = {};
    a.req.forEach(function (r) { if (demo[r[0]] !== undefined) o[r[0]] = demo[r[0]]; });
    return o;
  }
  function buildApiApp() {
    var app = el('div', ''); app.id = 'hxa-app';
    app.innerHTML = '<div class="hxa-top"><b>数据与 API</b><span>云市场研究数据接口目录 · 点击接口名称查看字段；页面为原型演示数据</span></div>' +
      '<div class="hxa-layout"><div class="hxa-side"><input class="hxa-search" placeholder="搜索接口" /><div class="hxa-groups"></div></div><div class="hxa-doc"></div></div>';
    $('.hxa-search', app).addEventListener('input', function (e) { hxa.kw = e.target.value.trim(); renderHxaGroups(app); });
    renderHxaGroups(app);
    renderHxaDoc(app);
    return app;
  }
  function renderHxaGroups(app) {
    var box = $('.hxa-groups', app);
    var kw = hxa.kw;
    box.innerHTML = HXA_GROUPS.map(function (g) {
      var items = HXA_APIS.filter(function (a) { return a.g === g && (!kw || a.name.indexOf(kw) >= 0); });
      if (!items.length) return '';
      return '<div class="hxa-group' + (hxa.closed[g] ? ' closed' : '') + '"><button class="hxa-group-h" data-g="' + g + '">' + g + '（' + items.length + '）<i class="arr">▼</i></button><div class="hxa-items">' +
        items.map(function (a) { return '<button class="hxa-item' + (a.id === hxa.apiId ? ' active' : '') + '" data-api="' + a.id + '">' + a.name + (a.nw ? '<i class="hxa-new">NEW</i>' : '') + '</button>'; }).join('') +
        '</div></div>';
    }).join('');
    $all('[data-g]', box).forEach(function (b) {
      b.addEventListener('click', function () { var g = b.getAttribute('data-g'); hxa.closed[g] = !hxa.closed[g]; renderHxaGroups(app); });
    });
    $all('[data-api]', box).forEach(function (b) {
      b.addEventListener('click', function () { hxa.apiId = b.getAttribute('data-api'); renderHxaGroups(app); renderHxaDoc(app); });
    });
  }
  function renderHxaDoc(app) {
    var a = hxaApi();
    var doc = $('.hxa-doc', app);
    doc.innerHTML = '<div><h2>' + a.name + '</h2><div class="desc">' + a.desc + '</div></div>' +
      '<div class="hxa-meta"><span>调用地址</span><code class="hxa-addr">' + a.addr + '</code><span>返回类型：json</span>' + (a.update ? '<span>更新时间：' + a.update + '</span>' : '') + '</div>' +
      '<div class="hxa-notice">尊敬的客户：本接口为原型演示，字段与示例仅供参考；生产环境开通与权限请联系客户经理。</div>' +
      '<div class="hxa-sec">请求参数（HEADERS）</div>' + hxaTable(['名称', '类型', '是否必须', '描述'], [['accessKeyId', 'String', '必选', '访问凭证 ID'], ['accessKeySecret', 'String', '必选', '访问凭证密钥']]) +
      '<div class="hxa-sec">请求参数（BODY）</div>' + hxaTable(['名称', '类型', '是否必须', '描述'], a.req) +
      '<div class="hxa-sec">响应参数（BODY）</div>' + hxaTable(['名称', '类型', '描述'], a.resp) +
      '<div class="hxa-sec">请求示例</div><pre class="hxa-code">' + JSON.stringify({ accessKeyId: 'ak-demo-0001', body: hxaReqSample(a) }, null, 2) + '</pre>' +
      '<div class="hxa-sec">正常返回示例</div><pre class="hxa-code">' + JSON.stringify({ code: 0, message: 'success', data: a.sample }, null, 2) + '</pre>' +
      '<div class="hxa-sec">错误码</div>' + hxaTable(['错误码', '错误信息', '描述'], [['0', 'success', '请求成功'], ['429', 'too many requests', '请求频率超限'], ['300003', 'permission denied', 'AccessKey 未开通本接口']]);
  }

  /* ==========================================================
     智能交易工作台（hxt）：资金条 / 行情面板（二级目录） / 交易面板 / 状态条
     ========================================================== */
  var hxt = { tab: '自选', chip: '全部', sel: null, side: '买', off: '开仓', ptab: '持仓列表' };
  /* 品种定义：[代码, 名称, 交易所, 参考价, 是否夜盘, 小数位]（虚构演示数据） */
  var HXT_VARS = [
    ['rb', '螺纹', '上期所', 3045, 1, 0], ['hc', '热卷', '上期所', 3120, 1, 0], ['cu', '沪铜', '上期所', 78420, 1, 0],
    ['al', '沪铝', '上期所', 20640, 1, 0], ['au', '沪金', '上期所', 798.6, 1, 2], ['ag', '沪银', '上期所', 9180, 1, 0],
    ['i', '铁矿', '大商所', 812, 1, 1], ['j', '焦炭', '大商所', 1976, 1, 1], ['jm', '焦煤', '大商所', 1289, 1, 1],
    ['m', '豆粕', '大商所', 2987, 1, 0], ['p', '棕榈油', '大商所', 8456, 1, 0], ['l', '塑料', '大商所', 7420, 1, 0],
    ['TA', 'PTA', '郑商所', 4873, 1, 0], ['MA', '甲醇', '郑商所', 2391, 1, 0], ['SR', '白糖', '郑商所', 5823, 0, 0],
    ['CF', '棉花', '郑商所', 13960, 0, 0], ['FG', '玻璃', '郑商所', 1248, 1, 0], ['SA', '纯碱', '郑商所', 1462, 1, 0],
    ['sc', '原油', '能源中心', 542.8, 1, 1], ['nr', '20号胶', '能源中心', 12480, 1, 0],
    ['lc', '碳酸锂', '广期所', 86750, 0, 0], ['si', '工业硅', '广期所', 9320, 0, 0],
    ['IF', '沪深300', '中金所', 4128, 0, 1], ['T', '10年国债', '中金所', 106.8, 0, 3]
  ];
  var HXT_MONTHS = ['2610', '2701'];
  var HXT_TABS = ['自选', '主力', '夜盘', '上期所', '大商所', '郑商所', '能源中心', '广期所', '中金所'];
  var HXT_SELFC = ['rb2610', 'i2610', 'cu2610', 'TA2610', 'm2610', 'au2610', 'sc2610', 'FG2610'];
  var HXT_SYMS = [];
  HXT_VARS.forEach(function (v, vi) {
    HXT_MONTHS.forEach(function (mo, mi) {
      HXT_SYMS.push({ code: v[0] + mo, name: v[1] + mo, ex: v[2], product: v[1], base: v[3], night: !!v[4], d: v[5], main: mi === 0, seed: vi * 7 + mi * 3 + 11 });
    });
  });
  function hxtSeed(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function hxtFmt(n, d) { return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function hxtQuote(s) {
    if (s.q) return s.q;
    var r1 = hxtSeed(s.seed), r2 = hxtSeed(s.seed + 3), r3 = hxtSeed(s.seed + 7), r4 = hxtSeed(s.seed + 11);
    var settle = s.base;
    var last = settle * (1 + (r1 - 0.46) * 0.024);
    var open = settle * (1 + (r2 - 0.5) * 0.01);
    var step = Math.pow(10, -s.d);
    var t = function (n) { return Math.round(n / step) * step; };
    s.q = {
      last: t(last), open: t(open),
      chg: t(last - settle), pct: (last - settle) / settle * 100,
      bid: t(last - step), ask: t(last + step),
      limitUp: t(settle * 1.06), limitDn: t(settle * 0.94),
      vol: Math.round(r2 * 880000 + 62000),
      oi: Math.round(r3 * 2800000 + 180000),
      oiChg: Math.round((r4 - 0.5) * 52000)
    };
    return s.q;
  }
  function hxtTabList() {
    var t = hxt.tab;
    if (t === '自选') return HXT_SYMS.filter(function (s) { return HXT_SELFC.indexOf(s.code) >= 0; });
    if (t === '主力') return HXT_SYMS.filter(function (s) { return s.main; });
    if (t === '夜盘') return HXT_SYMS.filter(function (s) { return s.night && s.main; });
    return HXT_SYMS.filter(function (s) { return s.ex === t; });
  }
  function hxtRow(s) {
    var q = hxtQuote(s);
    var cls = q.chg > 0 ? 'up' : (q.chg < 0 ? 'down' : '');
    var oc = q.oiChg > 0 ? 'up' : (q.oiChg < 0 ? 'down' : '');
    return '<tr data-code="' + s.code + '" class="' + (hxt.sel === s.code ? 'on' : '') + '">' +
      '<td class="code">' + s.code + '</td>' +
      '<td class="nm">' + s.name + '</td>' +
      '<td class="' + cls + '">' + hxtFmt(q.last, s.d) + '</td>' +
      '<td class="' + cls + '">' + (q.chg > 0 ? '+' : '') + hxtFmt(q.chg, s.d) + '</td>' +
      '<td class="' + cls + '">' + (q.pct > 0 ? '+' : '') + q.pct.toFixed(2) + '%</td>' +
      '<td>' + hxtFmt(q.bid, s.d) + '</td><td>' + hxtFmt(q.ask, s.d) + '</td>' +
      '<td>' + (q.vol / 10000).toFixed(2) + '万</td><td>' + (q.oi / 10000).toFixed(2) + '万</td>' +
      '<td class="' + oc + '">' + (q.oiChg > 0 ? '+' : '') + q.oiChg.toLocaleString('en-US') + '</td>' +
      '<td>' + hxtFmt(q.open, s.d) + '</td><td>' + hxtFmt(s.base, s.d) + '</td></tr>';
  }
  var HXT_FUND = [['账号', '8888****0114', ''], ['可用资金', '1,286,540', ''], ['平仓盈亏', '+3,120', 'up'], ['持仓盈亏', '-8,650', 'down'], ['动态权益', '2,431,800', ''], ['占用保证金', '1,086,260', ''], ['下单冻结', '0', ''], ['风险度', '44.7%', '']];
  var HXT_POS_HEAD = ['合约', '买卖', '开平', '总持仓', '持仓均价', '持仓盈亏', '浮动盈亏', '保证金', '交易所'];
  var HXT_POS_ROWS = [
    ['rb2610', '<span class="up">买</span>', '开', 12, '2,986', '<span class="up">+18,460</span>', '<span class="up">+7,080</span>', '21,500', '上期所'],
    ['i2610', '<span class="down">卖</span>', '开', 8, '828.5', '<span class="down">-6,320</span>', '<span class="down">-12,400</span>', '33,140', '大商所'],
    ['au2610', '<span class="up">买</span>', '开', 3, '786.20', '<span class="up">+9,840</span>', '<span class="up">+37,080</span>', '71,460', '上期所'],
    ['TA2610', '<span class="up">买</span>', '平', 6, '4,812', '<span class="up">+2,150</span>', '<span class="down">-3,660</span>', '14,620', '郑商所']
  ];
  var HXT_ORD_HEAD = ['合约', '买卖', '开平', '价格', '数量', '已成', '状态'];
  var HXT_ORD_ROWS = [
    ['m2610', '<span class="up">买</span>', '开', '2,972', 10, 6, '部分成交'],
    ['FG2610', '<span class="down">卖</span>', '开', '1,266', 5, 5, '已成交']
  ];
  var HXT_DEAL_HEAD = ['合约', '买卖', '开平', '成交价', '成交量', '成交时间'];
  var HXT_DEAL_ROWS = [
    ['m2610', '<span class="up">买</span>', '开', '2,972', 6, '09:31:24'],
    ['cu2610', '<span class="down">卖</span>', '平', '78,540', 2, '10:02:47'],
    ['SA2610', '<span class="up">买</span>', '开', '1,458', 4, '10:26:03']
  ];
  function buildTradeApp() {
    var app = el('div', ''); app.id = 'hxt-app';
    app.innerHTML =
      '<div class="hxt-fund">' + HXT_FUND.map(function (f) { return '<div><span>' + f[0] + '</span><b class="' + f[2] + '">' + f[1] + '</b></div>'; }).join('') + '</div>' +
      '<div class="hxt-card hxt-market">' +
        '<div class="hxt-mh"><b>实时行情</b><span>行情数据</span><button class="hxt-download-entry" type="button">终端下载</button></div>' +
        '<div class="hxt-tabs"></div><div class="hxt-chips"></div>' +
        '<div class="hxt-twrap"><table class="hxt-table"><thead><tr>' +
        ['合约', '合约名', '最新价', '涨跌', '涨跌幅', '买价', '卖价', '成交量', '持仓量', '持仓增减', '今开', '昨结'].map(function (h) { return '<th>' + h + '</th>'; }).join('') +
        '</tr></thead><tbody></tbody></table></div>' +
      '</div>' +
      '<div class="hxt-trade">' +
        '<div class="hxt-card hxt-order">' +
          '<div class="hxt-oh"><b>模拟交易</b><span>模拟账号 8888****0114</span></div>' +
          '<div class="hxt-orow"><label>合约</label><input class="hxt-contract" readonly></div>' +
          '<div class="hxt-seg"><button data-side="买" class="on buy">买</button><button data-side="卖">卖</button></div>' +
          '<div class="hxt-seg"><button data-off="开仓" class="on plain">开仓</button><button data-off="平仓">平仓</button></div>' +
          '<div class="hxt-orow"><label>手数</label><input class="hxt-qty" value="1"><label>价格</label><input placeholder="对手价"></div>' +
          '<div class="hxt-glance"></div>' +
          '<button class="hxt-submit buy">买入开仓</button>' +
        '</div>' +
        '<div class="hxt-card hxt-pos"><div class="hxt-ptabs"></div><div class="hxt-pbody"></div></div>' +
      '</div>' +
      '<div class="hxt-state"><i></i><b>已连接</b></div>';
    app.addEventListener('click', function (e) {
      var t = e.target instanceof Element ? e.target : null;
      if (!t) return;
      var tr = t.closest('tr[data-code]');
      if (tr) { hxt.sel = tr.getAttribute('data-code'); renderHxt(app); return; }
      var b = t.closest('button');
      if (!b) return;
      if (b.hasAttribute('data-htab')) { hxt.tab = b.getAttribute('data-htab'); hxt.chip = '全部'; renderHxt(app); return; }
      if (b.hasAttribute('data-chip')) { hxt.chip = b.getAttribute('data-chip'); renderHxt(app); return; }
      if (b.hasAttribute('data-side')) { hxt.side = b.getAttribute('data-side'); renderHxt(app); return; }
      if (b.hasAttribute('data-off')) { hxt.off = b.getAttribute('data-off'); renderHxt(app); return; }
      if (b.hasAttribute('data-ptab')) { hxt.ptab = b.getAttribute('data-ptab'); renderHxt(app); return; }
      if (b.classList.contains('hxt-download-entry')) { location.href = '/terminal-download.html'; return; }
      if (b.classList.contains('hxt-submit')) {
        var qty = ($('.hxt-qty', app) || {}).value || '1';
        toast('模拟委托已提交：' + hxt.side + hxt.off + ' ' + (hxt.sel || '--') + ' × ' + qty + ' 手（演示）');
      }
    });
    renderHxt(app);
    return app;
  }
  function renderHxt(app) {
    $('.hxt-tabs', app).innerHTML = HXT_TABS.map(function (t) {
      return '<button data-htab="' + t + '" class="' + (t === hxt.tab ? 'active' : '') + '">' + t + '</button>';
    }).join('');
    var base = hxtTabList();
    var chips = ['全部'];
    base.forEach(function (s) { if (chips.indexOf(s.product) < 0) chips.push(s.product); });
    if (chips.indexOf(hxt.chip) < 0) hxt.chip = '全部';
    $('.hxt-chips', app).innerHTML = chips.map(function (c) {
      return '<button data-chip="' + c + '" class="' + (c === hxt.chip ? 'active' : '') + '">' + c + '</button>';
    }).join('');
    var list = hxt.chip === '全部' ? base : base.filter(function (s) { return s.product === hxt.chip; });
    if (!hxt.sel || !list.some(function (s) { return s.code === hxt.sel; })) hxt.sel = list.length ? list[0].code : null;
    $('tbody', app).innerHTML = list.map(hxtRow).join('');
    renderHxtOrder(app);
    renderHxtPos(app);
  }
  function hxtSym(code) {
    var s = null;
    HXT_SYMS.forEach(function (x) { if (x.code === code) s = x; });
    return s;
  }
  function renderHxtOrder(app) {
    var s = hxtSym(hxt.sel);
    $('.hxt-contract', app).value = s ? s.code + ' ' + s.name : '--';
    var gl = $('.hxt-glance', app);
    if (s) {
      var q = hxtQuote(s);
      gl.innerHTML = [['涨停', q.limitUp, 'up'], ['卖一', q.ask, 'up'], ['买一', q.bid, 'down'], ['跌停', q.limitDn, 'down']].map(function (g) {
        return '<span>' + g[0] + '<b class="' + g[2] + '">' + hxtFmt(g[1], s.d) + '</b></span>';
      }).join('');
    } else gl.innerHTML = '';
    $all('[data-side]', app).forEach(function (b) {
      var on = b.getAttribute('data-side') === hxt.side;
      b.className = on ? 'on ' + (hxt.side === '买' ? 'buy' : 'sell') : '';
    });
    $all('[data-off]', app).forEach(function (b) {
      b.className = b.getAttribute('data-off') === hxt.off ? 'on plain' : '';
    });
    var sub = $('.hxt-submit', app);
    sub.textContent = (hxt.side === '买' ? '买入' : '卖出') + hxt.off;
    sub.className = 'hxt-submit ' + (hxt.side === '买' ? 'buy' : 'sell');
  }
  function renderHxtPos(app) {
    var tabs = ['持仓列表', '未成交', '委托列表', '成交列表'];
    $('.hxt-ptabs', app).innerHTML = tabs.map(function (t) {
      return '<button data-ptab="' + t + '" class="' + (t === hxt.ptab ? 'active' : '') + '">' + t + '</button>';
    }).join('');
    var head = HXT_POS_HEAD, rows = HXT_POS_ROWS;
    if (hxt.ptab === '未成交') { head = HXT_ORD_HEAD; rows = []; }
    if (hxt.ptab === '委托列表') { head = HXT_ORD_HEAD; rows = HXT_ORD_ROWS; }
    if (hxt.ptab === '成交列表') { head = HXT_DEAL_HEAD; rows = HXT_DEAL_ROWS; }
    var body = $('.hxt-pbody', app);
    if (!rows.length) { body.innerHTML = '<div class="hxt-empty">今日暂无未成交委托</div>'; return; }
    body.innerHTML = '<div class="hxt-twrap"><table class="hxt-table"><thead><tr>' +
      head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody></table></div>';
  }

  /* ==========================================================
     启动
     ========================================================== */
  /* 一级导航点击：切走其他栏目时重置子板块；点「投研支持」保留子板块状态 */
  function bindTopNav(shell) {
    var nav = $('.main-header nav', shell);
    if (!nav || nav.dataset.hxrBound) return;
    nav.dataset.hxrBound = '1';
    nav.addEventListener('click', function (e) {
      var b = e.target instanceof Element ? e.target.closest('button') : null;
      if (!b || b.textContent.trim() === '投研支持') return;
      hxr.mode = '';
    }, true);
    buildNavDrop(shell);
  }

  /* 深链直达二级板块（演示与验收截图用；React 水合前点击无效，重试直至视图切换） */
  function applyHash() {
    var h = (location.hash || '').replace('#', '');
    if (h === 'smart') {
      var st = 0;
      (function gos() {
        var shell = $('.site-shell');
        if (shell && shell.getAttribute('data-view') === 'smart') { decorate(); return; }
        goNav('智能交易');
        if (st++ < 20) setTimeout(gos, 250);
      })();
      return;
    }
    var pm = h.match(/!p(\d+)$/);
    if (pm) { hxd.page = parseInt(pm[1], 10) || 1; h = h.slice(0, pm[0].length * -1); }
    var mode = h === 'research-analyst' ? 'analyst' : (h === 'research-reports' ? 'reports' : (h === 'research-weekly' ? 'weekly' : (h === 'research-overview' ? 'overview' : (h === 'research-api' ? 'api' : ''))));
    if (!mode) return;
    hxr.mode = mode === 'overview' ? '' : mode;
    var tries = 0;
    (function go() {
      var shell = $('.site-shell');
      if (shell && shell.getAttribute('data-view') === 'research') { decorate(); return; }
      goNav('投研支持');
      if (tries++ < 20) setTimeout(go, 250);
    })();
  }
  function boot() {
    buildToolbar();
    buildModal();
    buildMsgPanel();
    buildAI();
    document.addEventListener('open-research-analyst', function (e) {
      var id = e.detail && e.detail.id;
      if (!HXR_ANALYSTS.some(function (a) { return a.id === id; })) return;
      hxr.analystId = id;
      hxr.mode = 'analyst';
      hxr.field = 'all';
      hxr.kw = '';
      hxr.tab = '观点追踪';
      hxr.sub = '全部动态';
      hxr.variety = '全部';
      hxr.page = 1;
      goNav('投研支持');
      setTimeout(decorate, 80);
    });
    /* 数据说明条：点「我知道了」后收起黄条（原编译产物仅弹 toast） */
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (t instanceof Element && t.closest('.data-disclaimer button')) {
        setTimeout(function () { var d = $('.data-disclaimer'); if (d) d.style.display = 'none'; }, 60);
      }
    }, true);
    decorate();
    applyHash(); /* 深链直达：#research-analyst / #research-reports */
    var pending = false;
    var mo = new MutationObserver(function (muts) {
      if (pending) return;
      var relevant = muts.some(function (m) {
        return !isHx(m.target) && !(m.addedNodes && Array.prototype.every.call(m.addedNodes, isHx));
      });
      if (!relevant) return;
      pending = true;
      requestAnimationFrame(function () { pending = false; decorate(); });
    });
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-view'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
