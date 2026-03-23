// star.js
// Handles the star counter using Supabase as the backend.
// Table required:
//   create table stars (
//     ip text primary key,
//     created_at timestamp default now()
//   );

const STAR_TABLE = 'stars';

async function getVisitorIP() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch {
    return null;
  }
}

async function fetchStarCount() {
  const res = await fetch(
    `${CONFIG.SUPABASE_URL}/rest/v1/${STAR_TABLE}?select=ip`,
    {
      headers: {
        apikey: CONFIG.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'count=exact',
      },
    }
  );
  const count = res.headers.get('content-range');
  // content-range format: 0-N/TOTAL
  if (count) return parseInt(count.split('/')[1], 10);
  const data = await res.json();
  return Array.isArray(data) ? data.length : 0;
}

async function checkIfStarred(ip) {
  if (!ip) return false;
  const res = await fetch(
    `${CONFIG.SUPABASE_URL}/rest/v1/${STAR_TABLE}?ip=eq.${encodeURIComponent(ip)}&select=ip`,
    {
      headers: {
        apikey: CONFIG.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
      },
    }
  );
  const data = await res.json();
  return Array.isArray(data) && data.length > 0;
}

async function addStar(ip) {
  await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/${STAR_TABLE}`, {
    method: 'POST',
    headers: {
      apikey: CONFIG.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ ip }),
  });
}

async function removeStar(ip) {
  await fetch(
    `${CONFIG.SUPABASE_URL}/rest/v1/${STAR_TABLE}?ip=eq.${encodeURIComponent(ip)}`,
    {
      method: 'DELETE',
      headers: {
        apikey: CONFIG.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
      },
    }
  );
}

function setStarUI(starred, count) {
  const widget = document.getElementById('star-widget');
  document.getElementById('star-icon').textContent  = starred ? '★' : '☆';
  document.getElementById('star-count').textContent = count.toLocaleString();
  starred ? widget.classList.add('starred') : widget.classList.remove('starred');
}

let _ip = null;
let _starred = false;
let _count = 0;

async function initStar() {
  _ip      = await getVisitorIP();
  _count   = await fetchStarCount();
  _starred = await checkIfStarred(_ip);
  setStarUI(_starred, _count);
}

async function toggleStar() {
  if (!_ip) return;
  if (_starred) {
    await removeStar(_ip);
    _starred = false;
    _count   = Math.max(0, _count - 1);
  } else {
    await addStar(_ip);
    _starred = true;
    _count++;
  }
  setStarUI(_starred, _count);
}
