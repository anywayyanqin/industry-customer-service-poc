(()=>{
  const main=document.querySelector('.work-main');if(!main)return;
  const style=document.createElement('style');style.textContent='.course-panel{background:#fff;border:1px solid var(--line);border-radius:10px;padding:22px 25px;box-shadow:var(--shadow)}.course-head{display:flex;align-items:center;justify-content:space-between;padding-bottom:13px;border-bottom:1px solid var(--line)}.course-head h2{font-size:20px;margin:0}.course-head span{color:var(--muted);font-size:12px}.my-course{display:grid;grid-template-columns:1fr 180px;gap:18px;align-items:center;padding:17px 0;border-bottom:1px solid #e9eef4}.my-course:last-child{border-bottom:0}.my-course small,.my-course b,.my-course span{display:block}.my-course b{margin:5px 0}.my-course span{color:var(--muted);font-size:12px}.course-progress{height:5px;background:#e7edf4;margin:8px 0}.course-progress i{display:block;height:100%;background:var(--blue)}.course-actions{display:flex;justify-content:flex-end;gap:7px}.course-actions button{border:1px solid #b9cae0;background:#fff;color:var(--blue);padding:7px 10px;cursor:pointer}.course-actions .course-open{background:var(--blue);color:#fff;border-color:var(--blue)}.course-empty{padding:18px 0 2px;color:var(--muted)}';document.head.append(style);
  const panel=document.createElement('section');panel.className='course-panel';main.prepend(panel);const key='basicServiceCourses';
  const read=()=>{try{return JSON.parse(localStorage.getItem(key)||'[]')}catch{return[]}};
  function canonicalUrl(course){
    const progress=Number(course.progress||0);
    const chapterCounts={'hedge-accounting':6,'risk-foundation':6,'risk-exposure':5};
    if(chapterCounts[course.id]){
      const chapter=Math.min(chapterCounts[course.id],Math.max(1,Math.floor(progress/100*chapterCounts[course.id])+1));
      return 'training-center.html#lesson/'+course.id+'/'+chapter;
    }
    if(course.id==='derivative-cases'||course.title==='衍生品工具应用实例')return 'course-experience.html#derivative';
    return course.url||'training-center.html';
  }
  function render(){const list=read();panel.innerHTML=`<div class="course-head"><h2>我的课程</h2><span>${list.length} 门课程</span></div>${list.length?list.map(x=>`<article class="my-course"><div><small>${x.category||'培训课程'}</small><b>${x.title}</b><span>学习进度 ${x.progress||0}%　·　最近更新 ${x.updatedAt||'—'}</span><div class="course-progress"><i style="width:${x.progress||0}%"></i></div></div><div class="course-actions"><button class="course-open" data-course-open="${canonicalUrl(x)}">${x.progress?'继续学习':'开始学习'}</button><button data-course-remove="${x.id}">移出课程</button></div></article>`).join(''):'<div class="course-empty">暂无已加入课程。可前往培训课程中心选择课程。</div>'}`;panel.querySelectorAll('[data-course-open]').forEach(b=>b.onclick=()=>location.href=b.dataset.courseOpen);panel.querySelectorAll('[data-course-remove]').forEach(b=>b.onclick=()=>{localStorage.setItem(key,JSON.stringify(read().filter(x=>x.id!==b.dataset.courseRemove)));render()})}
  render();window.addEventListener('storage',render);window.addEventListener('focus',render);
})();
