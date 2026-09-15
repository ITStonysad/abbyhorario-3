const defaultData = {
  title: "Abbys",
  subtitle: "<3>",
  block1: [
    ["BG","Basic Grammar","Se revisan temas de gramática básica.",""],
    ["BLT","Basic Listening","Se practican habilidades auditivas en nivel básico.",""],
    ["BC","Basic Conversation","Se propone y trabaja con un tema de conversación básico.",""],
    ["BRC","Basic Reading and Comprehension","Análisis de textos en nivel básico.",""],
    ["BWT","Basic Writing","Desarrollo de reglas de escritura a nivel básico.",""],
    ["BVOC","Basic Vocabulary","Revisión de vocabulario de nivel básico.",""]
  ],
  block2: [
    ["PRO","Pronunciation","Práctica de pronunciación.",""],
    ["KA","Karaoke","Práctica de pronunciación con canciones.",""],
    ["VB","Verbs","Análisis de verbos y adquisición de vocabulario (verbos).",""],
    ["IV","Irregular Verbs","Análisis de verbos irregulares y adquisición de los mismos.",""],
    ["RS","Review Shop","El estudiante propone un tema que le cuesta desarrollar y debe tenerlo preparado.",""],
    ["PRE","Prepositions","Revisión y uso de preposiciones.",""],
    ["TNS","Tenses","Análisis de diferentes tiempos a nivel básico.",""]
  ]
};

const KEY = "horarioCorazonesDataV3";

function cloneDefault(){
  return JSON.parse(JSON.stringify(defaultData));
}

function loadData(){
  try{
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if(!saved || !Array.isArray(saved.block1) || !Array.isArray(saved.block2)) return cloneDefault();
    // Corrige el caso donde una versión anterior dejó el horario completamente vacío.
    if(saved.block1.length + saved.block2.length === 0) return cloneDefault();
    return saved;
  }catch{
    return cloneDefault();
  }
}

let data = loadData();

const block1 = document.getElementById("block1");
const block2 = document.getElementById("block2");
const tpl = document.getElementById("rowTemplate");
const saveStatus = document.getElementById("saveStatus");
const count = document.getElementById("count");

function save(){
  saveStatus.textContent = "Guardando...";
  clearTimeout(window.__saveTimer);
  window.__saveTimer = setTimeout(() => {
    data.title = document.querySelector('[data-key="title"]').innerText.trim();
    data.subtitle = document.querySelector('[data-key="subtitle"]').innerText.trim();
    data.block1 = readBlock(block1);
    data.block2 = readBlock(block2);
    localStorage.setItem(KEY, JSON.stringify(data));
    saveStatus.textContent = "Todo guardado";
    updateCount();
  }, 250);
}

function readBlock(container){
  return [...container.querySelectorAll(".row")].map(row => [
    row.querySelector(".abbr").innerText.trim(),
    row.querySelector(".name").innerText.trim(),
    row.querySelector(".topic").innerText.trim(),
    row.querySelector(".time-input").value
  ]);
}

function makeRow(values){
  const node = tpl.content.firstElementChild.cloneNode(true);
  const [abbr="",name="",topic="",time=""] = values;
  node.querySelector(".abbr").textContent = abbr;
  node.querySelector(".name").textContent = name;
  node.querySelector(".topic").textContent = topic;
  node.querySelector(".time-input").value = time;
  node.querySelectorAll(".editable").forEach(el => el.addEventListener("input", save));
  node.querySelector(".time-input").addEventListener("input", save);
  node.querySelector(".delete").addEventListener("click", () => {
    node.remove();
    save();
  });
  return node;
}

function render(){
  document.querySelector('[data-key="title"]').textContent = data.title || defaultData.title;
  document.querySelector('[data-key="subtitle"]').textContent = data.subtitle || defaultData.subtitle;
  block1.innerHTML = "";
  block2.innerHTML = "";
  data.block1.forEach(item => block1.appendChild(makeRow(item)));
  data.block2.forEach(item => block2.appendChild(makeRow(item)));
  updateCount();
}

function updateCount(){
  const n = document.querySelectorAll(".row").length;
  count.textContent = `${n} ${n === 1 ? "actividad" : "actividades"}`;
}

document.querySelectorAll('[contenteditable="true"][data-key]').forEach(el => el.addEventListener("input", save));

document.getElementById("addBtn").addEventListener("click", () => {
  const target = confirm("¿Agregar al BLOQUE II?\nAceptar = Bloque II\nCancelar = Bloque I") ? block2 : block1;
  target.appendChild(makeRow(["NUEVO","Nueva actividad","Escribe aquí la descripción.",""]));
  target.lastElementChild.scrollIntoView({behavior:"smooth",block:"center"});
  save();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  if(confirm("¿Restablecer el horario original?")){
    data = cloneDefault();
    localStorage.removeItem(KEY);
    render();
    save();
  }
});

// ---------------- DECORACIÓN FLOTANTE ----------------
const layers = {
  back: document.getElementById("particlesBack"),
  mid: document.getElementById("particlesMid"),
  front: document.getElementById("particlesFront")
};

const heartSymbols = ["♡","♥","♡","♥","୨୧"];
const sparkleSymbols = ["✦","✧","⋆","˚","₊"];
const symbols = [...heartSymbols, ...sparkleSymbols];
const colors = ["#ff8fc7","#ff9bd2","#ffb3dd","#ffd8ee","#fff4fb","#e9d8ff"];
const motions = ["move-up","move-down","move-diag-right","move-diag-left"];

function rnd(min,max){return Math.random()*(max-min)+min}
function pick(arr){return arr[Math.floor(Math.random()*arr.length)]}
function pickSymbol(){
  return Math.random() < 0.64 ? pick(heartSymbols) : pick(sparkleSymbols);
}

function particleCount(){
  if(window.innerWidth <= 560) return 40;
  if(window.innerWidth <= 850) return 50;
  return 88;
}

function weightedLayer(index,total){
  const p=index/total;
  if(p < .30) return "back";
  if(p < .88) return "mid";
  return "front";
}

function sizeFor(layer,premium){
  if(premium) return rnd(38,48);
  if(layer === "back") return rnd(9,13);
  if(layer === "mid") return Math.random() < .22 ? rnd(24,34) : rnd(15,22);
  return Math.random() < .62 ? rnd(24,35) : rnd(30,40);
}

function edgeBiasedX(){
  const r=Math.random();
  if(r < .36) return rnd(1,22);
  if(r < .72) return rnd(78,99);
  return rnd(22,78);
}
function edgeBiasedY(){
  const r=Math.random();
  if(r < .28) return rnd(2,22);
  if(r < .56) return rnd(78,98);
  return rnd(20,80);
}

function makeParticle(layerName,index,total){
  const el=document.createElement("span");
  const premium=Math.random() < .11;
  const bubble=Math.random() < .08;
  el.className=`particle${premium?" premium":""}${bubble?" bubble":""}`;
  if(!bubble) el.textContent=pickSymbol();

  const size=sizeFor(layerName,premium);
  const alpha=layerName==="back"?rnd(.24,.42):layerName==="mid"?rnd(.48,.78):rnd(.62,.90);
  const blur=layerName==="back"?rnd(.45,1.2):layerName==="mid"?rnd(0,.45):rnd(.15,.9);
  const duration=layerName==="back"?rnd(26,42):layerName==="mid"?rnd(18,31):rnd(14,24);
  const motion=pick(motions);
  const x=edgeBiasedX();
  const y=edgeBiasedY();
  const wave=layerName==="back"?rnd(10,24):layerName==="mid"?rnd(18,42):rnd(24,52);

  el.style.setProperty("--particle-color",pick(colors));
  el.style.setProperty("--alpha",alpha.toFixed(2));
  el.style.setProperty("--blur",`${blur.toFixed(2)}px`);
  el.style.setProperty("--glow",`${premium?rnd(9,13):rnd(4,7)}px`);
  el.style.setProperty("--duration",`${duration.toFixed(2)}s`);
  el.style.setProperty("--delay",`${(-rnd(0,duration)).toFixed(2)}s`);
  el.style.setProperty("--twinkle",`${rnd(3.2,6.2).toFixed(2)}s`);
  el.style.setProperty("--twinkle-delay",`${(-rnd(0,5)).toFixed(2)}s`);
  el.style.setProperty("--pulse-delay",`${(-rnd(0,3.4)).toFixed(2)}s`);
  el.style.setProperty("--motion",motion);
  el.style.setProperty("--x",`${x}vw`);
  el.style.setProperty("--y",`${y}vh`);
  el.style.setProperty("--w1",`${rnd(.55,1.15)*wave}px`);
  el.style.setProperty("--w2",`${rnd(.7,1.3)*wave}px`);
  el.style.setProperty("--w3",`${rnd(.55,1.25)*wave}px`);
  el.style.setProperty("--w4",`${rnd(.45,1.1)*wave}px`);
  el.style.setProperty("--r0",`${rnd(-35,35)}deg`);
  el.style.setProperty("--s0",rnd(.76,.95).toFixed(2));
  el.style.setProperty("--s1",rnd(.94,1.08).toFixed(2));
  el.style.setProperty("--s2",rnd(.90,1.15).toFixed(2));
  el.style.fontSize=`${size.toFixed(1)}px`;
  if(bubble){el.style.width=`${size}px`;el.style.height=`${size}px`;}

  layers[layerName].appendChild(el);
}

function buildParticles(){
  Object.values(layers).forEach(layer=>layer.innerHTML="");
  const total=particleCount();
  for(let i=0;i<total;i++) makeParticle(weightedLayer(i,total),i,total);
}
buildParticles();

let resizeTimer;
window.addEventListener("resize",()=>{
  clearTimeout(resizeTimer);
  resizeTimer=setTimeout(buildParticles,250);
});

// Parallax muy suave, en sentido opuesto al cursor.
window.addEventListener("mousemove",e=>{
  const nx=e.clientX/window.innerWidth-.5;
  const ny=e.clientY/window.innerHeight-.5;
  layers.back.style.setProperty("--px",`${-nx*4}px`);
  layers.back.style.setProperty("--py",`${-ny*4}px`);
  layers.mid.style.setProperty("--px",`${-nx*8}px`);
  layers.mid.style.setProperty("--py",`${-ny*8}px`);
  layers.front.style.setProperty("--px",`${-nx*13}px`);
  layers.front.style.setProperty("--py",`${-ny*13}px`);
});

// Cursor adorable: corazón suave que sigue el mouse.
const cuteCursor=document.getElementById("cuteCursor");
let cx=innerWidth/2,cy=innerHeight/2,tx=cx,ty=cy;
window.addEventListener("mousemove",e=>{tx=e.clientX;ty=e.clientY});
function animateCursor(){
  cx+=(tx-cx)*.22;cy+=(ty-cy)*.22;
  cuteCursor.style.left=`${cx}px`;
  cuteCursor.style.top=`${cy}px`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll("button,input,a,[contenteditable='true']").forEach(el=>{
  el.addEventListener("mouseenter",()=>document.body.classList.add("cursor-hover"));
  el.addEventListener("mouseleave",()=>document.body.classList.remove("cursor-hover"));
});

render();


// ---------------- MÚSICA DE FONDO ----------------
const musicPlayer=document.getElementById("musicPlayer");
const musicToggle=document.getElementById("musicToggle");
const musicMute=document.getElementById("musicMute");
const musicVolume=document.getElementById("musicVolume");
const musicState=document.getElementById("musicState");

musicPlayer.volume=0.35;
musicPlayer.loop=true;
let autoplayWaiting=false;

function syncMusicUI(){
  const playing=!musicPlayer.paused;
  musicToggle.textContent=playing?"❚❚":"♫";
  musicToggle.setAttribute("aria-label",playing?"Pausar música":"Reproducir música");
  musicMute.textContent=musicPlayer.muted?"♡":"♥";
  musicMute.setAttribute("aria-label",musicPlayer.muted?"Activar sonido":"Silenciar música");
  musicState.textContent=playing?"Sonando":"Música";
}

async function tryPlayMusic(){
  try{
    await musicPlayer.play();
    autoplayWaiting=false;
    syncMusicUI();
    return true;
  }catch{
    autoplayWaiting=true;
    syncMusicUI();
    return false;
  }
}

musicToggle.addEventListener("click",async e=>{
  e.stopPropagation();
  if(musicPlayer.paused) await tryPlayMusic();
  else musicPlayer.pause();
  syncMusicUI();
});

musicMute.addEventListener("click",e=>{
  e.stopPropagation();
  musicPlayer.muted=!musicPlayer.muted;
  syncMusicUI();
});

musicVolume.addEventListener("input",e=>{
  musicPlayer.volume=Number(e.target.value);
  if(musicPlayer.volume>0 && musicPlayer.muted) musicPlayer.muted=false;
  syncMusicUI();
});

musicPlayer.addEventListener("play",syncMusicUI);
musicPlayer.addEventListener("pause",syncMusicUI);
musicPlayer.addEventListener("volumechange",syncMusicUI);

// AUTOPLAY: se intenta iniciar inmediatamente, sin que el usuario tenga que tocar el botón.
// Algunos navegadores bloquean por política el audio con sonido hasta la primera interacción;
// en ese caso, cualquier clic/toque/tecla en cualquier parte de la página lo inicia automáticamente.
async function aggressiveAutoplay(){
  musicPlayer.volume=0.35;
  musicPlayer.muted=false;
  try{
    await musicPlayer.play();
    autoplayWaiting=false;
  }catch{
    autoplayWaiting=true;
  }
  syncMusicUI();
}

// Varios intentos tempranos para navegadores que sí permiten autoplay con sonido.
document.addEventListener("DOMContentLoaded",aggressiveAutoplay,{once:true});
window.addEventListener("load",aggressiveAutoplay,{once:true});
setTimeout(aggressiveAutoplay,150);
setTimeout(aggressiveAutoplay,700);

async function startOnFirstInteraction(){
  if(!musicPlayer.paused) return cleanupFirstInteraction();
  await aggressiveAutoplay();
  if(!musicPlayer.paused) cleanupFirstInteraction();
}
function cleanupFirstInteraction(){
  ["pointerdown","click","keydown","touchstart"].forEach(evt=>
    document.removeEventListener(evt,startOnFirstInteraction,true)
  );
}
["pointerdown","click","keydown","touchstart"].forEach(evt=>
  document.addEventListener(evt,startOnFirstInteraction,true)
);

// Reintenta si la pestaña vuelve a estar visible y el audio sigue pausado.
document.addEventListener("visibilitychange",()=>{
  if(!document.hidden && musicPlayer.paused) aggressiveAutoplay();
});

syncMusicUI();
