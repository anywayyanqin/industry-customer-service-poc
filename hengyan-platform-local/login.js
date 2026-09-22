(function () {
  'use strict';
  if (window.platformLoginMounted) return;
  window.platformLoginMounted = true;
  var root = document.createElement('section');
  root.className = 'platform-login';
  root.setAttribute('aria-label', '平台登录');
  root.innerHTML = '<header class="login-header"><b class="login-brand">国泰君安期货</b><span class="login-brand-caption">产业客户服务</span></header><div class="login-layout"><section class="login-promo"><h1>产业服务<br><span>一站直达</span></h1><p>研究资讯 · 专业咨询 · 业务办理</p></section><section class="login-card"><h2>产业版一站式服务平台</h2><div class="login-card-body"><div class="login-tabs" role="tablist" aria-label="登录身份"><button type="button" role="tab" data-role="user" aria-selected="true">用户登录/注册</button><button type="button" role="tab" data-role="admin" aria-selected="false">管理员登录</button></div><div class="login-form-host"></div><button class="login-demo-entry" type="button">先浏览演示平台 →</button></div></section></div><footer class="login-footer">产业版一站式服务平台 · 专业相伴，服务同行</footer><dialog class="login-notice"><h3></h3><p></p><button type="button">知道了</button></dialog>';
  document.body.appendChild(root);
  document.body.classList.add('login-open');
  // The compiled homepage may replace body children during hydration.
  new MutationObserver(function () {
    if (!root.isConnected) document.body.appendChild(root);
    if (!root.hidden) document.body.classList.add('login-open');
  }).observe(document.documentElement, { childList: true, subtree: true });
  var role = 'user', method = 'phone', step = 1;
  var host = root.querySelector('.login-form-host');
  function notice(title, message) {
    var dialog = root.querySelector('dialog');
    dialog.querySelector('h3').textContent = title;
    dialog.querySelector('p').textContent = message;
    dialog.showModal();
  }
  root.querySelector('dialog button').onclick = function () { root.querySelector('dialog').close(); };
  function enter() { root.hidden = true; document.body.classList.remove('login-open'); }
  root.querySelector('.login-demo-entry').onclick = enter;
  function render() {
    var admin = role === 'admin', wechat = !admin && method === 'wechat';
    host.innerHTML = '<form novalidate>' + (!admin ? '<div class="login-methods" role="tablist" aria-label="登录方式"><button type="button" role="tab" data-method="phone" aria-selected="' + !wechat + '">手机号/邮箱登录</button><button type="button" role="tab" data-method="wechat" aria-selected="' + wechat + '">微信登录 <sup>NEW</sup></button></div>' : '') + (wechat ? '<div class="login-wechat"><strong>微信扫码登录</strong><span>演示版暂未接入微信授权</span><button class="login-link" type="button" data-method="phone">使用手机号/邮箱登录 →</button></div>' : '<label class="login-field"><span aria-hidden="true">♙</span><input name="account" aria-label="' + (admin ? '用户名' : '手机号或邮箱') + '" placeholder="' + (admin ? '请输入用户名' : '请输入手机号或邮箱') + '" autocomplete="' + (admin ? 'username' : 'off') + '"></label>' + (admin ? '<label class="login-field"><span aria-hidden="true">♧</span><input name="password" type="password" aria-label="密码" placeholder="请输入密码" autocomplete="current-password"><button type="button" class="login-password-toggle" aria-label="显示密码">显示</button></label>' : step === 2 ? '<label class="login-field"><input name="code" aria-label="验证码" placeholder="请输入验证码" inputmode="numeric" maxlength="6"><button type="button" class="login-send-code">获取验证码</button></label>' : '')) + '<label class="login-consent"><input name="consent" type="checkbox"><span>我已阅读并同意 <button type="button" class="login-link" data-notice="用户协议">用户协议</button> 和 <button type="button" class="login-link" data-notice="隐私政策">隐私政策</button></span></label>' + (admin ? '<div class="login-recovery"><button type="button" class="login-link" data-notice="忘记用户名">忘记用户名</button><span>|</span><button type="button" class="login-link" data-notice="忘记密码">忘记密码</button></div>' : '') + (!wechat ? '<button class="login-submit" type="submit" disabled>' + (admin ? '登录' : step === 1 ? '下一步' : '登录 / 注册') + '</button>' : '') + '<p class="login-message" role="status">' + (step === 2 && !admin && !wechat ? '演示验证码：123456，不会发送短信或邮件。' : '') + '</p></form>';
    var form = host.querySelector('form');
    form.querySelectorAll('.login-field > span').forEach(function (icon, index) {
      icon.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' + (index === 0 ? '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>' : '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/>') + '</svg>';
    });
    function valid() {
      var account = form.elements.account;
      var accountValid = account && (admin ? account.value.trim().length > 0 : /^(1\d{10}|[^\s@]+@[^\s@]+\.[^\s@]+)$/.test(account.value.trim()));
      var submit = form.querySelector('.login-submit');
      if (submit) submit.disabled = !(accountValid && form.elements.consent.checked && (!admin || form.elements.password.value.length > 0) && (admin || step === 1 || /^\d{6}$/.test(form.elements.code.value)));
    }
    form.addEventListener('input', valid);
    form.addEventListener('change', valid);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (form.querySelector('.login-submit').disabled) return;
      if (admin) { notice('管理员登录', '当前为页面演示，尚未连接管理员认证服务。可通过下方“先浏览演示平台”查看现有功能。'); return; }
      if (step === 1) { var account = form.elements.account.value; step = 2; render(); host.querySelector('[name=account]').value = account; host.querySelector('[name=consent]').checked = true; host.querySelector('[name=code]').focus(); return; }
      if (form.elements.code.value !== '123456') { form.querySelector('.login-message').textContent = '验证码不正确，请使用演示验证码 123456。'; return; }
      enter();
    });
    var toggle = form.querySelector('.login-password-toggle');
    if (toggle) toggle.onclick = function () { var input = form.elements.password; var show = input.type === 'password'; input.type = show ? 'text' : 'password'; toggle.textContent = show ? '隐藏' : '显示'; toggle.setAttribute('aria-label', show ? '隐藏密码' : '显示密码'); };
    var send = form.querySelector('.login-send-code');
    if (send) send.onclick = function () { form.querySelector('.login-message').textContent = '演示验证码：123456，不会发送短信或邮件。'; };
    host.querySelectorAll('[data-method]').forEach(function (button) { button.onclick = function () { method = button.dataset.method; step = 1; render(); }; });
    host.querySelectorAll('[data-notice]').forEach(function (button) { button.onclick = function () { var title = button.dataset.notice; notice(title, title.indexOf('忘记') === 0 ? '请联系平台管理员协助找回账号。此演示页面暂未连接账号找回服务。' : '此处为' + title + '展示位置。正式上线时将展示完整文件；当前为交互演示，不采集或发送您输入的登录信息。'); }; });
  }
  root.querySelectorAll('[data-role]').forEach(function (button) { button.onclick = function () { role = button.dataset.role; step = 1; root.querySelectorAll('[data-role]').forEach(function (item) { item.setAttribute('aria-selected', String(item === button)); }); render(); }; });
  render();
}());
