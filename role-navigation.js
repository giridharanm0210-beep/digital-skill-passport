(() => {
  const originalEnter = window.enterApp;
  const originalLogout = window.logout;
  const originalSelectRole = window.selectRole;
  window.selectRole = function(el, role) { window.DSP_SELECTED_ROLE = role; return originalSelectRole ? originalSelectRole(el, role) : undefined; };

  function addTab(nav, label, target, active = false) {
    const b = document.createElement('button');
    b.textContent = label;
    b.dataset.target = target;
    b.onclick = () => window.show(target, b);
    if (active) b.classList.add('active');
    nav.appendChild(b);
  }

  function ensureEmployerProfile() {
    if (document.getElementById('employer-profile')) return;
    const main = document.querySelector('main');
    const section = document.createElement('section');
    section.className = 'screen hidden';
    section.id = 'employer-profile';
    section.innerHTML = `
      <h1>Employer Profile</h1>
      <p class="muted">Manage your organization identity, hiring preferences and verification details.</p>
      <div class="card profile">
        <div class="avatar">AC</div>
        <div><h2 style="margin:0 0 4px">Acme Careers</h2><div class="muted">Technology employer • Bengaluru</div></div>
        <span class="chip" style="margin-left:auto">✓ Verified employer</span>
      </div>
      <div class="grid grid-2" style="margin-top:18px">
        <div class="card"><h3>Company details</h3><p><b>Industry:</b> Technology</p><p><b>Hiring type:</b> Internships & entry-level</p><p><b>Location:</b> Bengaluru</p></div>
        <div class="card"><h3>Hiring focus</h3><div class="chips"><span class="chip">Frontend Development</span><span class="chip">Data Analytics</span><span class="chip">Software Engineering</span></div></div>
      </div>
      <div class="card" style="margin-top:18px"><h3>Recruitment preferences</h3><div class="timeline"><p><b>Verified skills</b><br><span class="muted">Prioritize candidates with verified skills.</span></p><p><b>Credential evidence</b><br><span class="muted">Review institution-issued credentials.</span></p><p><b>Opportunity matching</b><br><span class="muted">Match candidates to open roles by skill.</span></p></div></div>`;
    main.appendChild(section);
  }

  function ensureCandidateProfile() {
    if (document.getElementById('candidate-profile')) return;
    const main = document.querySelector('main');
    const section = document.createElement('section');
    section.className = 'screen hidden';
    section.id = 'candidate-profile';
    section.innerHTML = `
      <h1>Candidate Profile</h1>
      <p class="muted">A candidate view available to employers after selecting a talent result.</p>
      <div class="card profile"><div class="avatar">AS</div><div><h2 style="margin:0 0 4px">Aarav Sharma</h2><div class="muted">Frontend Developer • 2 years experience</div></div></div>
      <div class="grid grid-2" style="margin-top:18px">
        <div class="card"><h3>Verified skills</h3><div class="chips"><span class="chip">React</span><span class="chip">JavaScript</span><span class="chip">SQL</span><span class="chip">Git</span></div></div>
        <div class="card"><h3>Career readiness</h3><div class="stat">82%</div><div class="muted">Current role readiness</div></div>
      </div>
      <div class="card" style="margin-top:18px"><h3>Credentials & evidence</h3><p>Frontend Development <span class="chip">✓ Verified</span></p><p>Git & Collaboration <span class="chip">✓ Verified</span></p></div>`;
    main.appendChild(section);
  }

  function ensureInstitutionSections() {
    const main = document.querySelector('main');
    if (!main) return;
    if (!document.getElementById('institution-issue')) {
      const s = document.createElement('section'); s.className='screen hidden'; s.id='institution-issue';
      s.innerHTML=`<h1>Issue Credentials</h1><p class="muted">Issue verified achievements that students can carry in their Digital Skill Passport.</p><div class="card"><h3>Credential details</h3><input placeholder="Student name" value="Aarav Sharma"><input placeholder="Credential title" value="Frontend Development"><select><option>Course completion</option><option>Internship verification</option><option>Project endorsement</option></select><button class="btn gold" onclick="issueCredential()">Issue credential</button></div>`;
      main.appendChild(s);
    }
    if (!document.getElementById('institution-impact')) {
      const s = document.createElement('section'); s.className='screen hidden'; s.id='institution-impact';
      s.innerHTML=`<h1>Impact & SDGs</h1><p class="muted">Track how verified skills and credentials contribute to student employability and sustainable development.</p><div class="grid"><div class="card"><div class="stat">1,240</div><div class="muted">Students onboarded</div></div><div class="card"><div class="stat">3,410</div><div class="muted">Credentials issued</div></div><div class="card"><div class="stat">76%</div><div class="muted">Average employability score</div></div></div>`;
      main.appendChild(s);
    }
  }

  function configureRoleNavigation() {
    const nav = document.querySelector('nav');
    if (!nav) return;
    const role = window.DSP_SELECTED_ROLE || 'student';
    nav.innerHTML = '';
    if (role === 'student') {
      addTab(nav, 'Dashboard', 'dashboard', true);
      addTab(nav, 'My Profile', 'profile');
      addTab(nav, 'Resume Check', 'resume');
      addTab(nav, 'Skill Gap', 'gap');
      addTab(nav, 'Opportunities', 'opps');
    } else if (role === 'employer') {
      ensureEmployerProfile(); ensureCandidateProfile();
      addTab(nav, 'Talent Search', 'employer', true);
      addTab(nav, 'Employer Profile', 'employer-profile');
      addTab(nav, 'Candidate Profile', 'candidate-profile');
    } else {
      ensureInstitutionSections();
      addTab(nav, 'Overview', 'institution', true);
      addTab(nav, 'Issue Credentials', 'institution-issue');
      addTab(nav, 'Impact & SDGs', 'institution-impact');
    }
  }

  window.enterApp = async function () {
    const result = originalEnter ? await originalEnter() : undefined;
    configureRoleNavigation();
    return result;
  };

  window.showRoleArea = function () { configureRoleNavigation(); };

  window.logout = function () {
    if (originalLogout) originalLogout();
    const nav = document.querySelector('nav');
    if (nav) nav.innerHTML = '';
  };
})();
