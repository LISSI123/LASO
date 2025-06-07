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

function mulaiGame() {
  const userId = document.getElementById("userId").value.trim();
  const kupon = document.getElementById("kupon").value.trim();
  const area = document.getElementById("areaGame");

  if (!userId || !kupon) {
    alert("Isi dulu USER ID dan KODE KUPON");
    return;
  }

  db.collection("kupon").doc(kupon).get().then((doc) => {
    if (!doc.exists) {
      alert("Kupon tidak ditemukan!");
      return;
    }

    const data = doc.data();
    if (data.dipakai) {
      alert("Kupon sudah dipakai!");
      return;
    }

    db.collection("kupon").doc(kupon).update({
      dipakai: true,
      userId: userId,
      waktu: new Date()
    });

    const emojiList = ["🎉", "💎", "😎", "🔥", "🎁", "💥"];
    const hasil = emojiList[Math.floor(Math.random() * emojiList.length)];
    area.innerHTML = hasil;

  }).catch((error) => {
    console.error("Error cek kupon: ", error);
    alert("Terjadi kesalahan");
  });
}

// PARTICLE GRID
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
    ctx.fillStyle = "red";
    ctx.fill();

    for (let j = i + 1; j < particlesArray.length; j++) {
      const p2 = particlesArray[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
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
