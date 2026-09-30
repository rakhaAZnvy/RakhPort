/* tracks.js — daftar semua "lagu" (halaman). Satu-satunya tempat data bersama.
   Urutan di sini = urutan daftar album & tombol prev/next.
   duration = panjang "lagu" (detik), hanya untuk progress bar / timer. */
const TRACKS = [
  { id:'cv',       href:'cv.html',       kicker:'CV*',          title:'Wonderful LiFe',             duration:130, audioSrc:'assets/Alex MakeMusic - Golden Ascent.mp3'},
  { id:'projects', href:'projects.html', kicker:'Projects*',    title:'Lifeful story',       duration:139, audioSrc:'./assets/DEVMO - Baddest - Instrumental version.mp3' },
  { id:'experience',    href:'experience.html',    kicker:'Committee and event experiences',     title:'LiFe Events', duration:138, audioSrc:'./assets/Something.mp3' },
  { id:'contact',  href:'contact.html',  kicker:'Contact me*',  title:'Hey, call me!', duration:123, audioSrc:'./assets/Yes.mp3' }
];
