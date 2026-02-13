document.addEventListener('DOMContentLoaded',function(){
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click',()=>{
      if(nav.style.display==='flex'){
        nav.style.display='none';
      } else {
        nav.style.display='flex';
        nav.style.flexDirection='column';
        nav.style.gap='12px';
        nav.style.background='white';
        nav.style.padding='12px';
        nav.style.position='absolute';
        nav.style.right='20px';
        nav.style.top='64px';
        nav.style.borderRadius='8px';
        nav.style.boxShadow='0 6px 20px rgba(2,6,23,.12)';
      }
    });
  }

  const roleTabs = document.querySelectorAll('.role-tab');
  if (roleTabs.length) {
    const setAuthTarget = ()=>{
      const active = document.querySelector('.role-tab.active');
      const role = active?.getAttribute('data-role') || 'student';
      document.querySelectorAll('.auth-submit').forEach((link)=>{
        const target = link.getAttribute(`data-target-${role}`);
        if (target) link.setAttribute('href', target);
      });
    };
    roleTabs.forEach((tab)=>{
      tab.addEventListener('click',()=>{
        roleTabs.forEach((btn)=>btn.classList.remove('active'));
        tab.classList.add('active');
        setAuthTarget();
      });
    });
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (roleParam) {
      const tab = document.querySelector(`.role-tab[data-role="${roleParam}"]`);
      if (tab) {
        roleTabs.forEach((btn)=>btn.classList.remove('active'));
        tab.classList.add('active');
      }
    }
    setAuthTarget();
  } else {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role') || 'student';
    document.querySelectorAll('.auth-submit').forEach((link)=>{
      const target = link.getAttribute(`data-target-${roleParam}`);
      if (target) link.setAttribute('href', target);
    });
  }

  const modalTriggers = document.querySelectorAll('[data-modal]');
  const modalClosers = document.querySelectorAll('[data-close]');
  modalTriggers.forEach((trigger)=>{
    trigger.addEventListener('click',()=>{
      const targetId = trigger.getAttribute('data-modal');
      const modal = document.getElementById(targetId);
      if (modal) modal.classList.add('active');
    });
  });
  modalClosers.forEach((closer)=>{
    closer.addEventListener('click',()=>{
      const modal = closer.closest('.modal-overlay');
      if (modal) modal.classList.remove('active');
    });
  });
  document.querySelectorAll('.modal-overlay').forEach((overlay)=>{
    overlay.addEventListener('click',(e)=>{
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });

  const dashTabs = document.querySelectorAll('.dash-tab[data-tab]');
  const dashSections = document.querySelectorAll('.dash-section[data-section]');
  if (dashTabs.length && dashSections.length) {
    const setActiveSection = (target)=>{
      dashSections.forEach((section)=>{
        const isActive = section.getAttribute('data-section') === target;
        section.classList.toggle('active', isActive);
        section.hidden = !isActive;
      });
    };
    const syncTabIcons = ()=>{
      dashTabs.forEach((t)=>{
        const icon = t.querySelector('.tab-icon');
        const normal = t.getAttribute('data-icon');
        const active = t.getAttribute('data-icon-active');
        if (icon && normal && active) {
          icon.src = t.classList.contains('active') ? active : normal;
        }
      });
    };
    syncTabIcons();
    const initial = document.querySelector('.dash-tab.active')?.getAttribute('data-tab') || dashTabs[0].getAttribute('data-tab');
    setActiveSection(initial);
    dashTabs.forEach((tab)=>{
      tab.addEventListener('click',()=>{
        const target = tab.getAttribute('data-tab');
        dashTabs.forEach((t)=>t.classList.remove('active'));
        tab.classList.add('active');
        syncTabIcons();
        setActiveSection(target);
      });
    });
  }

  const jobSearch = document.querySelector('.job-search');
  if (jobSearch) {
    jobSearch.addEventListener('input',()=>{
      const query = jobSearch.value.trim().toLowerCase();
      document.querySelectorAll('[data-job]').forEach((card)=>{
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }

  const studentSearch = document.querySelector('[data-section="students"] .job-search');
  if (studentSearch) {
    studentSearch.addEventListener('input',()=>{
      const query = studentSearch.value.trim().toLowerCase();
      document.querySelectorAll('[data-section="students"] .student-card').forEach((card)=>{
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }
});
