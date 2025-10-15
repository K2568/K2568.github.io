// init.js — small bootloader to ensure CSS and main script are loaded from the CEE root
(function(){
  const scriptEl = document.currentScript || Array.from(document.getElementsByTagName('script')).find(s=>s.src && s.src.indexOf('init.js')!==-1);
  const base = (scriptEl && scriptEl.src) ? new URL('.', scriptEl.src).href : new URL('.', location.href).href;

  // ensure styles.css is present
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

  // ensure script.js is present (load it dynamically)
  try{
    const scriptHref = new URL('script.js', base).href;
    const exists = Array.from(document.getElementsByTagName('script')).some(s=>s.src && s.src === scriptHref);
    if(!exists){
      const s = document.createElement('script');
      s.src = scriptHref;
      s.defer = false; // execute as soon as it's loaded
      s.setAttribute('data-loaded-by','init.js');
      document.body.appendChild(s);
    }
  }catch(e){ console.warn('init.js: failed to load script.js', e) }

})();

// Append optional header text / nav title configured via site-config.json or data attributes
(async function(){
  try{
    const scriptEl = document.currentScript || Array.from(document.getElementsByTagName('script')).find(s=>s.src && s.src.indexOf('init.js')!==-1);
    const base = (scriptEl && scriptEl.src) ? new URL('.', scriptEl.src).href : new URL('.', location.href).href;

    // fetch site defaults (optional)
    let defaults = { navTitle: null, headerExtra: null };
    try{
      const resp = await fetch(new URL('site-config.json', base).href, {cache: 'no-cache'});
      if(resp.ok){
        const cfg = await resp.json();
        defaults = Object.assign(defaults, cfg || {});
      }
    }catch(e){ /* ignore missing or parse errors */ }

    // data-attributes override defaults
    const headerText = scriptEl ? (scriptEl.getAttribute('data-header-text') ?? defaults.headerExtra) : defaults.headerExtra;
    const navTitle = scriptEl ? (scriptEl.getAttribute('data-nav-title') ?? defaults.navTitle) : defaults.navTitle;
    if(!headerText && !navTitle) return; // nothing to apply

    function appendToHeader(){
      // Prefer existing placeholder-center, otherwise append to topbar
      const placeholder = document.querySelector('.topbar .placeholder-center');
      if(placeholder){
        const span = document.createElement('span');
        span.className = 'header-extra-text';
        span.textContent = headerText;
        span.style.marginLeft = '12px';
        placeholder.insertAdjacentElement('afterend', span);
        return true;
      }

      const topbar = document.querySelector('.topbar');
      if(topbar){
        const span = document.createElement('span');
        span.className = 'header-extra-text';
        span.textContent = headerText;
        span.style.marginLeft = '12px';
        topbar.appendChild(span);
        return true;
      }
      return false;
    }

    if(headerText){
      if(!appendToHeader()){
        // header may be injected later by script.js — observe DOM and append when header appears
        const obs = new MutationObserver((mutations, observer)=>{
          if(appendToHeader()) observer.disconnect();
        });
        obs.observe(document.documentElement || document.body, {childList:true, subtree:true});
      }
    }

    // if navTitle provided, set .site-title when available
    if(navTitle){
      function setNavTitle(){
        const el = document.querySelector('.site-title');
        if(el){ el.textContent = navTitle; return true; }
        return false;
      }
      if(!setNavTitle()){
        const obs2 = new MutationObserver((mutations, observer)=>{
          if(setNavTitle()) observer.disconnect();
        });
        obs2.observe(document.documentElement || document.body, {childList:true, subtree:true});
      }
    }

  }catch(e){ console.warn('init.js: failed to apply header/nav defaults', e) }
})();
