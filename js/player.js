/* player.js — logika player di halaman cv/projects/about/contact.
   Halaman mana yang aktif dibaca dari data-track di #playerView; data lainnya dari TRACKS (tracks.js). */
const $ = s => document.querySelector(s);
const playerView = $('#playerView'), art = $('#art'), slot = $('#artSlot'), scrubEl = $('#scrub');
const idx = TRACKS.findIndex(t => t.id === playerView.dataset.track);
const track = TRACKS[idx];
let playing = false, elapsed = 0, timer = null;

/* ---------- 1) Progress & timer ---------- */
const fmt = s => { s = Math.max(0, Math.round(s)); return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; };
function updateProgressUI(){
  const pct = Math.min(100, elapsed / track.duration * 100);
  $('#fill').style.width = pct + '%'; $('#knob').style.left = pct + '%';
  $('#curTime').textContent = fmt(elapsed); $('#durTime').textContent = fmt(track.duration);
  scrubEl.setAttribute('aria-valuenow', Math.round(pct));
}
const setPlayIcon = () => $('#playIcon').innerHTML = playing ? '<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>' : '<path d="M8 5v14l12-7z"/>';

/* Pindah ke halaman track lain (wrap-around). Kalau sedang play, halaman tujuan otomatis lanjut play. */
function goTo(n){ 
  stopTimer(); 
  
  document.body.classList.add('spotify-out');
  
  setTimeout(() => {
    location.href = TRACKS[(n + TRACKS.length) % TRACKS.length].href + (playing ? '?autoplay=1' : ''); 
  }, 300);
}

function tick(){ elapsed += 0.25; if(elapsed >= track.duration){ goTo(idx + 1); return; } updateProgressUI(); }   // lagu habis -> lanjut ke halaman berikutnya
const startTimer = () => { clearInterval(timer); timer = setInterval(tick, 250); };
const stopTimer = () => clearInterval(timer);

/* ---------- 2) Zoom cover ----------
   Play -> kotak cover membesar sampai hampir layar penuh (konten muncul); pause -> kembali mengecil.
   Triknya: cover dipindah ke position:fixed di posisi yang sama, lalu geometri-nya dianimasikan. */
let zoomed = false, zTok = 0;
const setBox = r => { art.style.top = r.top+'px'; art.style.left = r.left+'px'; art.style.width = r.width+'px'; art.style.height = r.height+'px'; };
const clearBox = () => ['top','left','width','height'].forEach(k => art.style[k] = '');
const fullBox = () => ({ top:0, left:0, width:document.documentElement.clientWidth, height:document.documentElement.clientHeight });
function zoom(on){
  if(on === zoomed) return; zoomed = on; const tok = ++zTok;
  if(on){
    setBox(art.getBoundingClientRect()); art.classList.add('fixed'); void art.offsetWidth;
    art.classList.add('anim','zoomed'); setBox(fullBox());
  } else {
    art.classList.add('anim'); art.classList.remove('zoomed'); setBox(slot.getBoundingClientRect());
    setTimeout(() => { if(tok !== zTok) return; art.classList.remove('fixed','anim'); clearBox(); }, 600);
  }
}
addEventListener('resize', () => { if(zoomed){ art.classList.remove('anim'); setBox(fullBox()); } });

/* ---------- 3) Kontrol ---------- */
function setPlaying(on){ 
  playing = on; 
  setPlayIcon(); 
  
  if(on) {
    audioFile.play();
    startTimer();
  } else {
    audioFile.pause();
    stopTimer();
  }
  
  zoom(on); 
}
$('#playBtn').onclick = () => setPlaying(!playing);
$('#prev').onclick = () => goTo(idx - 1);
$('#next').onclick = () => goTo(idx + 1);

// Klik atau drag di scrub bar untuk loncat ke posisi tertentu.
function seekToClientX(x){
  const r = scrubEl.getBoundingClientRect();
  elapsed = Math.min(1, Math.max(0, (x - r.left) / r.width)) * track.duration;
  if(typeof audioFile !== 'undefined') {
    audioFile.currentTime = elapsed; 
  }

  updateProgressUI();
}
scrubEl.addEventListener('pointerdown', e => {
  seekToClientX(e.clientX);
  const move = ev => seekToClientX(ev.clientX);
  const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); };
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
});
// Keyboard: panah di scrub bar = ±5 detik; panah di tempat lain = ganti halaman.
scrubEl.addEventListener('keydown', e => {
  if(e.key === 'ArrowRight'){ elapsed = Math.min(track.duration, elapsed + 5); updateProgressUI(); e.stopPropagation(); }
  if(e.key === 'ArrowLeft'){ elapsed = Math.max(0, elapsed - 5); updateProgressUI(); e.stopPropagation(); }
});
document.addEventListener('keydown', e => {
  if(document.activeElement === scrubEl) return;
  if(e.key === 'ArrowRight') goTo(idx + 1);
  if(e.key === 'ArrowLeft') goTo(idx - 1);
});

/* ---------- 4) Start ---------- */
updateProgressUI();
if(location.search.includes('autoplay=1')) addEventListener('load', () => setPlaying(true));

const audioFile = new Audio(track.audioSrc);

// Kontrol Mute
if ($('#muteBtn')) {
  let isMuted = false;
  $('#muteBtn').onclick = () => {
    isMuted = !isMuted;
    
    // Matikan/nyalakan suara lagu
    if (typeof audioFile !== 'undefined') {
      audioFile.muted = isMuted;
    }
    
    // Ganti gambar ikon SVG (Volume silang vs Volume nyala)
    $('#muteIcon').innerHTML = isMuted 
      ? '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>'
      : '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
  };
}

// Hanya untuk menghentikan musik/timer saat tombol kembali diklik
const backButtonElement = document.getElementById('backBtn');
if (backButtonElement) {
  backButtonElement.addEventListener('click', () => {
    if (typeof stopTimer === 'function') stopTimer();
    if (typeof audioFile !== 'undefined') audioFile.pause();
  });
}