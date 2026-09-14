(function () {
  'use strict';

  var LOGIN_PHONE = '13800002026';

  function isPhoneInput(input) {
    if (!input || input.tagName !== 'INPUT') return false;
    var type = (input.getAttribute('type') || 'text').toLowerCase();
    if (type !== 'text' && type !== 'tel' && type !== '') return false;
    var context = [
      input.name,
      input.id,
      input.placeholder,
      input.getAttribute('aria-label'),
      input.closest('label') && input.closest('label').textContent,
      input.parentElement && input.parentElement.textContent
    ].filter(Boolean).join(' ');
    return type === 'tel' || /手机号|手机号码|联系电话|联系手机|联系人与手机号|phone|mobile/i.test(context);
  }

  function fill(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('input').forEach(function (input) {
      if (!isPhoneInput(input) || input.dataset.loginPhoneFilled) return;
      input.dataset.loginPhoneFilled = '1';
      input.value = LOGIN_PHONE;
      input.setAttribute('value', LOGIN_PHONE);
      input.setAttribute('autocomplete', 'tel');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  window.prefillLoginPhone = fill;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { fill(document); });
  else fill(document);

  new MutationObserver(function (records) {
    records.forEach(function (record) {
      record.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return;
        if (node.matches && node.matches('input') && isPhoneInput(node)) fill(node.parentElement || document);
        else fill(node);
      });
    });
  }).observe(document.documentElement, { childList: true, subtree: true });
}());
