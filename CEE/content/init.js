// content/init.js wrapper — forward to root init.js while preserving data attributes
(function(){
  try{
    const me = document.currentScript || Array.from(document.getElementsByTagName('script')).find(s=>s.src && s.src.indexOf('/content/init.js')!==-1 || s.src && s.src.indexOf('content/init.js')!==-1);
    const rootPath = new URL('../init.js', location.href).href;
    // if root init already loaded, do nothing
    if(Array.from(document.getElementsByTagName('script')).some(s=>s.src === rootPath)) return;

    const s = document.createElement('script');
    s.src = rootPath;
    // forward common data attributes if present
    if(me){
      const nav = me.getAttribute('data-nav-title');
      const head = me.getAttribute('data-header-text');
      if(nav) s.setAttribute('data-nav-title', nav);
      if(head) s.setAttribute('data-header-text', head);
      if(me.defer) s.defer = true;
    }
    document.head.appendChild(s);
  }catch(e){ console.warn('content/init.js wrapper failed', e) }
})();
