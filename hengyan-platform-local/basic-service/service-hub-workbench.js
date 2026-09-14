(()=>{
  const main=document.querySelector('.work-main');if(!main)return;
  const style=document.createElement('style');style.textContent=`
    .activity-workbench,.ongoing-services{background:#fff;border:1px solid var(--line);border-radius:4px;padding:22px 25px;box-shadow:var(--shadow)}
    .work-section-head{display:flex;align-items:center;justify-content:space-between;padding-bottom:13px;border-bottom:1px solid var(--line)}
    .work-section-head h2{margin:0;font-size:20px;color:#193b63}.work-section-head span{font-size:12px;color:var(--muted)}
    .hub-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;align-items:center;padding:16px 0;border-bottom:1px solid #e8edf3}.hub-row:last-child{border:0}
    .hub-row small,.hub-row b,.hub-row span{display:block}.hub-row small{color:var(--blue)}.hub-row b{margin:4px 0;font-size:16px}.hub-row span{color:var(--muted);font-size:12px}
    .hub-row button{border:1px solid #b8c9df;background:#fff;color:var(--blue);padding:8px 12px;cursor:pointer}.hub-empty{color:var(--muted);padding:20px 0 2px}
    .ongoing-record{padding:19px 0;border-bottom:1px solid #e8edf3}.ongoing-record:last-child{border:0}.ongoing-record-top,.ongoing-record-foot{display:flex;align-items:center;justify-content:space-between;gap:14px}
    .ongoing-record h3{margin:5px 0 7px;font-size:17px}.ongoing-record p{margin:0;color:var(--muted);font-size:13px}.ongoing-record .status{padding:4px 9px;background:#eaf2ff;color:var(--blue);font-size:12px}
    .ongoing-record .notice{margin:14px 0;padding:10px 12px;background:#fff8e9;border:1px solid #f0dfb7;color:#8b641b}.ongoing-record-foot span{color:var(--muted);font-size:12px}.ongoing-record-foot button{border:0;background:transparent;color:var(--blue);cursor:pointer}
  `;document.head.append(style);

  const activityPanel=document.createElement('section');activityPanel.className='activity-workbench';
  const ongoingPanel=document.createElement('section');ongoingPanel.className='ongoing-services';
  main.prepend(ongoingPanel);main.prepend(activityPanel);
  function read(key){try{return JSON.parse(localStorage.getItem(key)||'[]')}catch{return[]}}
  function render(){
    const activities=read('basicServiceActivities');
    const talents=read('basicServiceTalent');
    activityPanel.innerHTML=`<div class="work-section-head"><h2>我的活动</h2><span>${activities.length} 项</span></div>${activities.length?activities.map(x=>`<article class="hub-row"><div><small>${x.type||'活动报名'}</small><b>${x.title}</b><span>${x.status}　·　${x.time}</span></div><button data-hub-open="activity-detail.html?id=${x.serviceId||'policy-live'}">查看活动</button></article>`).join(''):'<div class="hub-empty">暂无已报名或预约的活动。</div>'}`;
    const record=document.querySelector('#record'),feasibilityActive=record&&!record.hidden,total=talents.length+(feasibilityActive?1:0);
    ongoingPanel.innerHTML=`<div class="work-section-head"><h2>在办业务</h2><span>${total} 项</span></div>${talents.length?talents.map(x=>`<article class="ongoing-record"><div class="ongoing-record-top"><div><small>基础服务 · 人才服务</small><h3>${x.title}</h3><p>申请编号 ${x.id}</p></div><span class="status">${x.status}</span></div><div class="notice">申请已提交，服务人员将核对需求并开展资源对接。</div><div class="ongoing-record-foot"><span>提交时间：${x.time}</span><button data-hub-open="${x.url}">查看申请详情　›</button></div></article>`).join(''):''}${!total?'<div class="hub-empty">暂无在办业务。提交咨询或人才服务申请后，记录将在这里显示。</div>':''}`;
    if(record)ongoingPanel.appendChild(record);
    document.querySelectorAll('[data-hub-open]').forEach(b=>b.onclick=()=>location.href=b.dataset.hubOpen);
    const empty=document.querySelector('#empty-work');if(empty)empty.hidden=true;
  }
  const feasibilityRecord=document.querySelector('#record');if(feasibilityRecord)new MutationObserver(render).observe(feasibilityRecord,{attributes:true,attributeFilter:['hidden']});
  render();window.addEventListener('storage',render);window.addEventListener('focus',render);
})();
