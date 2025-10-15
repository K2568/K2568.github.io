(function(){
  const scriptEl = document.currentScript || Array.from(document.getElementsByTagName('script')).find(s=>s.src && s.src.indexOf('script.js')!==-1);
  const baseUrl = (scriptEl && scriptEl.src) ? new URL('.', scriptEl.src).href : new URL('.', location.href).href;

  (function fetchLayout(){
    const url = new URL('layout.html', baseUrl).href;
    fetch(url, {cache: 'no-cache'})
      .then(r=>{ if(!r.ok) throw new Error('Network response not ok'); return r.text(); })
      .then(html=>{

        const tmp = document.createElement('div');
        tmp.innerHTML = html;

        const headerHtml = tmp.querySelector('header') ? tmp.querySelector('header').outerHTML : '';
        const navHtml = tmp.querySelector('nav') ? tmp.querySelector('nav').outerHTML : '';
        const footerHtml = tmp.querySelector('footer') ? tmp.querySelector('footer').outerHTML : '';

        if(headerHtml){
          const ph = document.getElementById('partial-header');
          if(ph) ph.innerHTML = headerHtml;
          else document.body.insertAdjacentHTML('afterbegin', headerHtml);
        }

        if(navHtml){
          const pn = document.getElementById('partial-nav');
          const layoutEl = document.querySelector('.layout');
          if(pn) pn.innerHTML = navHtml;
          else if(layoutEl) layoutEl.insertAdjacentHTML('afterbegin', navHtml);
          else document.body.insertAdjacentHTML('afterbegin', navHtml);

          try{
            const navContainer = document.getElementById('partial-nav') || document.querySelector('.layout nav') || document.querySelector('nav');
            if(navContainer){
              const anchors = Array.from(navContainer.querySelectorAll('a[href]'));
              const basePath = new URL(baseUrl).pathname || '/';
              const baseSeg = basePath.replace(/^\/+|\/+$/g, '');
              anchors.forEach(a=>{
                try{
                  const raw = a.getAttribute('href') || '';

                  if(!raw || raw.startsWith('http:') || raw.startsWith('https:') || raw.startsWith('mailto:') || raw.startsWith('javascript:') || raw.startsWith('#')) return;

                  const resolvedPath = new URL(raw, baseUrl).pathname.replace(/^\/+/, '');
                  let outPath = resolvedPath;
                  if(baseSeg && !outPath.startsWith(baseSeg + '/')){
                    outPath = baseSeg + '/' + outPath;
                  }

                  a.setAttribute('href', '/' + outPath);
                }catch(e){/* ignore malformed hrefs */}
              });
            }
          }catch(e){/* ignore */}
        }

        if(footerHtml){
          const pf = document.getElementById('partial-footer');
          if(pf) pf.innerHTML = footerHtml;
          else document.body.insertAdjacentHTML('beforeend', footerHtml);
        }

        if(!document.getElementById('overlay')){
          const ov = document.createElement('div');
          ov.className = 'overlay';
          ov.id = 'overlay';
          ov.tabIndex = -1;
          ov.setAttribute('aria-hidden','true');
          document.body.appendChild(ov);
        }

      })
      .then(initUI)
      .catch(err=>{
        console.error('Failed loading layout', err);
        initUI();
      });
  })();

  function initUI(){
  const menuBtn = document.getElementById('menuButton');
  const sidebar = document.getElementById('sidebar');
  const closeBtn = document.getElementById('closeSidebar');
  const overlay = document.getElementById('overlay');
    const toggles = Array.from(document.querySelectorAll('.sidebar-toggle'));

  if(window.__CEEDEBUG) console.log('initUI elements:', {menuBtn, sidebar, closeBtn, overlay});

    function adjustOverlayAndSidebar(){
      try{
        const header = document.querySelector('header.site-header');
        const top = header ? header.getBoundingClientRect().height : 0;
        if(sidebar){
          sidebar.style.top = top + 'px';
          sidebar.style.height = 'calc(100% - ' + top + 'px)';
        }
        if(overlay){
          overlay.style.top = top + 'px';
          overlay.style.height = 'calc(100% - ' + top + 'px)';
        }
      }catch(e){/* ignore layout calc errors */}
    }

    adjustOverlayAndSidebar();
    window.addEventListener('resize', adjustOverlayAndSidebar);

    function openSidebar(){
      if(!sidebar || !overlay) return;
      sidebar.classList.add('open');
      overlay.classList.add('show');
      overlay.setAttribute('aria-hidden','false');
      if(menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
      const firstLink = sidebar.querySelector('.sidebar-link, .sidebar-toggle');
      if(firstLink) firstLink.focus();
    }
    function closeSidebar(){
      if(!sidebar || !overlay) return;
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
      overlay.setAttribute('aria-hidden','true');
      if(menuBtn){ menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.focus(); }
    }
    function toggleSidebar(){
      if(!sidebar) return;
      if(sidebar.classList.contains('open')) closeSidebar();
      else openSidebar();
    }

  if(menuBtn) menuBtn.addEventListener('click', (e)=>{ if(window.__CEEDEBUG) console.log('menuBtn clicked'); toggleSidebar(e); });
    if(closeBtn) closeBtn.addEventListener('click', closeSidebar);
  if(overlay) overlay.addEventListener('click', closeSidebar);

    const delegatedHandler = (e)=>{
      try{
        const menuEl = e.target.closest ? e.target.closest('#menuButton') : null;
        const closeEl = e.target.closest ? e.target.closest('#closeSidebar') : null;
        const overlayEl = e.target.closest ? e.target.closest('.overlay') : null;
        if(menuEl){
          const _sidebar = document.getElementById('sidebar');
          const _overlay = document.getElementById('overlay');
          if(!_sidebar || !_overlay) return;
          const isOpen = _sidebar.classList.contains('open');
          if(isOpen){
            _sidebar.classList.remove('open');
            _overlay.classList.remove('show');
            _overlay.setAttribute('aria-hidden','true');
            menuEl.setAttribute('aria-expanded','false');
            menuEl.focus();
          }else{
            _sidebar.classList.add('open');
            _overlay.classList.add('show');
            _overlay.setAttribute('aria-hidden','false');
            menuEl.setAttribute('aria-expanded','true');
            const firstLink = _sidebar.querySelector('.sidebar-link, .sidebar-toggle');
            if(firstLink) firstLink.focus();
          }
          return;
        }
        if(closeEl || overlayEl){
          const _sidebar = document.getElementById('sidebar');
          const _overlay = document.getElementById('overlay');
          if(!_sidebar || !_overlay) return;
          _sidebar.classList.remove('open');
          _overlay.classList.remove('show');
          _overlay.setAttribute('aria-hidden','true');
          const btn = document.getElementById('menuButton');
          if(btn){ btn.setAttribute('aria-expanded','false'); btn.focus(); }
          return;
        }
      }catch(e){/* ignore delegation errors */}
    };
    // Attach once; use capture and pointer/touch events so inputs are caught early
    if(!window.__CEE_DELEGATED_ATTACHED){
      document.addEventListener('click', delegatedHandler, true);
      document.addEventListener('pointerdown', delegatedHandler, true);
      document.addEventListener('touchstart', delegatedHandler, {capture:true, passive:true});
      window.__CEE_DELEGATED_ATTACHED = true;
    }

    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) closeSidebar();
    });

    toggles.forEach(btn=>{
      const submenu = btn.nextElementSibling;
      if(!submenu) return;
      btn.addEventListener('click', ()=>{
        const open = submenu.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        submenu.setAttribute('aria-hidden', open ? 'false' : 'true');
      });
    });
  }

})();
