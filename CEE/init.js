//load all the stuff
(function(){
  const scriptEl = document.currentScript || Array.from(document.getElementsByTagName('script')).find(s=>s.src && s.src.indexOf('init.js')!==-1);
  const base = (scriptEl && scriptEl.src) ? new URL('.', scriptEl.src).href : new URL('.', location.href).href;

  try{
    const styleHref = new URL('styles.css', base).href;
    const already = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some(l=>{
      try{ return new URL(l.href, location.href).href === styleHref }catch(e){return false}
    });
    if(!already){
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = styleHref;
      document.head.appendChild(link);
    }
  }catch(e){ console.warn('init.js: failed to inject stylesheet', e) }

  try{
    const scriptHref = new URL('script.js', base).href;
    const exists = Array.from(document.getElementsByTagName('script')).some(s=>s.src && s.src === scriptHref);
    if(!exists){
      const s = document.createElement('script');
      s.src = scriptHref;
      s.defer = false;
      s.setAttribute('data-loaded-by','init.js');
      document.body.appendChild(s);
    }
  }catch(e){ console.warn('init.js: failed to load script.js', e) }

})();

(async function(){
  try{
    const scriptEl = document.currentScript || Array.from(document.getElementsByTagName('script')).find(s=>s.src && s.src.indexOf('init.js')!==-1);
    const base = (scriptEl && scriptEl.src) ? new URL('.', scriptEl.src).href : new URL('.', location.href).href;

    let defaults = { navTitle: null, headerExtra: null };
    try{
      const resp = await fetch(new URL('site-config.json', base).href, {cache: 'no-cache'});
      if(resp.ok){
        const cfg = await resp.json();
        defaults = Object.assign(defaults, cfg || {});
      }
    }catch(e){ /* ignore missing or parse errors */ }

  const perPageScript = document.querySelector('script[data-header-text], script[data-nav-title]');
  const headerText = perPageScript ? (perPageScript.getAttribute('data-header-text') ?? defaults.headerExtra) : (scriptEl ? (scriptEl.getAttribute('data-header-text') ?? defaults.headerExtra) : defaults.headerExtra);
  const navTitle = perPageScript ? (perPageScript.getAttribute('data-nav-title') ?? defaults.navTitle) : (scriptEl ? (scriptEl.getAttribute('data-nav-title') ?? defaults.navTitle) : defaults.navTitle);
    if(!headerText && !navTitle) return;

    function setLeft(){
      if(!navTitle) return false;
      const left = document.querySelector('.site-title');
      if(left){ left.textContent = navTitle; return true; }
      return false;
    }

    function setCenter(){
      const text = headerText || navTitle || null;
      if(!text) return false;
      Array.from(document.querySelectorAll('.header-extra-text')).forEach(n=>n.remove());
      const placeholder = document.querySelector('.topbar .placeholder-center');
      if(placeholder) placeholder.textContent = '';
      const center = document.querySelector('.topbar .topbar-center') || placeholder;
      if(center){ center.textContent = text; return true; }
      return false;
    }

    function setRight(){
      const text = defaults.headerExtra || '';
      const right = document.querySelector('.topbar .topbar-right');
      if(right){ right.textContent = text; return true; }
      return false;
    }

    function normalizeHeader(){
      const header = document.querySelector('header.site-header');
      if(!header) return false;

      Array.from(header.querySelectorAll('.header-extra-text')).forEach(n=>n.remove());

      const topbar = header.querySelector('.topbar');
      if(topbar){
        Array.from(topbar.childNodes).forEach(node=>{
          if(node.nodeType === Node.TEXT_NODE && node.textContent.trim()) node.textContent = '';
          if(node.nodeType === Node.ELEMENT_NODE){
            const cls = node.className || '';
            if(!cls.includes('topbar-left') && !cls.includes('topbar-center') && !cls.includes('topbar-right')){
              node.textContent = '';
            }
          }
        });
      }


      if(navTitle){
        const left = header.querySelector('.site-title');
        if(left) left.textContent = navTitle;
      }


      if(headerText){
        const centerEl = header.querySelector('.topbar .topbar-center') || header.querySelector('.topbar .placeholder-center');
        if(centerEl) centerEl.textContent = headerText;
      } else {

        const centerEl = header.querySelector('.topbar .topbar-center') || header.querySelector('.topbar .placeholder-center');
        if(centerEl) centerEl.textContent = '';
      }
      const rightEl = header.querySelector('.topbar .topbar-right');
      if(rightEl){ rightEl.textContent = defaults.headerExtra || ''; }

      return true;
    }

    if(!normalizeHeader()){
      const headerObs = new MutationObserver((m, o)=>{ if(normalizeHeader()) o.disconnect(); });
      headerObs.observe(document.documentElement || document.body, {childList:true, subtree:true});
    }

  }catch(e){ console.warn('init.js: failed to apply header/nav defaults', e) }
})();
