// Load header/nav/footer partials and reattach UI behaviors
(function(){
  // compute base URL from this script's location so relative partial paths resolve correctly
  const scriptEl = document.currentScript || Array.from(document.getElementsByTagName('script')).find(s=>s.src && s.src.indexOf('script.js')!==-1);
  const baseUrl = (scriptEl && scriptEl.src) ? new URL('.', scriptEl.src).href : new URL('.', location.href).href;

  // fetch combined layout to reduce round-trips
  (function fetchLayout(){
    const url = new URL('layout.html', baseUrl).href;
    fetch(url, {cache: 'no-cache'})
      .then(r=>{ if(!r.ok) throw new Error('Network response not ok'); return r.text(); })
      .then(html=>{
        // create a container and parse
        const tmp = document.createElement('div');
        tmp.innerHTML = html;

        const headerHtml = tmp.querySelector('header') ? tmp.querySelector('header').outerHTML : '';
        const navHtml = tmp.querySelector('nav') ? tmp.querySelector('nav').outerHTML : '';
        const footerHtml = tmp.querySelector('footer') ? tmp.querySelector('footer').outerHTML : '';

        // insert header
        if(headerHtml){
          const ph = document.getElementById('partial-header');
          if(ph) ph.innerHTML = headerHtml;
          else document.body.insertAdjacentHTML('afterbegin', headerHtml);
        }

        // insert nav
        if(navHtml){
          const pn = document.getElementById('partial-nav');
          const layoutEl = document.querySelector('.layout');
          if(pn) pn.innerHTML = navHtml;
          else if(layoutEl) layoutEl.insertAdjacentHTML('afterbegin', navHtml);
          else document.body.insertAdjacentHTML('afterbegin', navHtml);
          // after inserting nav, fix relative hrefs to point to CEE base
          try{
            const navContainer = document.getElementById('partial-nav') || document.querySelector('.layout nav') || document.querySelector('nav');
            if(navContainer){
              const anchors = Array.from(navContainer.querySelectorAll('a[href]'));
              const basePath = new URL(baseUrl).pathname || '/';
              const baseSeg = basePath.replace(/^\/+|\/+$/g, ''); // e.g. 'CEE'
              anchors.forEach(a=>{
                try{
                  const raw = a.getAttribute('href') || '';
                  // skip external, mailto, javascript, and fragment-only links
                  if(!raw || raw.startsWith('http:') || raw.startsWith('https:') || raw.startsWith('mailto:') || raw.startsWith('javascript:') || raw.startsWith('#')) return;
                  // resolved pathname from baseUrl
                  const resolvedPath = new URL(raw, baseUrl).pathname.replace(/^\/+/, ''); // e.g. 'CEE/content/option1.html' or 'content/option1.html'
                  let outPath = resolvedPath;
                  if(baseSeg && !outPath.startsWith(baseSeg + '/')){
                    outPath = baseSeg + '/' + outPath;
                  }
                  // set href to root-relative CEE path (leading slash)
                  a.setAttribute('href', '/' + outPath);
                }catch(e){/* ignore malformed hrefs */}
              });
            }
          }catch(e){/* ignore */}
        }

        // insert footer
        if(footerHtml){
          const pf = document.getElementById('partial-footer');
          if(pf) pf.innerHTML = footerHtml;
          else document.body.insertAdjacentHTML('beforeend', footerHtml);
        }

        // ensure overlay exists
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

    // Adjust overlay and sidebar positioning based on header height so they overlay content without shifting it
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
    // initial adjust and on resize
    adjustOverlayAndSidebar();
    window.addEventListener('resize', adjustOverlayAndSidebar);

    function openSidebar(){
      if(!sidebar || !overlay || !menuBtn) return;
      sidebar.classList.add('open');
      overlay.classList.add('show');
      overlay.setAttribute('aria-hidden','false');
      menuBtn.setAttribute('aria-expanded', 'true');
      const firstLink = sidebar.querySelector('.sidebar-link, .sidebar-toggle');
      if(firstLink) firstLink.focus();
    }
    function closeSidebar(){
      if(!sidebar || !overlay || !menuBtn) return;
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
      overlay.setAttribute('aria-hidden','true');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.focus();
    }
    function toggleSidebar(){
      if(!sidebar) return;
      if(sidebar.classList.contains('open')) closeSidebar();
      else openSidebar();
    }

    if(menuBtn) menuBtn.addEventListener('click', toggleSidebar);
    if(closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if(overlay) overlay.addEventListener('click', closeSidebar);

    // Escape to close
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
