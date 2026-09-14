(()=>{
  const initial=location.hash.includes('talent')?'talent':location.hash.includes('activity')?'activity':'';
  window.addEventListener('hashchange',()=>{
    const next=location.hash.includes('talent')?'talent':location.hash.includes('activity')?'activity':'';
    if(next&&initial&&next!==initial)location.reload();
  });
})();
