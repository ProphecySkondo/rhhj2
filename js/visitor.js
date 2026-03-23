// visitor.js
// Tracks visitors and syncs with the stars table.
// Runs once on page load, logs visit to Supabase.

const VISITOR_TABLE = 'visitors';

function getBrowserInfo() {
  const ua = navigator.userAgent;

  let browser = 'Unknown';
  if (/Edg\//.test(ua))            browser = 'Edge';
  else if (/OPR\//.test(ua))       browser = 'Opera';
  else if (/Chrome\//.test(ua))    browser = 'Chrome';
  else if (/Firefox\//.test(ua))   browser = 'Firefox';
  else if (/Safari\//.test(ua))    browser = 'Safari';

  let os = 'Unknown';
  if (/Windows/.test(ua))          os = 'Windows';
  else if (/iPhone|iPad/.test(ua)) os = 'iOS';
  else if (/Mac OS/.test(ua))      os = 'macOS';
  else if (/Android/.test(ua))     os = 'Android';
  else if (/Linux/.test(ua))       os = 'Linux';

  let device = 'Desktop';
  if (/iPhone/.test(ua))           device = 'iPhone';
  else if (/iPad/.test(ua))        device = 'iPad';
  else if (/Android/.test(ua))     device = 'Android';

  const referrer = document.referrer || 'Direct';

  return { browser, os, device, referrer };
}

async function getGeoInfo(ip) {
  try {
    const res  = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await res.json();
    return {
      country: data.country_name || 'Unknown',
      city:    data.city         || 'Unknown',
    };
  } catch {
    return { country: 'Unknown', city: 'Unknown' };
  }
}

async function logVisitor(ip, ageVerified = false) {
  if (!ip) return;

  const { browser, os, device, referrer } = getBrowserInfo();
  const { country, city }                 = await getGeoInfo(ip);

  const payload = {
    ip,
    country,
    city,
    browser,
    os,
    device,
    referrer,
    age_verified: ageVerified,
    visited_at:   new Date().toISOString(),
  };

  // Upsert — updates existing row if IP already visited
  await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/${VISITOR_TABLE}`, {
    method: 'POST',
    headers: {
      apikey:        CONFIG.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer:        'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(payload),
  });
}

async function markAgeVerified(ip) {
  if (!ip) return;
  await fetch(
    `${CONFIG.SUPABASE_URL}/rest/v1/${VISITOR_TABLE}?ip=eq.${encodeURIComponent(ip)}`,
    {
      method: 'PATCH',
      headers: {
        apikey:         CONFIG.SUPABASE_ANON_KEY,
        Authorization:  `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer:         'return=minimal',
      },
      body: JSON.stringify({ age_verified: true }),
    }
  );
}
