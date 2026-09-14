(()=>{
  if(!location.hash.includes('activity'))return;
  const routes=['service-hubs.html#activity','service-hubs.html?category=policy#activity','service-hubs.html?category=research#activity','service-hubs.html?category=salon#activity'];
  const tabs=document.querySelector('#tabs');if(!tabs)return;
  tabs.setAttribute('aria-label','活动分类页面');
  [...tabs.querySelectorAll('[data-filter]')].forEach((button,index)=>{
    button.dataset.categoryPage=routes[index];
    const current=new URLSearchParams(location.search).get('category')||'all',keys=['all','policy','research','salon'];
    button.classList.toggle('active',keys[index]===current);
  });
  tabs.addEventListener('click',event=>{
    const button=event.target.closest('[data-category-page]');if(!button)return;
    event.preventDefault();event.stopImmediatePropagation();location.href=button.dataset.categoryPage;
  },true);
})();
