// star.js
// Star counter — synced with Supabase.
// Shares _ip with visitor.js (set in main.js after IP fetch).

const STAR_TABLE = 'stars';

async function fetchStarCount() {
  const res = await fetch(
    `${CONFIG.SUPABASE_URL}/rest/v1/${STAR_TABLE}?select=ip`,
    {
      headers: {
        apikey:        CONFIG.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
        Prefer:        'count=exact',
      },
    }
  );
  const range = res.headers.get('content-range');
  if (range) return parseInt(range.split('/')[1], 10);
  const data = await res.json();
  return Array.isArray(data) ? data.length : 0;
}

async function checkIfStarred(ip) {
  if (!ip) return false;
  const res = await fetch(
    `${CONFIG.SUPABASE_URL}/rest/v1/${STAR_TABLE}?ip=eq.${encodeURIComponent(ip)}&select=ip`,
    {
      headers: {
        apikey:        CONFIG.SUPABASE_ANON_KEY,
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
      apikey:         CONFIG.SUPABASE_ANON_KEY,
      Authorization:  `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer:         'return=minimal',
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
        apikey:        CONFIG.SUPABASE_ANON_KEY,
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

let _starred = false;
let _count   = 0;

async function initStar(ip) {
  _count   = await fetchStarCount();
  _starred = await checkIfStarred(ip);
  setStarUI(_starred, _count);
}

async function toggleStar() {
  if (!window._ip) return;
  if (_starred) {
    await removeStar(window._ip);
    _starred = false;
    _count   = Math.max(0, _count - 1);
  } else {
    await addStar(window._ip);
    _starred = true;
    _count++;
  }
  setStarUI(_starred, _count);
}
