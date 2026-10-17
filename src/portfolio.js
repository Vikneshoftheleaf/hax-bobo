// =============================================
// PORTFOLIO.JS - Bobo Hackathon Features
// =============================================

// ---- Neat Single Golden Sparkle Cursor ----
let sparkleThrottle=0;
document.addEventListener('pointermove',e=>{
  const now=Date.now();
  if(now-sparkleThrottle<65)return;
  sparkleThrottle=now;
  const el=document.createElement('div');
  el.className='golden-sparkle';
  el.innerHTML='<svg viewBox="0 0 24 24" width="100%" height="100%"><polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9" fill="#fbbf24"/></svg>';
  el.style.left=e.clientX+'px';
  el.style.top=e.clientY+'px';
  document.body.appendChild(el);
  el.addEventListener('animationend',()=>el.remove());
});

// ---- Tab Navigation ----
const tabItems=document.querySelectorAll('.tab-item');
const pages=document.querySelectorAll('.page');
let currentTab='home';

export function switchTab(tabId){
  currentTab=tabId;
  clickSFX();
  tabItems.forEach(t=>{
    const a=t.dataset.tab===tabId;
    t.classList.toggle('active',a);
    t.setAttribute('aria-current',a?'page':'false');
    t.setAttribute('aria-selected',a?'true':'false');
  });
  pages.forEach(p=>p.classList.toggle('active',p.id==='page-'+tabId));
  window.scrollTo({ top: 0, behavior: 'instant' });
  if(tabId==='guest')loadGuestbook();
  if(tabId==='lab')initLabViz();
  if(tabId==='play')initGameCanvas();
}
window.switchTab=switchTab;

tabItems.forEach(t=>t.addEventListener('click',()=>switchTab(t.dataset.tab)));
document.querySelectorAll('.proj-card[data-tab]').forEach(c=>{
  c.addEventListener('click',()=>switchTab(c.dataset.tab));
});

// ---- Day/Night Toggle ----
const nightBtn=document.getElementById('night-btn');
let isDark=localStorage.getItem('bobo-theme')==='night';
if(isDark)document.documentElement.setAttribute('data-theme','night');
nightBtn.addEventListener('click',()=>{
  isDark=!isDark;
  document.documentElement.setAttribute('data-theme',isDark?'night':'');
  localStorage.setItem('bobo-theme',isDark?'night':'day');
  clickSFX();
});

// ---- SFX Mute Toggle ----
const sfxMuteBtn=document.getElementById('sfx-mute');
export let sfxMuted=false;
sfxMuteBtn.addEventListener('click',()=>{
  sfxMuted=!sfxMuted;
  sfxMuteBtn.classList.toggle('is-muted',sfxMuted);
});

export function clickSFX(){
  if(sfxMuted)return;
  try{
    const ctx=new AudioContext(),t=ctx.currentTime;
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type='sine';
    o.frequency.setValueAtTime(700,t);
    o.frequency.exponentialRampToValueAtTime(1000,t+.08);
    g.gain.setValueAtTime(.06,t);
    g.gain.exponentialRampToValueAtTime(.001,t+.1);
    o.connect(g).connect(ctx.destination);
    o.start();o.stop(t+.1);
    setTimeout(()=>ctx.close(),300);
  }catch(e){}
}

// ---- Hit Counter Odometer ----
async function initHitCounter(){
  try{
    await fetch('/api/hit',{method:'POST'});
    const r=await fetch('/api/hits');
    const data=await r.json();
    animateOdometer(data.count);
  }catch(e){
    animateOdometer(Math.floor(Math.random()*500)+100);
  }
}

function animateOdometer(count){
  const str=String(count).padStart(5,'0');
  for(let i=0;i<5;i++){
    const el=document.getElementById('od'+i);
    if(!el)continue;
    const target=parseInt(str[i]);
    let cur=0;
    const iv=setInterval(()=>{
      el.textContent=cur%10;
      if(++cur>target+10){clearInterval(iv);el.textContent=target;}
    },60+i*20);
  }
}
initHitCounter();

// ---- Storybook Flipbook ----
const STORY_PAGES=[
  {emoji:'🌌',title:'In the Beginning...',text:'Before there were dreams, the universe was quiet — a little too quiet. Stars flickered but no one was sleeping underneath them. Something had to be done.'},
  {emoji:'🫧',title:'A Bubble Appears',text:'One night, a tiny glowing bubble floated up from the Dream River. It wobbled, it spun, and then — POP! Out tumbled Bobo, already yawning, already curious.'},
  {emoji:'💙',title:'Sky-Blue and Squishy',text:'Bobo was sky-blue, perfectly round, and impossibly squishy. Two enormous eyes blinked at the stars. "Hello," said Bobo. "What do I do now?"'},
  {emoji:'⭐',title:'The First Assignment',text:'The Great Starkeeper handed Bobo a tiny briefcase full of dream seeds. "Plant these in sleeping minds," she said. "Make the nights warm and wonderful."'},
  {emoji:'🎵',title:'The Lullaby Lab',text:'Bobo built a tiny lab on a cloud. Inside: bells, chimes, and one very important music box. Every night Bobo composes new lullabies for every creature below.'},
  {emoji:'🏠',title:'Dream Delivery Routes',text:'Bobo flies the same routes every night — House A, House B, House C — leaving a small dream at each window. Never late. Never forgotten.'},
  {emoji:'🌅',title:'The Journey Continues',text:'Every morning, Bobo counts the smiles from overnight dreams. Then naps all day, recharging for the next big night shift. The dreaming never stops. ✨'},
];

let currentPage=0;
const bookContainer=document.getElementById('book-container');
const prevBtn=document.getElementById('prev-page');
const nextBtn=document.getElementById('next-page');
const dotsContainer=document.getElementById('page-dots');

function buildStorybook(){
  bookContainer.innerHTML='';
  STORY_PAGES.forEach((p,i)=>{
    const div=document.createElement('div');
    div.className='book-page'+(i===0?' active':'');
    let stars='<div class="book-stars">';
    for(let s=0;s<15;s++){
      const x=(Math.random()*100).toFixed(1);
      const y=(Math.random()*100).toFixed(1);
      const dur=(2+Math.random()*3).toFixed(1);
      const delay=(Math.random()*2).toFixed(1);
      stars+='<span style="left:'+x+'%;top:'+y+'%;--dur:'+dur+'s;animation-delay:'+delay+'s">✦</span>';
    }
    stars+='</div>';
    div.innerHTML=stars+'<span class="page-emoji">'+p.emoji+'</span><div class="page-title">'+p.title+'</div><div class="page-text">'+p.text+'</div><div class="page-num">'+(i+1)+' / '+STORY_PAGES.length+'</div>';
    bookContainer.appendChild(div);
  });
  dotsContainer.innerHTML='';
  STORY_PAGES.forEach((_,i)=>{
    const dot=document.createElement('div');
    dot.className='page-dot'+(i===0?' active':'');
    dot.addEventListener('click',()=>goToPage(i));
    dotsContainer.appendChild(dot);
  });
  updateBookNav();
}

let isSliding=false;
function goToPage(newIdx){
  if(isSliding||newIdx===currentPage||newIdx<0||newIdx>=STORY_PAGES.length)return;
  isSliding=true;
  const isNext = newIdx > currentPage;
  const allPages=bookContainer.querySelectorAll('.book-page');
  const oldP=allPages[currentPage],newP=allPages[newIdx];

  newP.style.transition='none';
  newP.style.transform=isNext ? 'translateX(100%)' : 'translateX(-100%)';
  newP.style.opacity='0';
  newP.offsetHeight; // force reflow

  newP.style.transition='transform 0.38s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.35s ease';
  oldP.style.transition='transform 0.38s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.35s ease';

  oldP.style.transform=isNext ? 'translateX(-100%)' : 'translateX(100%)';
  oldP.style.opacity='0';
  oldP.classList.remove('active');

  newP.style.transform='translateX(0)';
  newP.style.opacity='1';
  newP.classList.add('active');

  currentPage=newIdx;
  updateBookNav();
  clickSFX();

  setTimeout(()=>{
    allPages.forEach((p, idx)=>{
      if(idx!==currentPage){
        p.style.transform='translateX(100%)';
        p.style.opacity='0';
        p.classList.remove('active');
      }
    });
    isSliding=false;
  }, 400);
}

function updateBookNav(){
  prevBtn.disabled=currentPage===0;
  nextBtn.disabled=currentPage===STORY_PAGES.length-1;
  document.querySelectorAll('.page-dot').forEach((d,i)=>d.classList.toggle('active',i===currentPage));
}

prevBtn.addEventListener('click',()=>goToPage(currentPage-1));
nextBtn.addEventListener('click',()=>goToPage(currentPage+1));

document.addEventListener('keydown',e=>{
  if(currentTab!=='story')return;
  if(e.key==='ArrowRight'||e.key==='ArrowDown')goToPage(currentPage+1);
  if(e.key==='ArrowLeft'||e.key==='ArrowUp')goToPage(currentPage-1);
});

let storyTouchX=null;
const storyPageEl=document.getElementById('page-story');
storyPageEl.addEventListener('touchstart',e=>{storyTouchX=e.touches[0].clientX;},{passive:true});
storyPageEl.addEventListener('touchend',e=>{
  if(storyTouchX===null)return;
  const dx=e.changedTouches[0].clientX-storyTouchX;
  if(Math.abs(dx)>40){if(dx<0)goToPage(currentPage+1);else goToPage(currentPage-1);}
  storyTouchX=null;
});

buildStorybook();

// ---- Lullaby Lab ----
let lullabyCtx=null, lullabyInterval=null, lullabyPlaying=false, vizInterval=null;
let lullabyAnalyser=null;
let lullabyMasterGain=null, lullabyDelayNode=null, lullabyFeedbackGain=null;
let lullabyParams={tempo:72,reverb:60,volume:70,preset:'dream'};

const PRESETS={
  dream:{notes:[261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 440.00, 329.63]},
  rain:{notes:[220.00, 261.63, 293.66, 329.63, 392.00, 329.63, 261.63, 220.00]},
  star:{notes:[523.25, 659.26, 783.99, 987.77, 1046.50, 783.99, 659.26, 523.25]},
  ocean:{notes:[174.61, 220.00, 261.63, 329.63, 261.63, 220.00, 174.61, 130.81]},
};

const vizEl=document.getElementById('viz-bars');
const BAR_COUNT=24;
let vizBars=[];

export function initLabViz(){
  if(!vizEl)return;
  if(vizEl.children.length===BAR_COUNT)return;
  vizEl.innerHTML='';vizBars=[];
  for(let i=0;i<BAR_COUNT;i++){
    const b=document.createElement('div');
    b.className='bar';b.style.height='4px';
    vizEl.appendChild(b);vizBars.push(b);
  }
}
initLabViz();

function animateViz(playing){
  clearInterval(vizInterval);
  if(!playing){vizBars.forEach(b=>b.style.height='4px');return;}
  const dataArray = new Uint8Array(lullabyAnalyser ? lullabyAnalyser.frequencyBinCount : 32);
  vizInterval=setInterval(()=>{
    if(lullabyAnalyser){
      lullabyAnalyser.getByteFrequencyData(dataArray);
      vizBars.forEach((b,i)=>{
        const val = dataArray[i % dataArray.length] || 0;
        const h = Math.max(4, Math.min(54, (val / 255) * 50 + 6 + Math.sin(Date.now()/300 + i)*4));
        b.style.height = h + 'px';
      });
    } else {
      vizBars.forEach((b,i)=>{
        const base=Math.sin(Date.now()/400+i*.4)*.5+.5;
        b.style.height=(4+base*48+Math.random()*8)+'px';
      });
    }
  },60);
}

async function playLullaby(){
  if(lullabyPlaying)return;
  try{
    if(!lullabyCtx || lullabyCtx.state === 'closed'){
      lullabyCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if(lullabyCtx.state === 'suspended'){
      await lullabyCtx.resume();
    }
  }catch(e){
    console.warn('AudioContext init error', e);
  }
  lullabyPlaying=true;

  // Master Gain & Analyser
  lullabyMasterGain = lullabyCtx.createGain();
  lullabyMasterGain.gain.setValueAtTime((lullabyParams.volume/100) * 0.35, lullabyCtx.currentTime);

  lullabyAnalyser = lullabyCtx.createAnalyser();
  lullabyAnalyser.fftSize = 64;

  // Dream Reverb / Delay feedback
  lullabyDelayNode = lullabyCtx.createDelay();
  lullabyDelayNode.delayTime.value = 0.36;
  lullabyFeedbackGain = lullabyCtx.createGain();
  lullabyFeedbackGain.gain.value = Math.min(0.65, (lullabyParams.reverb/100) * 0.6);

  const filter = lullabyCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 2200;

  lullabyDelayNode.connect(lullabyFeedbackGain);
  lullabyFeedbackGain.connect(filter);
  filter.connect(lullabyDelayNode);
  filter.connect(lullabyMasterGain);

  lullabyMasterGain.connect(lullabyAnalyser);
  lullabyAnalyser.connect(lullabyCtx.destination);

  animateViz(true);

  const notes=PRESETS[lullabyParams.preset].notes;
  const beatMs=60000/lullabyParams.tempo;
  let noteIdx=0;

  function playNote(){
    if(!lullabyPlaying || !lullabyCtx)return;
    const freq=notes[noteIdx % notes.length];
    noteIdx++;
    const t=lullabyCtx.currentTime;

    // Dual chime oscillators (music box celesta bell sound)
    const o1=lullabyCtx.createOscillator(), g1=lullabyCtx.createGain();
    o1.type='sine';
    o1.frequency.setValueAtTime(freq, t);

    const o2=lullabyCtx.createOscillator(), g2=lullabyCtx.createGain();
    o2.type='triangle';
    o2.frequency.setValueAtTime(freq * 2, t);

    const noteDur = (beatMs/1000) * 1.4;
    g1.gain.setValueAtTime(0.0001, t);
    g1.gain.linearRampToValueAtTime(0.4, t + 0.035);
    g1.gain.exponentialRampToValueAtTime(0.0001, t + noteDur);

    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.linearRampToValueAtTime(0.18, t + 0.02);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + noteDur * 0.7);

    o1.connect(g1);
    o2.connect(g2);
    g1.connect(lullabyMasterGain);
    g2.connect(lullabyMasterGain);
    g1.connect(lullabyDelayNode);

    o1.start(t);
    o2.start(t);
    o1.stop(t + noteDur + 0.1);
    o2.stop(t + noteDur + 0.1);
  }

  playNote();
  clearInterval(lullabyInterval);
  lullabyInterval=setInterval(playNote, beatMs);

  const playBtn=document.getElementById('play-lullaby');
  if(playBtn){
    playBtn.classList.add('playing');
    playBtn.textContent = '⏸ Pause Lullaby';
  }
}

function stopLullaby(){
  lullabyPlaying=false;
  clearInterval(lullabyInterval);
  lullabyInterval=null;
  animateViz(false);
  const playBtn=document.getElementById('play-lullaby');
  if(playBtn){
    playBtn.classList.remove('playing');
    playBtn.textContent = '▶ Play Melodic Lullaby';
  }
}

const playLullabyBtn=document.getElementById('play-lullaby');
const stopLullabyBtn=document.getElementById('stop-lullaby');
if(playLullabyBtn)playLullabyBtn.addEventListener('click',()=>{
  lullabyPlaying ? stopLullaby() : playLullaby();
});
if(stopLullabyBtn)stopLullabyBtn.addEventListener('click',stopLullaby);

document.querySelectorAll('.preset-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.preset-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    lullabyParams.preset=btn.dataset.preset;
    if(lullabyPlaying){
      stopLullaby();
      setTimeout(playLullaby,100);
    }
  });
});

function makeSlider(id,valId,param){
  const sl=document.getElementById(id),vl=document.getElementById(valId);
  if(!sl)return;
  sl.addEventListener('input',()=>{
    lullabyParams[param]=+sl.value;
    if(vl)vl.textContent=sl.value;
    if(param==='tempo'&&lullabyPlaying){
      stopLullaby();
      setTimeout(playLullaby,80);
    }
    if(param==='volume'&&lullabyMasterGain&&lullabyCtx){
      lullabyMasterGain.gain.setValueAtTime((lullabyParams.volume/100)*0.35, lullabyCtx.currentTime);
    }
    if(param==='reverb'&&lullabyFeedbackGain&&lullabyCtx){
      lullabyFeedbackGain.gain.setValueAtTime(Math.min(0.65, (lullabyParams.reverb/100)*0.6), lullabyCtx.currentTime);
    }
  });
}
makeSlider('sl-tempo','val-tempo','tempo');
makeSlider('sl-reverb','val-reverb','reverb');
makeSlider('sl-vol','val-vol','volume');

// ---- Nightlight Collection ----
const LANTERNS=[
  {emoji:'🌙',label:'Moon Glow',color:'#7c3aed',bg:'rgba(124,58,237,0.15)'},
  {emoji:'⭐',label:'Star Lamp',color:'#f59e0b',bg:'rgba(245,158,11,0.15)'},
  {emoji:'🌊',label:'Ocean Light',color:'#0ea5e9',bg:'rgba(14,165,233,0.15)'},
  {emoji:'🌸',label:'Blossom',color:'#ec4899',bg:'rgba(236,72,153,0.15)'},
  {emoji:'🔥',label:'Ember',color:'#f97316',bg:'rgba(249,115,22,0.15)'},
  {emoji:'🌿',label:'Forest',color:'#22c55e',bg:'rgba(34,197,94,0.15)'},
];
const lanternGrid=document.getElementById('lantern-grid');
if(lanternGrid){
  LANTERNS.forEach(l=>{
    const el=document.createElement('div');
    el.className='lantern';el.style.background=l.bg;
    el.innerHTML='<div class="lantern-glow" style="background:radial-gradient(circle,'+l.color+'44,transparent 70%);"></div><span style="font-size:2rem">'+l.emoji+'</span><span class="lantern-label">'+l.label+'</span>';
    el.addEventListener('click',()=>{
      el.classList.toggle('on');
      if(el.classList.contains('on')){
        el.style.boxShadow='0 0 24px '+l.color+'88,0 0 48px '+l.color+'44';
        el.style.borderColor=l.color;
      }else{
        el.style.boxShadow='';el.style.borderColor='';
      }
      clickSFX();
    });
    lanternGrid.appendChild(el);
  });
}

// ---- Dream Route Animation ----
(function animateDreamRoute(){
  const boboFlyer=document.getElementById('bobo-flyer');
  if(!boboFlyer)return;
  let t=0;
  const ROUTE=[[40,100],[80,40],[140,80],[200,120],[260,60],[310,20],[340,80]];
  function lerp(a,b,x){return a+(b-a)*x;}
  function getPos(p){
    const s=p*(ROUTE.length-1);
    const idx=Math.min(Math.floor(s),ROUTE.length-2);
    const f=s-idx;
    return[lerp(ROUTE[idx][0],ROUTE[idx+1][0],f),lerp(ROUTE[idx][1],ROUTE[idx+1][1],f)];
  }
  function tick(){
    t=(t+.002)%1;
    const pos=getPos(t);
    boboFlyer.setAttribute('transform','translate('+pos[0]+','+pos[1]+')');
    requestAnimationFrame(tick);
  }
  tick();
})();

// ---- Dream Catcher Mini-Game ----
const canvas=document.getElementById('game-canvas');
const ctx2d=canvas?canvas.getContext('2d'):null;
let game={
  running:false,
  score:0,
  lives:3,
  hi:parseInt(localStorage.getItem('bobo-hi')||'0', 10),
  basket:{x:200,w:76,tilt:0},
  items:[],
  particles:[],
  spawnTimer:0,
  frame:0
};
let gameAnimId=null;
let gameInputX=null;

export function initGameCanvas(){
  if(!game.running&&ctx2d)drawIdleGame();
}

function drawIdleGame(){
  if(!ctx2d)return;
  const W=canvas.width,H=canvas.height;
  ctx2d.clearRect(0,0,W,H);
  ctx2d.fillStyle='#090d1a';
  ctx2d.fillRect(0,0,W,H);
  for(let i=0;i<45;i++){
    const x=(i*137)%W,y=(i*97)%H;
    ctx2d.fillStyle='rgba(255,255,255,0.4)';
    ctx2d.beginPath();ctx2d.arc(x,y,1,0,Math.PI*2);ctx2d.fill();
  }
  ctx2d.fillStyle='#ffd15c';
  ctx2d.font='bold 22px "Baloo 2", cursive';
  ctx2d.textAlign='center';
  ctx2d.fillText('Dream Catcher Arcade',W/2,H/2-40);
  ctx2d.fillStyle='rgba(255,255,255,0.85)';
  ctx2d.font='15px "Nunito", sans-serif';
  ctx2d.fillText('Catch falling stars & avoid lightning!',W/2,H/2-10);
  ctx2d.fillStyle='#38bdf8';
  ctx2d.fillText('Best Score: ' + game.hi,W/2,H/2+20);
  ctx2d.font='32px serif';
  ctx2d.fillText('⭐ 🌙 💤',W/2,H/2+65);
}

if(canvas)initGameCanvas();

function startGame(){
  if(gameAnimId)cancelAnimationFrame(gameAnimId);
  game.score=0;
  game.lives=3;
  game.items=[];
  game.particles=[];
  game.basket.x=canvas ? canvas.width/2 : 200;
  game.basket.tilt=0;
  game.running=true;
  game.frame=0;
  game.spawnTimer=0;
  updateGameUI();
  const startBtn=document.getElementById('game-start-btn');
  if(startBtn)startBtn.textContent='Restart Game 🔄';
  gameLoop();
}

function updateGameUI(){
  const gs=document.getElementById('game-score');
  const gl=document.getElementById('game-lives');
  const gh=document.getElementById('game-hi');
  if(gs)gs.textContent=game.score;
  if(gl)gl.textContent='❤️'.repeat(Math.max(0,game.lives));
  if(gh)gh.textContent=game.hi;
}

const ITEM_TYPES=[
  {symbol:'⭐',good:true,points:10,speed:2.0},
  {symbol:'🌙',good:true,points:20,speed:2.3},
  {symbol:'💤',good:true,points:15,speed:1.8},
  {symbol:'🌟',good:true,points:30,speed:2.6},
  {symbol:'❤️',good:true,points:5,speed:2.0,isHeart:true},
  {symbol:'⚡',good:false,points:0,speed:2.8},
  {symbol:'☁️',good:false,points:0,speed:2.4},
];

function spawnItem(){
  const W = canvas.width;
  let pool = ITEM_TYPES.slice(0, 4);
  if(Math.random() < 0.28) pool = [ITEM_TYPES[5], ITEM_TYPES[6]];
  if(game.lives < 3 && Math.random() < 0.12) pool = [ITEM_TYPES[4]];

  const itemDef = pool[Math.floor(Math.random() * pool.length)];
  const speedMult = 1 + Math.min(1.2, game.score / 250);
  game.items.push({
    x: 24 + Math.random() * (W - 48),
    y: -24,
    vy: itemDef.speed * speedMult,
    symbol: itemDef.symbol,
    good: itemDef.good,
    points: itemDef.points,
    isHeart: !!itemDef.isHeart,
    size: 26
  });
}

function spawnCatchParticles(x, y, color){
  for(let i=0;i<6;i++){
    const angle = Math.random() * Math.PI * 2;
    const spd = 1.5 + Math.random() * 2.5;
    game.particles.push({
      x, y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - 1,
      alpha: 1,
      color: color || '#fde047',
      size: 2 + Math.random() * 3
    });
  }
}

function gameLoop(){
  if(!game.running||!ctx2d)return;
  game.frame++;
  const W=canvas.width,H=canvas.height;

  game.spawnTimer++;
  const spawnInterval = Math.max(26, 46 - Math.floor(game.score / 40));
  if(game.spawnTimer >= spawnInterval){
    game.spawnTimer = 0;
    spawnItem();
  }

  if(gameInputX !== null){
    const rect = canvas.getBoundingClientRect();
    const targetX = ((gameInputX - rect.left) / rect.width) * W;
    const diff = targetX - game.basket.x;
    game.basket.x += diff * 0.22;
    game.basket.tilt = Math.max(-0.25, Math.min(0.25, diff * 0.02));
  } else {
    game.basket.tilt *= 0.85;
  }

  const bw = game.basket.w;
  game.basket.x = Math.max(bw/2 + 6, Math.min(W - bw/2 - 6, game.basket.x));

  ctx2d.clearRect(0, 0, W, H);
  ctx2d.fillStyle = '#0a0e1c';
  ctx2d.fillRect(0, 0, W, H);

  for(let i=0; i<35; i++){
    const sx = (i * 157 + game.frame * 0.15) % W;
    const sy = (i * 109) % H;
    const alpha = (0.15 + (Math.sin(game.frame / 25 + i) * 0.5 + 0.5) * 0.4).toFixed(2);
    ctx2d.fillStyle = 'rgba(255,255,255,' + alpha + ')';
    ctx2d.beginPath();
    ctx2d.arc(sx, sy, 1.2, 0, Math.PI * 2);
    ctx2d.fill();
  }

  const bY = H - 46;
  const bxC = game.basket.x;

  ctx2d.font = '24px serif';
  ctx2d.textAlign = 'center';
  ctx2d.textBaseline = 'middle';

  game.items = game.items.filter(item => {
    item.y += item.vy;
    ctx2d.fillText(item.symbol, item.x, item.y);

    const bL = bxC - bw/2 - 4;
    const bR = bxC + bw/2 + 4;
    if(item.y >= bY - 12 && item.y <= bY + 26 && item.x >= bL && item.x <= bR){
      if(item.good){
        game.score += item.points;
        if(item.isHeart && game.lives < 3){
          game.lives = Math.min(3, game.lives + 1);
        }
        if(game.score > game.hi){
          game.hi = game.score;
          localStorage.setItem('bobo-hi', String(game.hi));
        }
        spawnCatchParticles(item.x, item.y, item.isHeart ? '#f472b6' : '#fde047');
        clickSFX();
      } else {
        game.lives--;
        spawnCatchParticles(item.x, item.y, '#ef4444');
        if(game.lives <= 0){
          updateGameUI();
          endGame();
          return false;
        }
      }
      updateGameUI();
      return false;
    }

    if(item.y > H + 20){
      return false;
    }
    return true;
  });

  game.particles = game.particles.filter(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.035;
    if(p.alpha <= 0) return false;
    ctx2d.fillStyle = p.color;
    ctx2d.globalAlpha = p.alpha;
    ctx2d.beginPath();
    ctx2d.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx2d.fill();
    ctx2d.globalAlpha = 1.0;
    return true;
  });

  ctx2d.save();
  ctx2d.translate(bxC, bY + 14);
  ctx2d.rotate(game.basket.tilt);

  ctx2d.shadowColor = 'rgba(56, 189, 248, 0.4)';
  ctx2d.shadowBlur = 10;

  ctx2d.fillStyle = '#7cc4ff';
  ctx2d.strokeStyle = '#2563eb';
  ctx2d.lineWidth = 3;
  ctx2d.beginPath();
  ctx2d.roundRect(-bw/2, -14, bw, 28, [4, 4, 14, 14]);
  ctx2d.fill();
  ctx2d.stroke();

  ctx2d.strokeStyle = 'rgba(37, 99, 235, 0.35)';
  ctx2d.lineWidth = 2;
  ctx2d.beginPath();
  ctx2d.moveTo(-bw/4, -14); ctx2d.lineTo(-bw/4, 14);
  ctx2d.moveTo(bw/4, -14); ctx2d.lineTo(bw/4, 14);
  ctx2d.stroke();

  ctx2d.shadowBlur = 0;
  ctx2d.fillStyle = '#5aaae8';
  ctx2d.beginPath();
  ctx2d.arc(0, -6, 13, 0, Math.PI * 2);
  ctx2d.fill();

  ctx2d.fillStyle = '#ffffff';
  ctx2d.beginPath();
  ctx2d.arc(-4, -7, 3.5, 0, Math.PI * 2);
  ctx2d.arc(4, -7, 3.5, 0, Math.PI * 2);
  ctx2d.fill();

  ctx2d.fillStyle = '#1e293b';
  ctx2d.beginPath();
  ctx2d.arc(-4, -7, 1.8, 0, Math.PI * 2);
  ctx2d.arc(4, -7, 1.8, 0, Math.PI * 2);
  ctx2d.fill();

  ctx2d.fillStyle = '#f9a8d4';
  ctx2d.beginPath();
  ctx2d.arc(-8, -3, 2.2, 0, Math.PI * 2);
  ctx2d.arc(8, -3, 2.2, 0, Math.PI * 2);
  ctx2d.fill();

  ctx2d.restore();

  if(game.running){
    gameAnimId = requestAnimationFrame(gameLoop);
  }
}

function endGame(){
  game.running=false;
  if(gameAnimId)cancelAnimationFrame(gameAnimId);
  gameAnimId=null;
  if(!ctx2d)return;
  const W=canvas.width,H=canvas.height;
  ctx2d.fillStyle='rgba(10, 14, 28, 0.85)';
  ctx2d.fillRect(0,0,W,H);
  ctx2d.fillStyle='#fbbf24';
  ctx2d.font='bold 26px "Baloo 2", cursive';
  ctx2d.textAlign='center';
  ctx2d.fillText('Game Over! 💤',W/2,H/2-30);
  ctx2d.fillStyle='#ffffff';
  ctx2d.font='bold 17px "Nunito", sans-serif';
  ctx2d.fillText('Score: '+game.score+'  |  Best: '+game.hi,W/2,H/2+8);
  ctx2d.fillStyle='#94a3b8';
  ctx2d.font='14px "Nunito", sans-serif';
  ctx2d.fillText('Tap "Restart Game" to play again! ✨',W/2,H/2+38);
  const startBtn=document.getElementById('game-start-btn');
  if(startBtn)startBtn.textContent='Restart Game 🚀';
}

const gameStartBtn=document.getElementById('game-start-btn');
if(gameStartBtn)gameStartBtn.addEventListener('click',()=>{
  if(currentTab!=='play')switchTab('play');
  startGame();
});

if(canvas){
  canvas.addEventListener('pointerdown',e=>{
    gameInputX=e.clientX;
  });
  canvas.addEventListener('pointermove',e=>{
    if(game.running)gameInputX=e.clientX;
  });
  canvas.addEventListener('touchstart',e=>{
    if(e.touches.length>0)gameInputX=e.touches[0].clientX;
  },{passive:true});
  canvas.addEventListener('touchmove',e=>{
    if(e.touches.length>0){
      e.preventDefault();
      gameInputX=e.touches[0].clientX;
    }
  },{passive:false});
}

document.addEventListener('keydown',e=>{
  if(currentTab!=='play'||!game.running)return;
  if(e.key==='ArrowLeft'){
    gameInputX=null;
    game.basket.x-=28;
    game.basket.tilt=-0.18;
  }
  if(e.key==='ArrowRight'){
    gameInputX=null;
    game.basket.x+=28;
    game.basket.tilt=0.18;
  }
});

// ---- Guestbook ----
const EMOJIS=['⭐','🌙','💤','🎵','💙','🌸','🌊','✨','🌟','🎶','🌈','🫧'];
const emojiPickerEl=document.getElementById('emoji-picker');
let selectedEmoji='⭐';

if(emojiPickerEl){
  EMOJIS.forEach(em=>{
    const btn=document.createElement('button');
    btn.className='emoji-opt'+(em===selectedEmoji?' selected':'');
    btn.textContent=em;
    btn.addEventListener('click',()=>{
      selectedEmoji=em;
      document.querySelectorAll('.emoji-opt').forEach(e=>e.classList.remove('selected'));
      btn.classList.add('selected');
    });
    emojiPickerEl.appendChild(btn);
  });
}

export async function loadGuestbook(){
  const container=document.getElementById('guest-entries');
  if(!container)return;
  try{
    const r=await fetch('/api/guestbook');
    const entries=await r.json();
    if(entries.length===0){
      container.innerHTML='<div style="text-align:center;opacity:0.5;padding:24px;font-size:0.85rem;">Be the first to leave a dream! 🌙</div>';
      return;
    }
    container.innerHTML='';
    entries.forEach(e=>{
      const div=document.createElement('div');
      div.className='guest-entry';
      const date=new Date(e.time).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
      div.innerHTML='<div class="entry-emoji">'+e.emoji+'</div><div class="entry-body"><div class="entry-name">'+esc(e.name)+'</div><div class="entry-msg">'+esc(e.message)+'</div><div class="entry-time">'+date+'</div></div>';
      container.appendChild(div);
    });
  }catch(err){
    container.innerHTML='<div style="text-align:center;opacity:0.5;padding:24px;font-size:0.85rem;">Could not load dreams 😢</div>';
  }
}

function esc(s){
  return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

const submitBtn=document.getElementById('submit-guest');
if(submitBtn){
  submitBtn.addEventListener('click',async()=>{
    const nameEl=document.getElementById('g-name');
    const msgEl=document.getElementById('g-msg');
    const name=nameEl.value.trim(),message=msgEl.value.trim();
    if(!name||!message){
      if(!name)nameEl.style.borderColor='#f87171';
      if(!message)msgEl.style.borderColor='#f87171';
      return;
    }
    nameEl.style.borderColor='';msgEl.style.borderColor='';
    submitBtn.textContent='Sending... 💫';submitBtn.disabled=true;
    try{
      const r=await fetch('/api/guestbook',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,message,emoji:selectedEmoji})});
      if(r.ok){
        nameEl.value='';msgEl.value='';
        submitBtn.textContent='✨ Dream Sent!';
        setTimeout(()=>{submitBtn.textContent='✨ Sign the Guestbook';submitBtn.disabled=false;},2000);
        await loadGuestbook();
      }else{submitBtn.textContent='❌ Try again';submitBtn.disabled=false;}
    }catch(err){submitBtn.textContent='❌ Try again';submitBtn.disabled=false;}
  });
}

// ---- Easter Egg ----
let easterShakes=0,easterTimer;
const easterEggEl=document.getElementById('easter-egg');
const eggModal=document.getElementById('egg-modal');
const modalCloseEl=document.getElementById('modal-close');

if(easterEggEl)setTimeout(()=>easterEggEl.classList.add('visible'),8000);

if(easterEggEl){
  easterEggEl.addEventListener('click',()=>{
    easterShakes++;
    easterEggEl.style.animation='none';
    void easterEggEl.offsetWidth;
    easterEggEl.style.animation='egg-wobble 0.3s ease-in-out';
    clearTimeout(easterTimer);
    easterTimer=setTimeout(()=>{easterEggEl.style.animation='egg-wobble 2s ease-in-out infinite';},400);
    if(easterShakes>=3){openEggModal();easterShakes=0;}
  });
}

function openEggModal(){
  if(!eggModal)return;
  eggModal.classList.add('open');
  launchConfetti();
  if(!sfxMuted){
    try{
      const c=new AudioContext();
      [523,659,784,1047].forEach((f,i)=>{
        const o=c.createOscillator(),g=c.createGain();
        o.type='triangle';o.frequency.value=f;
        g.gain.setValueAtTime(.001,c.currentTime+i*.1);
        g.gain.linearRampToValueAtTime(.1,c.currentTime+i*.1+.05);
        g.gain.exponentialRampToValueAtTime(.001,c.currentTime+i*.1+.3);
        o.connect(g).connect(c.destination);
        o.start(c.currentTime+i*.1);o.stop(c.currentTime+i*.1+.35);
      });
      setTimeout(()=>c.close(),2000);
    }catch(e){}
  }
}

if(modalCloseEl)modalCloseEl.addEventListener('click',()=>{if(eggModal)eggModal.classList.remove('open');});
if(eggModal)eggModal.addEventListener('click',e=>{if(e.target===eggModal)eggModal.classList.remove('open');});

function launchConfetti(){
  const wrap=document.getElementById('confetti-wrap');
  if(!wrap)return;
  wrap.innerHTML='';
  const colors=['#a78bfa','#60a5fa','#34d399','#fbbf24','#f87171','#f9b6c8'];
  for(let i=0;i<40;i++){
    const el=document.createElement('div');
    el.className='confetti-piece';
    const w=(6+Math.random()*6).toFixed(0),h=(6+Math.random()*6).toFixed(0);
    const br=Math.random()>.5?'50%':'2px';
    el.style.cssText='left:'+(Math.random()*100).toFixed(1)+'%;top:'+(-10-Math.random()*20).toFixed(1)+'%;background:'+colors[Math.floor(Math.random()*colors.length)]+';animation-duration:'+(.8+Math.random()).toFixed(2)+'s;animation-delay:'+(Math.random()*.5).toFixed(2)+'s;width:'+w+'px;height:'+h+'px;border-radius:'+br+';';
    wrap.appendChild(el);
  }
}
