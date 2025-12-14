import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDDCOFQ7V4AHrzNuL6FXA0TD7a6S6c-XQ8",
  authDomain: "font-fe475.firebaseapp.com",
  projectId: "font-fe475",
  storageBucket: "font-fe475.firebasestorage.app",
  messagingSenderId: "976991399562",
  appId: "1:976991399562:web:733f63019ec09b1d2cc773"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const doctors = ["김○○","박○○","이○○","최○○"];
const randomDoctor = () => doctors[Math.floor(Math.random()*doctors.length)];
const heartRate = d => Math.min(180, 60 + d * 2);

setTimeout(()=>document.getElementById("loading")?.remove(),2000);

async function fetchFonts() {
  const snap = await getDocs(collection(db,"fonts"));
  return snap.docs.map(d=>({ id:d.id, ...d.data() }));
}

/* --------- 대시보드 --------- */
if(location.pathname.endsWith("/") || location.pathname.includes("index")) {
  fetchFonts().then(fonts=>{
    // 인기 환자
    const popular = [...fonts].sort((a,b)=>b.downloads-a.downloads).slice(0,5);
    popular.forEach(f=>{
      popularDiv.innerHTML += card(f);
    });

    // 오늘 퇴원
    const today = new Date().toDateString();
    fonts.filter(f=>f.dischargedAt && new Date(f.dischargedAt).toDateString()===today)
      .forEach(f=>todayDiv.innerHTML += card(f));

    // 위험 수치
    fonts.filter(f=>heartRate(f.downloads)>=160)
      .forEach(f=>dangerDiv.innerHTML += card(f,true));
  });
}

window.loadWard = async type => {
  list.innerHTML = "";
  const fonts = await fetchFonts();
  fonts.forEach(f=>{
    if(
      (type==="in" && !f.approved && !f.isolation && !f.beta) ||
      (type==="out" && f.approved) ||
      (type==="iso" && f.isolation) ||
      (type==="lab" && f.beta) ||
      (type==="dead" && f.dead)
    ){
      list.innerHTML += card(f);
    }
  });
};

function card(f,danger=false){
  const bpm = heartRate(f.downloads);
  return `
  <div class="card ${danger?'danger':''}">
    <b>${f.name}</b>
    <div>담당의: ${f.doctor}</div>
    <div>❤️ ${bpm} BPM</div>
    <div class="ecg" style="animation-duration:${60000/bpm}ms"></div>
  </div>`;
}
