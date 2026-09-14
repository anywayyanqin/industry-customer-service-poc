(()=>{
  document.addEventListener('click',event=>{
    const links=[...document.querySelectorAll('.cs-crumb .cs-crumb-link')];
    if(links.length&&event.target.closest('.cs-crumb-link')===links[0]){
      event.preventDefault();event.stopImmediatePropagation();location.href='consulting-center.html';
    }
  },true);
})();
