/* album.js — mengisi daftar track di halaman utama dari TRACKS (tracks.js). */
document.querySelector('#albumList').innerHTML = TRACKS.map(t => `
  <li><a href="${t.href}">
    <span class="swatch theme-${t.id}"></span>
    <span><span class="t1">${t.kicker}</span><span class="t2">${t.title}</span></span>
  </a></li>`).join('');
