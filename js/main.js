// main.js

function enterSite() {
  document.getElementById('age-gate').style.display = 'none';
  document.getElementById('site-content').style.display = 'block';
  sessionStorage.setItem('jhost_v', '1');
  initStar();
}

function declineSite() {
  document.getElementById('gate-btns').style.display = 'none';
  document.getElementById('gate-declined').style.display = 'block';
}

// Skip gate if already verified this session
if (sessionStorage.getItem('jhost_v') === '1') {
  document.getElementById('age-gate').style.display = 'none';
  document.getElementById('site-content').style.display = 'block';
  initStar();
}
