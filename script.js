const firebaseConfig = {
  apiKey: "AIzaSyAJCpFDQZ8hzmyWBP9tqBT1JKYhQNHvwZA",
  authDomain: "laso-8ae5d.firebaseapp.com",
  projectId: "laso-8ae5d",
  storageBucket: "laso-8ae5d.firebasestorage.app",
  messagingSenderId: "671991076380",
  appId: "1:671991076380:web:764829585319b24aeff1d9",
  measurementId: "G-7H7V24BHFD"
};
firebase.initializeApp(firebaseConfig);
firebase.analytics();
const db = firebase.firestore();

// ====== VARIABEL & KONFIGURASI ======
const emojis = ["🧸","🎮","🎯","🦄","💣","🍔","🐲","💰","👑","🪨","💀","💀"];
const hadiahMap = {
  '💀': 0,
  '🧸': 3000,
  '🎮': 5000,
  '🎯': 10000,
  '🦄': 7000,
  '💣': 15000,
  '🍔': 1000,
  '🐲': 12000,
  '💰': 8000,
  '👑': 5000,
  '🪨': 9000
};
let currentUser = '', currentKupon = '', sudahTiup = false;
let bubbleElements = [], animationFrame;
let arrowAnim = null, ledakParticles = [];

// ====== UTILITY ======
function playSound(url, volume=0.5) {
  const audio = new window.Audio(url);
  audio.volume = volume;
  audio.play();
}
function showConfetti(x, y) {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let confetti = [];
  for (let i = 0; i < 30; i++) {
    confetti.push({
      x, y,
      vx: (Math.random()-0.5)*8,
      vy: Math.random()*-6-2,
      color: `hsl(${Math.random()*360},90%,60%)`,
      alpha: 1
    });
  }
  function anim() {
    let done = true;
    for (let c of confetti) {
      if (c.alpha > 0.05) done = false;
      c.x += c.vx;
      c.y += c.vy;
      c.vy += 0.25;
      c.alpha *= 0.96;
      ctx.save();
      ctx.globalAlpha = c.alpha;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 6, 0, Math.PI*2);
      ctx.fillStyle = c.color;
      ctx.fill();
      ctx.restore();
    }
    if (!done) requestAnimationFrame(anim);
  }
  anim();
}

// ====== LOGIN & KLAIM KUPON ======
document.getElementById('login-btn').onclick = mulaiGame;
function mulaiGame() {
  const userId = document.getElementById("userId").value.trim();
  const kupon = document.getElementById("kupon").value.trim();
  if (!userId || !kupon) {
    showNotif("Isi dulu USER ID dan KODE KUPON", true);
    playSound('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa4b7e.mp3', 0.2);
    return;
  }
  db.collection("kupon").doc(kupon).get().then((doc) => {
    if (!doc.exists) {
      showNotif("Kupon tidak ditemukan!", true);
      playSound('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa4b7e.mp3', 0.2);
      return;
    }
    const data = doc.data();
    if (data.dipakai) {
      showNotif("Kupon sudah dipakai!", true);
      playSound('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa4b7e.mp3', 0.2);
      return;
    }
    db.collection("kupon").doc(kupon).update({
      dipakai: true,
      userId: userId,
      waktu: new Date()
    });
    currentUser = userId;
    currentKupon = kupon;
    document.getElementById("login-box").style.display = "none";
    document.getElementById("game-area").style.display = "block";
    document.getElementById("tiup-btn").style.display = "inline-block";
    tampilkanEmoji();
    showWinNotif(currentUser, '🎁', 0, null); // Notif Telegram pop-up super mewah
    playSound('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa4b7e.mp3', 0.5);
  }).catch((error) => {
    showNotif("Terjadi kesalahan", true);
    playSound('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa4b7e.mp3', 0.2);
  });
}

// ====== NOTIFIKASI POPUP ======
function showNotif(msg, isError) {
  let notif = document.getElementById('notif-popup');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'notif-popup';
    notif.style.position = 'fixed';
    notif.style.left = '50%';
    notif.style.top = '10%';
    notif.style.transform = 'translate(-50%,0) scale(0.7)';
    notif.style.background = isError ? '#c00' : '#00bfff';
    notif.style.color = '#fff';
    notif.style.padding = '18px 32px';
    notif.style.borderRadius = '18px';
    notif.style.fontWeight = 'bold';
    notif.style.fontSize = '1.2em';
    notif.style.boxShadow = '0 0 24px 4px #00bfff88';
    notif.style.zIndex = 200;
    notif.style.opacity = 0;
    notif.style.transition = 'transform 0.7s cubic-bezier(.22,1.61,.36,1), opacity 0.7s';
    document.body.appendChild(notif);
  }
  notif.innerText = msg;
  notif.style.opacity = 1;
  notif.style.transform = 'translate(-50%,0) scale(1)';
  setTimeout(() => {
    notif.style.opacity = 0;
    notif.style.transform = 'translate(-50%,0) scale(0.7)';
    setTimeout(()=>notif.remove(), 900);
  }, 2000);
}

// ====== TAMPILKAN EMOJI BUBBLE SUPER MEWAH ======
function tampilkanEmoji() {
  const area = document.getElementById("game-area");
  area.innerHTML = '';
  bubbleElements = [];
  emojis.forEach((emoji, i) => {
    const el = document.createElement("div");
    el.className = "bubble";
    el.innerText = emoji;
    el.style.filter = 'drop-shadow(0 0 16px #00bfff)';
    el.style.background = 'rgba(255,255,255,0.13)';
    el.style.transition = 'box-shadow 0.3s, transform 0.3s';
    el.onmouseenter = () => el.style.boxShadow = '0 0 32px 12px gold';
    el.onmouseleave = () => el.style.boxShadow = '';
    area.appendChild(el);
    const obj = {
      el,
      x: Math.random() * (area.clientWidth - 60),
      y: Math.random() * (area.clientHeight - 60),
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2
    };
    bubbleElements.push(obj);
    el.style.left = obj.x + "px";
    el.style.top = obj.y + "px";
  });
  animateBubbles();
}

function animateBubbles() {
  function animate() {
    bubbleElements.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < 0 || b.x > 260) b.vx *= -1;
      if (b.y < 0 || b.y > 200) b.vy *= -1;
      b.el.style.left = b.x + "px";
      b.el.style.top = b.y + "px";
    });
    animationFrame = requestAnimationFrame(animate);
  }
  animationFrame = requestAnimationFrame(animate);
}

document.getElementById('tiup-btn').onclick = tiupEmoji;
function tiupEmoji() {
  if (sudahTiup) return;
  sudahTiup = true;
  document.getElementById("tiup-btn").disabled = true;
  cancelAnimationFrame(animationFrame);
  playSound('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa4b7e.mp3', 0.7);
  const centerX = 130, centerY = 100;
  const index = Math.floor(Math.random() * bubbleElements.length);
  const selected = bubbleElements[index];
  const n = bubbleElements.length;
  bubbleElements.forEach((b, i) => {
    const angle = (i / n) * Math.PI * 2;
    b.targetX = centerX + Math.cos(angle) * 38;
    b.targetY = centerY + Math.sin(angle) * 38;
    b.vx = (b.targetX - b.x) / 38;
    b.vy = (b.targetY - b.y) / 38;
    b.targetCenter = true;
    b.el.style.zIndex = i === index ? 11 : 2;
    b.el.classList.remove("fly-out-spin", "spotlight", "panic");
    b.el.style.transition = '';
    b.el.style.transform = '';
    b.el.style.opacity = 1;
  });
  let attractFrame;
  function attract() {
    let allAtCenter = true;
    bubbleElements.forEach((b, i) => {
      if (!b.targetCenter) return;
      b.x += b.vx;
      b.y += b.vy;
      if (Math.abs(b.x - b.targetX) > 1.2 || Math.abs(b.y - b.targetY) > 1.2) {
        allAtCenter = false;
      } else {
        b.x = b.targetX;
        b.y = b.targetY;
        b.vx = 0;
        b.vy = 0;
      }
      b.el.style.left = b.x + "px";
      b.el.style.top = b.y + "px";
    });
    if (!allAtCenter) {
      attractFrame = requestAnimationFrame(attract);
    } else {
      bubbleElements.forEach((b, i) => {
        b.el.style.transition = 'transform 2.5s cubic-bezier(.22,1.61,.36,1), opacity 2.5s';
        if (i === index) {
          b.el.style.transform = 'scale(2.9) translateY(-260px)';
          b.el.style.opacity = 1;
          setTimeout(() => {
            b.el.style.transition = 'opacity 1.1s';
            b.el.style.opacity = 0;
            setTimeout(() => b.el.remove(), 1100);
          }, 2500);
        } else {
          b.el.style.transform = 'scale(0.7)';
          b.el.style.opacity = 0.12;
          setTimeout(() => b.el.remove(), 2500);
        }
      });
      setTimeout(() => {
        const emoji = selected.el.innerText;
        const hadiah = hadiahMap[emoji] || 0;
        showConfetti(centerX, centerY);
        showWinNotif(currentUser, emoji, hadiah, function() {
          bubbleElements = [];
          tampilkanBubblesSetelahSelesai();
        });
        // Simpan data ke backend jika perlu
      }, 2700);
    }
  }
  attract();
}

// ====== NOTIFIKASI MENANG SUPER MEWAH + CLAIM TELEGRAM ======
function showWinNotif(user, emoji, hadiah, onClose) {
  let notif = document.getElementById('win-notif');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'win-notif';
    notif.style.position = 'fixed';
    notif.style.left = '50%';
    notif.style.top = '50%';
    notif.style.transform = 'translate(-50%,-50%) scale(0.7)';
    notif.style.background = 'linear-gradient(135deg,#1a1a2e 60%,#00bfff 100%)';
    notif.style.backdropFilter = 'blur(12px)';
    notif.style.border = '4px solid #00ffb3';
    notif.style.borderRadius = '32px';
    notif.style.padding = '48px 32px 36px 32px';
    notif.style.color = '#fff';
    notif.style.fontSize = '1.6em';
    notif.style.fontWeight = 'bold';
    notif.style.boxShadow = '0 0 80px 24px #00bfff88, 0 0 0 16px #fff2 inset';
    notif.style.zIndex = 100;
    notif.style.textAlign = 'center';
    notif.style.opacity = 0;
    notif.style.transition = 'transform 1.1s cubic-bezier(.22,1.61,.36,1), opacity 1.1s';
    document.body.appendChild(notif);
  }
  notif.innerHTML = `<div style='font-size:2.7em;margin-bottom:10px;filter:drop-shadow(0 0 18px #00ffb3);'>${emoji}</div>
    <div style='color:#ff4;font-size:1.2em;margin-bottom:10px;'>${hadiah === 0 ? 'ZONK!<br><span style=\'color:#fff\'>Coba lagi besok!</span>' : `SELAMAT!<br><span style='color:#fff'>Kamu dapat ${hadiah.toLocaleString()} FREEBET</span>`}</div>
    <div style='margin-top:18px;'>
      <a href='https://t.me/freebetjokerscm' target='_blank' style='display:inline-block;padding:16px 32px;border-radius:16px;background:linear-gradient(90deg,#00bfff,#00ffb3 80%);color:#111;font-weight:bold;text-decoration:none;box-shadow:0 0 24px #00bfff,0 0 12px #00ffb3;font-size:1.1em;letter-spacing:1.5px;transition:background 0.3s;animation:popResult 1.2s;'>CLAIM FREEBET TELEGRAM JOKERSCM 🚀</a>
    </div>`;
  notif.style.opacity = 1;
  notif.style.transform = 'translate(-50%,-50%) scale(1)';
  playSound('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa4b7e.mp3', 0.7);
  setTimeout(() => {
    notif.style.opacity = 0;
    notif.style.transform = 'translate(-50%,-50%) scale(0.7)';
    setTimeout(()=>{
      notif.remove();
      if (typeof onClose === 'function') onClose();
    }, 1100);
  }, 4000);
}

// ====== BUBBLE SETELAH SELESAI MAIN ======
function tampilkanBubblesSetelahSelesai() {
  const area = document.getElementById("game-area");
  area.innerHTML = '';
  let tempBubbles = [];
  for (let i = 0; i < emojis.length; i++) {
    const el = document.createElement("div");
    el.className = "bubble";
    el.innerText = emojis[i];
    el.style.filter = 'drop-shadow(0 0 16px #00bfff)';
    area.appendChild(el);
    const obj = {
      el,
      x: Math.random() * (area.clientWidth - 60),
      y: Math.random() * (area.clientHeight - 60),
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2
    };
    tempBubbles.push(obj);
    el.style.left = obj.x + "px";
    el.style.top = obj.y + "px";
  }
  function animate() {
    tempBubbles.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < 0 || b.x > 260) b.vx *= -1;
      if (b.y < 0 || b.y > 200) b.vy *= -1;
      b.el.style.left = b.x + "px";
      b.el.style.top = b.y + "px";
    });
    requestAnimationFrame(animate);
  }
  animate();
}

// ====== PARTICLE GRID BACKGROUND SUPER MEWAH ======
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const particlesArray = [];
for (let i = 0; i < 80; i++) {
  particlesArray.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5
  });
}
function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < particlesArray.length; i++) {
    const p1 = particlesArray[i];
    p1.x += p1.vx;
    p1.y += p1.vy;
    if (p1.x < 0 || p1.x > canvas.width) p1.vx *= -1;
    if (p1.y < 0 || p1.y > canvas.height) p1.vy *= -1;
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = "#00bfff";
    ctx.shadowColor = "#00ffb3";
    ctx.shadowBlur = 8;
    ctx.fill();
    for (let j = i + 1; j < particlesArray.length; j++) {
      const p2 = particlesArray[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(0,255,255,0.18)";
        ctx.lineWidth = 0.5;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawParticles);
}
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
drawParticles();

// ====== INPUT ANIMASI ======
[...document.querySelectorAll('#login-box input')].forEach(inp => {
  inp.addEventListener('input', function() {
    if (this.value.trim().length > 0) {
      this.style.borderColor = '#00ffb3';
      this.style.boxShadow = '0 0 8px #00ffb3';
    } else {
      this.style.borderColor = '#00bfff';
      this.style.boxShadow = '';
    }
  });
});
