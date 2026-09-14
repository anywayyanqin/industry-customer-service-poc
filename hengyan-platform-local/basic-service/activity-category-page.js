(()=>{
  if(!location.hash.includes('activity')||typeof activity==='undefined')return;
  const key=new URLSearchParams(location.search).get('category');
  const map={policy:{word:'政策',title:'政策直播活动',crumb:'政策直播'},research:{word:'调研',title:'行业调研活动',crumb:'行业调研'},salon:{word:'沙龙',title:'沙龙与峰会活动',crumb:'沙龙峰会'}};
  if(!map[key])return;
  const selected=activity.filter(x=>x.type.includes(map[key].word));activity.splice(0,activity.length,...selected);
  document.querySelector('#hero-title').textContent=map[key].title;
  document.querySelector('#hero-desc').textContent='分类展示'+map[key].title+'，仅呈现当前分类下的活动、详情及预约入口。';
  const crumb=document.querySelector('.crumb');
  if(crumb)crumb.innerHTML=`<button data-go="basic-service-home.html">基础服务</button><span>/</span><button data-go="service-hubs.html#activity">活动与调研</button><span>/</span><b id="crumb-name">${map[key].crumb}</b><button class="home" data-go="basic-service-home.html">← 返回基础服务首页</button>`;
})();
