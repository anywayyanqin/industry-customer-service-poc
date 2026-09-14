(()=>{
  const homes={咨询服务:'consulting-center.html',培训课程:'training-center.html','活动与调研':'service-hubs.html#activity',人才服务:'service-hubs.html#talent'};
  const routes={
    '业务开展可行性分析':'index.html','内控管理制度建设':'basic-service-home.html#content/internal-control','监管政策解读及案例分析':'basic-service-home.html#content/policy-center',
    '套保会计实务':'training-center.html#course/hedge-accounting','套保会计课程':'training-center.html#branch/practice','风险管理基础知识':'training-center.html#course/risk-foundation','风险管理基础课程':'training-center.html#branch/foundation','衍生品工具应用实例':'course-experience.html#derivative','衍生品应用案例课程':'training-center.html#branch/application',
    '监管政策解读直播':'service-hubs.html?category=policy#activity','行业调研策划及信息分享':'service-hubs.html?category=research#activity','行业沙龙与峰会':'service-hubs.html?category=salon#activity',
    '专业人才输送':'service-hubs.html?service=talent-demand#talent','双向人员交流或实习':'service-hubs.html?service=exchange-internship#talent','外部专家资源库':'service-hubs.html?service=expert-pool#talent'
  };
  function bind(){
    document.querySelectorAll('.mega-col').forEach(col=>{const h=col.querySelector('h3'),name=h?.textContent.trim();if(!homes[name]||h.dataset.homeBound)return;h.dataset.homeBound='1';h.style.cursor='pointer';h.title='进入'+name+'首页';h.onclick=()=>location.href=homes[name]});
    document.querySelectorAll('[data-mega-name],[data-map-name]').forEach(b=>{const name=b.dataset.megaName||b.dataset.mapName,route=routes[name];if(route){if(b.dataset.megaName)b.dataset.megaLink=route;if(b.dataset.mapName)b.dataset.mapLink=route;b.classList.add('live')}});
    document.querySelectorAll('.directory-table tbody tr,.category .service').forEach(card=>{const name=card.querySelector('.directory-name,h3')?.textContent.trim(),route=routes[name];if(!route)return;card.querySelectorAll('[data-link]').forEach(button=>button.dataset.link=route)});
  }
  bind();new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});
})();
