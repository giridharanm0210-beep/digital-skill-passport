// Digital Skill Passport frontend API connection
window.DSP_API_BASE = 'https://digital-skill-passport-api.onrender.com';
window.dspApiHealth = async function () {
  const response = await fetch(window.DSP_API_BASE + '/api/health');
  if (!response.ok) throw new Error('API unavailable');
  return response.json();
};
