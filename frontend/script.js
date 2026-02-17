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

  const path = window.location.pathname.toLowerCase();
  const resolveRole = ()=>{
    if (path.includes('student-')) return 'student';
    if (path.includes('employer-')) return 'employer';
    if (path.includes('admin-')) return 'admin';
    return null;
  };
  const role = resolveRole();
  const storageKey = role ? `experitrust_profile_${role}` : null;
  const dashboardRoutes = {
    student: 'student-dashboard.html',
    employer: 'employer-dashboard.html',
    admin: 'admin-dashboard.html'
  };
  const goToDashboard = ()=>{
    const target = role ? dashboardRoutes[role] : null;
    if (target) window.location.href = target;
  };

  const readProfile = ()=>{
    if (!storageKey) return null;
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  };

  const getInitials = (value, fallback)=>{
    const words = String(value || '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return fallback;
    if (words.length === 1) return words[0].slice(0,2).toUpperCase();
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  };

  const applyCircle = (node, initials, photo)=>{
    if (!node) return;
    node.textContent = initials;
    if (photo) {
      node.style.backgroundImage = `url(${photo})`;
      node.classList.add('has-photo');
    } else {
      node.style.backgroundImage = '';
      node.classList.remove('has-photo');
    }
  };

  const headerCircle = document.querySelector('.dash-user .employer-initials');
  const settingsCircle = document.querySelector('.settings-avatar');
  const settingsNameNode = document.querySelector('.settings-head h1, .settings-head p');
  const settingsEmailNode = document.querySelector('.settings-email');

  const restoreProfileUI = (profile)=>{
    if (!profile) return;
    const initials = getInitials(profile.name, (settingsCircle?.textContent || headerCircle?.textContent || '').trim());
    applyCircle(headerCircle, initials, profile.photo);
    applyCircle(settingsCircle, initials, profile.photo);
    if (settingsNameNode && profile.name) settingsNameNode.textContent = profile.name;
    if (settingsEmailNode && profile.email) settingsEmailNode.textContent = profile.email;
  };

  const savedProfile = readProfile();
  if (savedProfile) restoreProfileUI(savedProfile);

  const settingsForm = document.querySelector('.settings-form');
  if (settingsForm && storageKey) {
    const fullNameInput = settingsForm.querySelector('input[type="text"]');
    const emailInput = settingsForm.querySelector('input[type="email"]');
    const allInputs = Array.from(settingsForm.querySelectorAll('input[type="text"], input[type="email"]'));
    const cancelBtn = settingsForm.querySelector('.settings-cancel');
    const photoLink = document.querySelector('.settings-photo-link');
    const message = document.querySelector('.settings-message');

    const originalValues = {};
    allInputs.forEach((input)=>{
      originalValues[input.id] = input.value;
    });

    if (savedProfile) {
      allInputs.forEach((input)=>{
        if (savedProfile.fields && Object.prototype.hasOwnProperty.call(savedProfile.fields, input.id)) {
          input.value = savedProfile.fields[input.id];
        }
      });
      if (fullNameInput && savedProfile.name) fullNameInput.value = savedProfile.name;
      if (emailInput && savedProfile.email) emailInput.value = savedProfile.email;
    }

    const photoInput = document.createElement('input');
    photoInput.type = 'file';
    photoInput.accept = 'image/*';
    photoInput.hidden = true;
    settingsForm.appendChild(photoInput);

    let currentPhoto = savedProfile?.photo || null;

    const getProfileFromForm = ()=>{
      const name = fullNameInput ? fullNameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const initialsFallback = (settingsCircle?.textContent || headerCircle?.textContent || 'ET').trim();
      return {
        name,
        email,
        initials: getInitials(name, initialsFallback),
        photo: currentPhoto,
        fields: allInputs.reduce((acc, input)=>{
          acc[input.id] = input.value;
          return acc;
        }, {})
      };
    };

    const setMessage = (text)=>{
      if (!message) return;
      message.textContent = text;
      if (text) {
        setTimeout(()=>{
          if (message.textContent === text) message.textContent = '';
        }, 1800);
      }
    };

    const renderLive = ()=>{
      const profile = getProfileFromForm();
      restoreProfileUI(profile);
    };

    allInputs.forEach((input)=>{
      input.addEventListener('input', renderLive);
    });

    if (photoLink) {
      photoLink.addEventListener('click',(e)=>{
        e.preventDefault();
        photoInput.click();
      });
    }

    photoInput.addEventListener('change',()=>{
      const file = photoInput.files && photoInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ()=>{
        currentPhoto = String(reader.result || '');
        renderLive();
      };
      reader.readAsDataURL(file);
    });

    settingsForm.addEventListener('submit',(e)=>{
      e.preventDefault();
      const profile = getProfileFromForm();
      localStorage.setItem(storageKey, JSON.stringify(profile));
      setMessage('Changes saved');
      goToDashboard();
    });

    if (cancelBtn) {
      cancelBtn.addEventListener('click',()=>{
        allInputs.forEach((input)=>{
          const value = savedProfile?.fields && Object.prototype.hasOwnProperty.call(savedProfile.fields, input.id) ?
            savedProfile.fields[input.id] :
            originalValues[input.id];
          input.value = value || '';
        });
        currentPhoto = savedProfile?.photo || null;
        renderLive();
        setMessage('Changes cancelled');
        goToDashboard();
      });
    }

    renderLive();
  }
});
