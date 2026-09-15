(() => {
  const API = 'https://digital-skill-passport-api.onrender.com';
  let session = null;
  window.DSP_USER = window.DSP_USER || {};

  async function call(path, options = {}) {
    const headers = new Headers(options.headers || {});
    if (session) headers.set('Authorization', 'Bearer ' + session);
    if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
    const r = await fetch(API + path, { ...options, headers });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || 'API request failed');
    return data;
  }

  const oldEnter = window.enterApp;
  const oldLogout = window.logout;
  const oldAnalyze = window.analyzeResume;
  const oldGap = window.renderGap;

  function addNameField() {
    const setup = document.getElementById('roleSetup');
    if (!setup || document.getElementById('loginName')) return;
    const panel = setup.querySelector('.login');
    if (!panel) return;
    const roles = panel.querySelector('.roles');
    const wrap = document.createElement('div');
    wrap.style.cssText = 'margin:18px 0 14px;text-align:left';
    wrap.innerHTML = '<label for="loginName"><b>Your name</b></label><input id="loginName" type="text" placeholder="Enter your full name" autocomplete="name" style="width:100%;margin-top:8px;box-sizing:border-box">';
    if (roles) panel.insertBefore(wrap, roles); else panel.appendChild(wrap);
  }

  function applyUserName(name) {
    const safeName = name || 'User';
    const initials = safeName.split(/\s+/).filter(Boolean).slice(0,2).map(x => x[0]).join('').toUpperCase();
    document.querySelectorAll('.profile .avatar, .passport .avatar').forEach(el => el.textContent = initials || 'U');
    document.querySelectorAll('.profile h2, .profile b').forEach(el => {
      if (/Aarav Sharma|User/i.test(el.textContent.trim())) el.textContent = safeName;
    });
    document.title = `${safeName} — Digital Skill Passport`;
    const dashboard = document.getElementById('dashboard');
    if (dashboard) dashboard.querySelectorAll('.passport b').forEach(el => el.textContent = safeName);
  }

  window.enterApp = async function () {
    addNameField();
    const name = (document.getElementById('loginName')?.value || '').trim();
    if (!name) { toast('Enter your name to continue'); document.getElementById('loginName')?.focus(); return; }
    window.DSP_USER.name = name;
    try {
      const email = `${name.toLowerCase().replace(/[^a-z0-9]+/g,'.').replace(/^\.|\.$/g,'') || 'user'}@example.com`;
      const data = await call('/api/auth/demo', { method:'POST', body:JSON.stringify({name,email,role:selectedRole}) });
      session = data.token;
      window.DSP_USER = data.user || {name, email, role:selectedRole};
      toast('Welcome, ' + window.DSP_USER.name);
    } catch (e) { console.warn(e); toast('Backend unavailable; demo mode'); }
    oldEnter();
    applyUserName(window.DSP_USER.name);
  };

  window.logout = function () { session = null; window.DSP_USER = {}; oldLogout(); };

  window.analyzeResume = async function () {
    const file = document.getElementById('resumeFile')?.files?.[0];
    if (file && session) {
      try {
        const form = new FormData(); form.append('resume', file);
        await call('/api/resumes', {method:'POST', body:form});
        toast('Resume received by backend');
      } catch (e) { console.warn(e); }
    }
    oldAnalyze();
  };

  window.renderGap = async function () {
    if (!session) return oldGap();
    try {
      const role = document.getElementById('gapRole')?.value || 'Frontend Developer';
      const data = await call('/api/skill-gap', {method:'POST', body:JSON.stringify({role})});
      const c = document.getElementById('gapContent');
      if (c && data.gaps) c.innerHTML = data.gaps.map(g => `<div class="card"><h3>${g.skill}</h3><div class="muted">Current ${g.current}% · Target ${g.target}%</div><div class="bar" style="margin-top:12px"><div class="fill" style="width:${g.current}%"></div></div><p class="muted">Target: ${g.target}%</p></div>`).join('');
    } catch (e) { console.warn(e); oldGap(); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addNameField);
  else addNameField();
  call('/api/health').then(() => console.info('DSP API online')).catch(() => {});
})();
