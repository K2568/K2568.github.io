(function(){
  const menuBtn = document.getElementById('menuButton');
  const sidebar = document.getElementById('sidebar');
  const closeBtn = document.getElementById('closeSidebar');
  const overlay = document.getElementById('overlay');
  const toggles = Array.from(document.querySelectorAll('.sidebar-toggle'));

  function openSidebar(){
    sidebar.classList.add('open');
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden','false');
    menuBtn.setAttribute('aria-expanded', 'true');
    const firstLink = sidebar.querySelector('.sidebar-link, .sidebar-toggle');
    if(firstLink) firstLink.focus();
  }
  function closeSidebar(){
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden','true');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.focus();
  }

  function toggleSidebar(){
    if(sidebar.classList.contains('open')) closeSidebar();
    else openSidebar();
  }

  menuBtn.addEventListener('click', toggleSidebar);
  closeBtn.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);

   //make esc close bar
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && sidebar.classList.contains('open')) closeSidebar();
  });

  toggles.forEach(btn=>{
    const submenu = btn.nextElementSibling;
    btn.addEventListener('click', ()=>{
      const open = submenu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      submenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    });
  });

  //pull cee version from the repo
  (function fetchCeeVersion(){
    const el = document.querySelector('.cee-version');
    if(!el) return;
    const url = 'https://raw.githubusercontent.com/K2568/K2568.github.io/main/CEE/version.txt';
    fetch(url, {cache: 'no-cache'})
      .then(r=>{
        if(!r.ok) throw new Error('Network response not ok');
        return r.text();
      })
      .then(txt=>{
        const firstLine = txt.split(/\r?\n/)[0].trim();
        if(firstLine) el.textContent = `Up to date for CEE version: ${firstLine}`;
        else el.textContent = 'Up to date for CEE version: error';
      })
      .catch(err=>{
        el.textContent = 'Up to date for CEE version: error';
      })
  })();
})();
