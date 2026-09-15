(() => {
  const API = 'https://digital-skill-passport-api.onrender.com';
  let session = null;
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
  window.enterApp = async function () {
    try {
      const data = await call('/api/auth/demo', { method:'POST', body:JSON.stringify({name:'Aarav Sharma',email:'aarav@example.com',role:selectedRole}) });
      session = data.token;
      toast('Backend connected');
    } catch (e) { console.warn(e); toast('Backend unavailable; demo mode'); }
    oldEnter();
  };
  window.logout = function () { session = null; oldLogout(); };
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
  call('/api/health').then(() => console.info('DSP API online')).catch(() => {});
})();
