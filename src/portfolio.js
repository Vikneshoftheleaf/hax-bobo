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

// ---- Interactive Bedtime Storybook & Dream Weaver ----
const STORY_PAGES=[
  {
    iconSvg:'<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
    title:'In the Beginning...',
    text:'Before there were dreams, the cosmos was quiet — a little too quiet. Stars flickered softly, waiting for someone to weave warm dreams beneath them.',
    widgetType:'constellation'
  },
  {
    iconSvg:'<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="15" cy="9" r="1.5" fill="currentColor"/><path d="M18.36 5.64A9 9 0 0 1 20 12"/></svg>',
    title:'A Bubble Appears',
    text:'One gentle twilight, a luminous bubble floated up from the Dream River. It wobbled, spun with starlight, and then — POP! Out tumbled baby Bobo, already yawning.',
    widgetType:'bubbles'
  },
  {
    iconSvg:'<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M8 5.5a2.5 2.5 0 0 1 2.5 2.5"/><path d="M16 5.5a2.5 2.5 0 0 0-2.5 2.5"/><circle cx="9.5" cy="12.5" r="1.3" fill="currentColor"/><circle cx="14.5" cy="12.5" r="1.3" fill="currentColor"/><path d="M10 16a2 2 0 0 0 4 0"/></svg>',
    title:'Sky-Blue and Squishy',
    text:'Bobo was sky-blue, round, and wonderfully squishy. Two giant starry eyes blinked at the moon. "Hello world," said Bobo softly. "I\'m ready to make dreams cozy."',
    widgetType:'squishy'
  },
  {
    iconSvg:'<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/></svg>',
    title:'The First Assignment',
    text:'The Great Starkeeper smiled and gave Bobo a pouch of glowing dream seeds. "Plant these in peaceful minds," she whispered. "Make every night safe and kind."',
    widgetType:'seeds'
  },
  {
    iconSvg:'<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    title:'The Lullaby Lab',
    text:'Bobo built a tiny workshop on a pastel cloud, filling it with crystal chimes and music boxes. Every night, Bobo composes gentle songs that drift down like sweet snow.',
    widgetType:'chimes'
  },
  {
    iconSvg:'<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    title:'Dream Delivery Routes',
    text:'Bobo takes flight across the slumbering world, tucking tiny dream packages onto every windowsill. Not a single little dreamer is ever forgotten.',
    widgetType:'cottages'
  },
  {
    iconSvg:'<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="4"/></svg>',
    title:'The Journey Continues',
    text:'At dawn, Bobo counts all the peaceful smiles of children and sleepy creatures everywhere. Then, with a happy yawn, Bobo curls up for a cozy daytime nap.',
    widgetType:'wish'
  },
];

let currentPage=0;
const bookContainer=document.getElementById('book-container');
const prevBtn=document.getElementById('prev-page');
const nextBtn=document.getElementById('next-page');
const dotsContainer=document.getElementById('page-dots');
const storyProgressBar=document.getElementById('story-progress-fill');
const storyProgressLabel=document.getElementById('story-progress-label');

// Web Audio synthesizer tone generator for storybook
function playChimeNote(freq=440, type='triangle', dur=0.8){
  if(sfxMuted)return;
  try{
    const ctx=new (window.AudioContext||window.webkitAudioContext)();
    const t=ctx.currentTime;
    const osc=ctx.createOscillator(), g=ctx.createGain();
    osc.type=type;
    osc.frequency.setValueAtTime(freq,t);
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(0.2,t+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t+dur);
    setTimeout(()=>ctx.close(),(dur*1000)+200);
  }catch(e){}
}

// Build interactive widget HTML for each page
function getPageWidgetHTML(type){
  if(type==='constellation'){
    return `
      <div class="page-interactive-box">
        <span class="interactive-box-tag">✦ Touch to Awaken Constellations</span>
        <div class="constellation-stage" id="constellation-stage">
          <div class="star-node" data-star="peace"><span class="star-icon">⭐</span><span class="star-label">Peace</span></div>
          <div class="star-node" data-star="wonder"><span class="star-icon">🌟</span><span class="star-label">Wonder</span></div>
          <div class="star-node" data-star="warmth"><span class="star-icon">✨</span><span class="star-label">Warmth</span></div>
          <div class="star-node" data-star="dreams"><span class="star-icon">🌙</span><span class="star-label">Dreams</span></div>
        </div>
        <div class="constellation-reward" id="constellation-reward" style="display:none;">
          <span>✨ Constellation Awakened: The Sky is Glowingly Cozy!</span>
        </div>
      </div>
    `;
  }
  if(type==='bubbles'){
    return `
      <div class="page-interactive-box">
        <span class="interactive-box-tag">🫧 Pop the Dream Bubbles</span>
        <div class="bubbles-stage" id="bubbles-stage">
          <div class="dream-bubble" data-msg="A cozy yawn~ 💤">🫧</div>
          <div class="dream-bubble" data-msg="Warm starlight! ⭐">🫧</div>
          <div class="dream-bubble" data-msg="Sweet dreams for all! 💖">🫧</div>
          <div class="dream-bubble" data-msg="POP! Bobo says hi! 💙">🫧</div>
        </div>
        <div class="bubble-msg" id="bubble-msg">Tap any bubble to see what is inside!</div>
      </div>
    `;
  }
  if(type==='squishy'){
    return `
      <div class="page-interactive-box">
        <span class="interactive-box-tag">💙 Squish &amp; Hug Baby Bobo</span>
        <div class="squishy-stage">
          <svg class="squishy-mini-bobo" id="squishy-bobo-avatar" viewBox="0 0 100 100">
            <defs>
              <radialGradient id="miniBoboGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stop-color="#9dd0ff"/>
                <stop offset="100%" stop-color="#5fa8ee"/>
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="42" fill="url(#miniBoboGrad)" stroke="#3a82ce" stroke-width="3"/>
            <circle cx="36" cy="46" r="6" fill="#1e293b"/>
            <circle cx="64" cy="46" r="6" fill="#1e293b"/>
            <circle cx="34" cy="44" r="2" fill="#ffffff"/>
            <circle cx="62" cy="44" r="2" fill="#ffffff"/>
            <circle cx="28" cy="56" r="5" fill="#f472b6" opacity="0.6"/>
            <circle cx="72" cy="56" r="5" fill="#f472b6" opacity="0.6"/>
            <path id="mini-mouth" d="M43 56 Q50 63 57 56" fill="none" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
          </svg>
          <div class="squishy-chips">
            <button class="squish-chip" data-act="pet">Gently Pet 🐾</button>
            <button class="squish-chip" data-act="boop">Cute Boop 🌸</button>
            <button class="squish-chip" data-act="hug">Warm Hug 🤗</button>
          </div>
          <div class="squish-speech" id="squish-speech">Touch Bobo to feel how squishy he is!</div>
        </div>
      </div>
    `;
  }
  if(type==='seeds'){
    return `
      <div class="page-interactive-box">
        <span class="interactive-box-tag">🌱 Plant a Dream Seed</span>
        <div class="seeds-stage">
          <button class="seed-chip" data-seed="Sweet Dreams">🌸 Sweet Dreams</button>
          <button class="seed-chip" data-seed="Gentle Courage">⭐ Gentle Courage</button>
          <button class="seed-chip" data-seed="Starlight Joy">✨ Starlight Joy</button>
        </div>
        <div class="seed-blossom" id="seed-blossom">Pick a seed to plant in tonight's clouds!</div>
      </div>
    `;
  }
  if(type==='chimes'){
    return `
      <div class="page-interactive-box">
        <span class="interactive-box-tag">🎶 Play Bobo's Crystal Chimes</span>
        <div class="chimes-stage">
          <div class="chime-bars-wrap">
            <div class="chime-key" data-freq="261.63"><span class="chime-note">Do</span><span class="chime-label">C4</span></div>
            <div class="chime-key" data-freq="293.66"><span class="chime-note">Re</span><span class="chime-label">D4</span></div>
            <div class="chime-key" data-freq="329.63"><span class="chime-note">Mi</span><span class="chime-label">E4</span></div>
            <div class="chime-key" data-freq="392.00"><span class="chime-note">Sol</span><span class="chime-label">G4</span></div>
            <div class="chime-key" data-freq="440.00"><span class="chime-note">La</span><span class="chime-label">A4</span></div>
          </div>
          <button class="chime-sample-btn" id="play-lullaby-melody">🎵 Play Bobo's Melody</button>
        </div>
      </div>
    `;
  }
  if(type==='cottages'){
    return `
      <div class="page-interactive-box">
        <span class="interactive-box-tag">🏠 Tap Windows to Deliver Dreams</span>
        <div class="cottages-stage">
          <div class="cottage-card" data-cottage="kittens">
            <span class="cottage-icon">🐱</span>
            <span class="cottage-name">Kitten Nook</span>
            <span class="cottage-status">Waiting 💤</span>
          </div>
          <div class="cottage-card" data-cottage="puppies">
            <span class="cottage-icon">🐶</span>
            <span class="cottage-name">Puppy Burrow</span>
            <span class="cottage-status">Waiting 💤</span>
          </div>
          <div class="cottage-card" data-cottage="bears">
            <span class="cottage-icon">🐻</span>
            <span class="cottage-name">Bear Cub Den</span>
            <span class="cottage-status">Waiting 💤</span>
          </div>
        </div>
      </div>
    `;
  }
  if(type==='wish'){
    return `
      <div class="page-interactive-box">
        <span class="interactive-box-tag">✨ Release a Bedtime Wish Lantern</span>
        <div class="wish-stage">
          <div class="wish-pills">
            <button class="wish-pill selected" data-wish="Cozy sweet dreams">Cozy sweet dreams 🌙</button>
            <button class="wish-pill" data-wish="A joyful tomorrow">A joyful tomorrow ☀️</button>
            <button class="wish-pill" data-wish="Warm hugs for everyone">Warm hugs for all 💖</button>
          </div>
          <div class="wish-action-wrap">
            <input type="text" id="custom-wish-input" class="wish-input" placeholder="Or write your own wish..." maxlength="45"/>
            <button class="wish-send-btn" id="send-wish-btn">Send ✨</button>
          </div>
          <div class="wish-feedback" id="wish-feedback">Make a wish for someone you care about tonight.</div>
        </div>
      </div>
    `;
  }
  return '';
}

// Bind live interactive logic to widgets on the page
function initPageWidgetEvents(pageEl, widgetType){
  if(widgetType==='constellation'){
    const nodes=pageEl.querySelectorAll('.star-node');
    const reward=pageEl.querySelector('#constellation-reward');
    let litCount=0;
    nodes.forEach((node,idx)=>{
      node.addEventListener('click',()=>{
        if(node.classList.contains('lit'))return;
        node.classList.add('lit');
        litCount++;
        playChimeNote(350 + idx * 90);
        clickSFX();
        if(litCount===nodes.length && reward){
          reward.style.display='flex';
          playChimeNote(660,'triangle',1.2);
        }
      });
    });
  } else if(widgetType==='bubbles'){
    const bubbles=pageEl.querySelectorAll('.dream-bubble');
    const msg=pageEl.querySelector('#bubble-msg');
    let popped=0;
    bubbles.forEach(bubble=>{
      bubble.addEventListener('click',()=>{
        if(bubble.classList.contains('popped'))return;
        bubble.classList.add('popped');
        popped++;
        playChimeNote(480 + popped * 80, 'sine', 0.4);
        if(msg) msg.textContent=bubble.dataset.msg;
        if(popped===bubbles.length && msg){
          setTimeout(()=>{
            msg.textContent="✨ All dreams revealed! Bobo loves you!";
          }, 900);
        }
      });
    });
  } else if(widgetType==='squishy'){
    const bobo=pageEl.querySelector('#squishy-bobo-avatar');
    const speech=pageEl.querySelector('#squish-speech');
    const chips=pageEl.querySelectorAll('.squish-chip');
    const phrases={
      pet: ["Purrr... so cozy!", "Warm gentle pets!", "Love you, bestie! 💖"],
      boop: ["Boop! Hehe!", "Tickly nose!", "Aww, you're sweet! 🌸"],
      hug: ["Big squishy hug!", "Warm and safe!", "You are wonderful! 🤗"]
    };
    function triggerSquish(act){
      if(!bobo)return;
      bobo.style.transform='scale(0.85, 1.25)';
      setTimeout(()=>{bobo.style.transform='scale(1.15, 0.9)';},120);
      setTimeout(()=>{bobo.style.transform='scale(1)';},260);
      playChimeNote(act==='pet'?440:act==='boop'?660:523,'sine',0.35);
      if(speech){
        const list=phrases[act]||phrases.pet;
        speech.textContent=list[Math.floor(Math.random()*list.length)];
      }
    }
    if(bobo) bobo.addEventListener('click',()=>triggerSquish('pet'));
    chips.forEach(c=>c.addEventListener('click',()=>triggerSquish(c.dataset.act)));
  } else if(widgetType==='seeds'){
    const chips=pageEl.querySelectorAll('.seed-chip');
    const blossom=pageEl.querySelector('#seed-blossom');
    chips.forEach((c,i)=>{
      c.addEventListener('click',()=>{
        chips.forEach(other=>other.classList.remove('planted'));
        c.classList.add('planted');
        playChimeNote(400 + i * 120, 'triangle', 0.9);
        if(blossom){
          blossom.textContent=`🌸 Beautiful! The ${c.dataset.seed} flower is glowing in the night sky!`;
        }
      });
    });
  } else if(widgetType==='chimes'){
    const keys=pageEl.querySelectorAll('.chime-key');
    const sampleBtn=pageEl.querySelector('#play-lullaby-melody');
    keys.forEach(k=>{
      k.addEventListener('click',()=>{
        const freq=+k.dataset.freq;
        k.classList.add('sounding');
        setTimeout(()=>k.classList.remove('sounding'),250);
        playChimeNote(freq,'triangle',1.1);
      });
    });
    if(sampleBtn){
      sampleBtn.addEventListener('click',()=>{
        const notes=[261.63, 329.63, 392.00, 440.00, 392.00, 329.63, 261.63];
        notes.forEach((freq,idx)=>{
          setTimeout(()=>{
            playChimeNote(freq,'triangle',0.8);
            const matchingKey=[...keys].find(k=>Math.abs(+k.dataset.freq-freq)<2);
            if(matchingKey){
              matchingKey.classList.add('sounding');
              setTimeout(()=>matchingKey.classList.remove('sounding'),220);
            }
          }, idx * 260);
        });
      });
    }
  } else if(widgetType==='cottages'){
    const cottages=pageEl.querySelectorAll('.cottage-card');
    cottages.forEach(c=>{
      c.addEventListener('click',()=>{
        if(c.classList.contains('delivered'))return;
        c.classList.add('delivered');
        const status=c.querySelector('.cottage-status');
        if(status) status.textContent="✨ Delivered!";
        playChimeNote(580,'sine',0.5);
      });
    });
  } else if(widgetType==='wish'){
    const pills=pageEl.querySelectorAll('.wish-pill');
    const input=pageEl.querySelector('#custom-wish-input');
    const sendBtn=pageEl.querySelector('#send-wish-btn');
    const feedback=pageEl.querySelector('#wish-feedback');
    let selectedWish="Cozy sweet dreams";
    pills.forEach(p=>{
      p.addEventListener('click',()=>{
        pills.forEach(other=>other.classList.remove('selected'));
        p.classList.add('selected');
        selectedWish=p.dataset.wish;
        if(input) input.value='';
        clickSFX();
      });
    });
    if(sendBtn){
      sendBtn.addEventListener('click',()=>{
        const wishText=(input&&input.value.trim())?input.value.trim():selectedWish;
        playChimeNote(660,'triangle',1.2);
        if(feedback){
          feedback.textContent=`🌟 Lantern released for "${wishText}"! Bobo will watch over it tonight. 💤`;
        }
        if(input) input.value='';
      });
    }
  }
}

function buildStorybook(){
  if(!bookContainer)return;
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
    const widgetHTML=getPageWidgetHTML(p.widgetType);
    div.innerHTML=stars+'<span class="page-icon-badge">'+p.iconSvg+'</span><div class="page-title">'+p.title+'</div><div class="page-text">'+p.text+'</div>'+widgetHTML+'<div class="page-num">'+(i+1)+' / '+STORY_PAGES.length+'</div>';
    bookContainer.appendChild(div);
    initPageWidgetEvents(div, p.widgetType);
  });
  if(dotsContainer){
    dotsContainer.innerHTML='';
    STORY_PAGES.forEach((_,i)=>{
      const dot=document.createElement('div');
      dot.className='page-dot'+(i===0?' active':'');
      dot.addEventListener('click',()=>goToPage(i));
      dotsContainer.appendChild(dot);
    });
  }
  updateBookNav();
}

let isSliding=false;
function goToPage(newIdx){
  if(isSliding||newIdx===currentPage||newIdx<0||newIdx>=STORY_PAGES.length)return;
  isSliding=true;
  if(window.speechSynthesis&&window.speechSynthesis.speaking){
    window.speechSynthesis.cancel();
    updateNarrateButton(false);
  }
  const isNext=newIdx>currentPage;
  const allPages=bookContainer.querySelectorAll('.book-page');
  const oldP=allPages[currentPage], newP=allPages[newIdx];

  newP.style.transition='none';
  newP.style.transform=isNext?'translateX(100%)':'translateX(-100%)';
  newP.style.opacity='0';
  newP.offsetHeight;

  newP.style.transition='transform 0.38s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.35s ease';
  oldP.style.transition='transform 0.38s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.35s ease';

  oldP.style.transform=isNext?'translateX(-100%)':'translateX(100%)';
  oldP.style.opacity='0';
  oldP.classList.remove('active');

  newP.style.transform='translateX(0)';
  newP.style.opacity='1';
  newP.classList.add('active');

  currentPage=newIdx;
  updateBookNav();
  clickSFX();

  setTimeout(()=>{
    allPages.forEach((p,idx)=>{
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
  if(prevBtn) prevBtn.disabled=currentPage===0;
  if(nextBtn) nextBtn.disabled=currentPage===STORY_PAGES.length-1;
  document.querySelectorAll('.page-dot').forEach((d,i)=>d.classList.toggle('active',i===currentPage));
  if(storyProgressBar){
    const pct=((currentPage+1)/STORY_PAGES.length)*100;
    storyProgressBar.style.width=pct+'%';
  }
  if(storyProgressLabel){
    storyProgressLabel.textContent=`Page ${currentPage+1} of ${STORY_PAGES.length}`;
  }
}

if(prevBtn) prevBtn.addEventListener('click',()=>goToPage(currentPage-1));
if(nextBtn) nextBtn.addEventListener('click',()=>goToPage(currentPage+1));

document.addEventListener('keydown',e=>{
  if(currentTab!=='story')return;
  if(e.key==='ArrowRight'||e.key==='ArrowDown')goToPage(currentPage+1);
  if(e.key==='ArrowLeft'||e.key==='ArrowUp')goToPage(currentPage-1);
});

let storyTouchX=null;
const storyPageEl=document.getElementById('page-story');
if(storyPageEl){
  storyPageEl.addEventListener('touchstart',e=>{storyTouchX=e.touches[0].clientX;},{passive:true});
  storyPageEl.addEventListener('touchend',e=>{
    if(storyTouchX===null)return;
    const dx=e.changedTouches[0].clientX-storyTouchX;
    if(Math.abs(dx)>40){if(dx<0)goToPage(currentPage+1);else goToPage(currentPage-1);}
    storyTouchX=null;
  });
}

// Narration & Story Controls
const storyReadBtn=document.getElementById('story-read-btn');
const readBtnText=document.getElementById('read-btn-text');
function updateNarrateButton(isSpeaking){
  if(storyReadBtn) storyReadBtn.classList.toggle('active', isSpeaking);
  if(readBtnText) readBtnText.textContent=isSpeaking?'Stop':'Listen Aloud';
}

function narrateCurrentPage(){
  if(!('speechSynthesis' in window)){
    alert('Text-to-speech is not supported by your browser.');
    return;
  }
  if(window.speechSynthesis.speaking){
    window.speechSynthesis.cancel();
    updateNarrateButton(false);
    return;
  }
  const page=STORY_PAGES[currentPage];
  const utter=new SpeechSynthesisUtterance(`${page.title}. ${page.text}`);
  utter.rate=0.92;
  utter.pitch=1.15;
  const voices=window.speechSynthesis.getVoices();
  const sweetVoice=voices.find(v=>v.lang.startsWith('en')&&(v.name.includes('Natural')||v.name.includes('Samantha')||v.name.includes('Google')||v.name.includes('Zira')));
  if(sweetVoice) utter.voice=sweetVoice;

  utter.onstart=()=>{
    updateNarrateButton(true);
    const pageText=bookContainer.querySelector('.book-page.active .page-text');
    if(pageText) pageText.classList.add('reading-highlight');
  };
  utter.onend=()=>{
    updateNarrateButton(false);
    document.querySelectorAll('.page-text').forEach(t=>t.classList.remove('reading-highlight'));
  };
  utter.onerror=()=>{
    updateNarrateButton(false);
    document.querySelectorAll('.page-text').forEach(t=>t.classList.remove('reading-highlight'));
  };
  window.speechSynthesis.speak(utter);
}

if(storyReadBtn) storyReadBtn.addEventListener('click', narrateCurrentPage);

// Auto-Turn Mode
let autoTurnTimer=null;
let isAutoTurning=false;
const storyAutoBtn=document.getElementById('story-auto-btn');
const autoBtnText=document.getElementById('auto-btn-text');
if(storyAutoBtn){
  storyAutoBtn.addEventListener('click',()=>{
    isAutoTurning=!isAutoTurning;
    storyAutoBtn.classList.toggle('active', isAutoTurning);
    if(autoBtnText) autoBtnText.textContent=isAutoTurning?'Pause':'Auto-Turn';
    if(isAutoTurning){
      autoTurnTimer=setInterval(()=>{
        if(!isAutoTurning)return;
        if(currentPage>=STORY_PAGES.length-1){
          goToPage(0);
        } else {
          goToPage(currentPage+1);
        }
      }, 5500);
    } else {
      if(autoTurnTimer){ clearInterval(autoTurnTimer); autoTurnTimer=null; }
    }
  });
}

// Background Lullaby Chimes
let storyChimesTimer=null;
let isStoryChimesActive=false;
const storyMusicBtn=document.getElementById('story-music-btn');
if(storyMusicBtn){
  storyMusicBtn.addEventListener('click',()=>{
    isStoryChimesActive=!isStoryChimesActive;
    storyMusicBtn.classList.toggle('active', isStoryChimesActive);
    if(isStoryChimesActive){
      const chord=[523.25, 659.25, 783.99, 987.77, 783.99, 659.25];
      let step=0;
      storyChimesTimer=setInterval(()=>{
        if(!isStoryChimesActive)return;
        playChimeNote(chord[step % chord.length], 'sine', 0.9);
        step++;
      }, 850);
    } else {
      if(storyChimesTimer){ clearInterval(storyChimesTimer); storyChimesTimer=null; }
    }
  });
}

// Mode Switcher: Origin Flipbook vs Dream Weaver Studio
const modeFlipbookBtn=document.getElementById('mode-flipbook');
const modeWeaverBtn=document.getElementById('mode-weaver');
const flipbookView=document.getElementById('story-flipbook-view');
const weaverView=document.getElementById('story-weaver-view');

if(modeFlipbookBtn&&modeWeaverBtn){
  modeFlipbookBtn.addEventListener('click',()=>{
    modeFlipbookBtn.classList.add('active');
    modeFlipbookBtn.setAttribute('aria-selected','true');
    modeWeaverBtn.classList.remove('active');
    modeWeaverBtn.setAttribute('aria-selected','false');
    if(flipbookView) flipbookView.style.display='flex';
    if(weaverView) weaverView.style.display='none';
    clickSFX();
  });
  modeWeaverBtn.addEventListener('click',()=>{
    modeWeaverBtn.classList.add('active');
    modeWeaverBtn.setAttribute('aria-selected','true');
    modeFlipbookBtn.classList.remove('active');
    modeFlipbookBtn.setAttribute('aria-selected','false');
    if(flipbookView) flipbookView.style.display='none';
    if(weaverView) weaverView.style.display='block';
    clickSFX();
  });
}

// =============================================
// DREAM WEAVER STUDIO WIDGET (BEDTIME STORY CO-CREATOR)
// =============================================
let weaverState = {
  realm: 'cloud',
  companion: 'owl',
  quest: 'stardust',
  currentTale: null
};

// Option selectors
function setupWeaverOptionGroup(containerId, stateKey){
  const container=document.getElementById(containerId);
  if(!container)return;
  const opts=container.querySelectorAll('.weaver-opt');
  opts.forEach(opt=>{
    opt.addEventListener('click',()=>{
      opts.forEach(o=>o.classList.remove('active'));
      opt.classList.add('active');
      weaverState[stateKey]=opt.dataset.val;
      clickSFX();
    });
  });
}
setupWeaverOptionGroup('weaver-realms', 'realm');
setupWeaverOptionGroup('weaver-companions', 'companion');
setupWeaverOptionGroup('weaver-quests', 'quest');

const weaverGenerateBtn=document.getElementById('weaver-generate-btn');
const weaverTheatre=document.getElementById('weaver-theatre');
const theatreTitleTag=document.getElementById('theatre-title-tag');
const theatreStoryTitle=document.getElementById('theatre-story-title');
const theatreStoryProse=document.getElementById('theatre-story-prose');
const theatreChoiceBox=document.getElementById('theatre-choice-box');
const choicePrompt=document.getElementById('choice-prompt');
const choiceButtons=document.getElementById('choice-buttons');
const theatreEnding=document.getElementById('theatre-ending');
const endingBlessing=document.getElementById('ending-blessing');
const theatreNarrateBtn=document.getElementById('theatre-narrate-btn');
const theatreCopyBtn=document.getElementById('theatre-copy-btn');
const tuckBoboBtn=document.getElementById('tuck-bobo-btn');
const remixStoryBtn=document.getElementById('remix-story-btn');

const WEAVER_DATA = {
  realms: {
    cloud: { name: 'Cloud Meadow', icon: '🌌', desc: 'floating lavender clouds where starlight collects like warm morning dew' },
    ocean: { name: 'Moonlit Bay', icon: '🌊', desc: 'gently rolling waters of crystal blue that glow softly under the full moon' },
    castle: { name: 'Pillow Fortress', icon: '🏰', desc: 'a castle made of cozy down quilts, fairy lights, and steaming mugs of cocoa' },
    forest: { name: 'Starlight Grove', icon: '🌸', desc: 'an enchanted forest of singing bluebells, glowing moss, and sleepy fireflies' }
  },
  companions: {
    owl: { name: 'Pip the Star Owl', icon: '🦉', desc: 'who fluffs his soft feathers and knows all the universe\'s kindest lullabies' },
    kitten: { name: 'Mochi the Cloud Kitten', icon: '🐱', desc: 'who purrs in perfect soothing harmony with the cosmic tides' },
    fox: { name: 'Bramble the Star Fox', icon: '🦊', desc: 'with a warm bushy tail and a lantern that banishes all night worries' },
    bunny: { name: 'Fluff the Moon Bunny', icon: '🐰', desc: 'who hops from star to star making sure every dreamer is tucked in snugly' }
  },
  quests: {
    stardust: {
      name: 'Catching Lost Stardust',
      act1: 'Tonight, golden dust from a wandering comet drifted down across the sky. Little dreamers below needed a sprinkle of light to guide their happy dreams.',
      act2: 'Bobo and companion set out with a silver net woven of moonbeams, catching shimmering sparks of starlight that giggled like tiny chime bells.',
      choicePrompt: 'How should Bobo share the gathered stardust?',
      choices: [
        { label: '✨ Scatter stardust gently across bedroom skylights', result: 'Bobo blew a soft breath across the silver net. The stardust floated down in a glittering cascade, settling over every rooftop so children would dream of magical starry adventures.' },
        { label: '🌟 Mold into warm personal nightlights for every bed', result: 'With a happy chirp, Bobo gently rolled the sparkles into glowing little celestial marbles, placing one at every window. Their gentle golden glow warmed the night all till morning.' }
      ]
    },
    lullaby: {
      name: 'Composing the World\'s Softest Lullaby',
      act1: 'The evening breeze was quiet, but something was missing from tonight\'s bedtime: the world needed a brand new lullaby to soothe restless hearts.',
      act2: 'Bobo sat atop a puffy cloud with companion, listening to the gentle pitter-patter of starlight and the warm rhythm of quiet breathing below.',
      choicePrompt: 'Which instrument should Bobo blend into the melody?',
      choices: [
        { label: '🔔 Crystal music box chimes with soft raindrops', result: 'Bobo wound up the miniature celestial music box. Tinkling glass-like notes mingled with the patter of sweet night rain, coaxing even the most energetic kittens into deep, blissful slumber.' },
        { label: '🎶 A soft hummed baby melody carried by the warm breeze', result: 'Bobo hummed a tender, loving melody in his soft baby voice. The warm breeze carried his gentle hum through every bedroom window, wrapping every sleeping heart in cozy comfort.' }
      ]
    },
    tea: {
      name: 'Brewing Sweet Chamomile Moon Tea',
      act1: 'The nighttime chill had settled softly, and the sleepy creatures of the valley were yearning for a warm, fragrant sip before tucking into bed.',
      act2: 'Bobo gathered fresh star-blossoms while companion carefully steeped them in sweet, warmed moon milk inside a glowing clay teapot.',
      choicePrompt: 'What cozy secret ingredient should Bobo add?',
      choices: [
        { label: '🍯 A golden drizzle of honey from the Star Hive', result: 'Bobo swirled in a spoonful of glowing star-honey. The tea glowed with fragrant amber warmth, melting away all daytime worries with each sweet, comforting sip.' },
        { label: '🌿 A pinch of crushed lavender dream leaves', result: 'A sprinkle of lilac dream leaves turned the tea into a soothing, fragrant potion of pure relaxation. Heavy eyelids fluttered closed as contented smiles spread across every little face.' }
      ]
    },
    pillows: {
      name: 'Fluffing the Great Cloud Pillows',
      act1: 'Before the night shift could begin, the celestial dream beds needed proper fluffing. No dream could be truly sweet without the perfect cloud pillow!',
      act2: 'Bobo bounced happily from cloud to cloud with companion, giving each puffy cumulus cushion a loving, squishy hug until it was softer than velvet.',
      choicePrompt: 'How should Bobo give the pillows their final cozy touch?',
      choices: [
        { label: '🪶 Tuck in feathers of moonlight and sweet dreams', result: 'Bobo gently tucked glowing moonlight feathers into each pillow. The cushions sighed with absolute fluffiness, ready to cradle tired heads in cloud-soft embrace.' },
        { label: '⭐ Sprinkle them with starlight perfume that smells of vanilla', result: 'A delicate spray of vanilla starlight mist settled over the pillows. The soothing aroma filled the air, ensuring everyone who rested there drifted right into peaceful dreams.' }
      ]
    }
  }
};

function generateBedtimeStory(){
  const r=WEAVER_DATA.realms[weaverState.realm];
  const c=WEAVER_DATA.companions[weaverState.companion];
  const q=WEAVER_DATA.quests[weaverState.quest];
  if(!r||!c||!q)return;

  weaverState.currentTale={
    title: `Bobo and ${c.name} in the ${r.name}`,
    tag: `${r.icon} ${r.name} · ${q.name}`,
    prose: [
      `High above in the <strong>${r.name}</strong>, ${r.desc}. Baby Bobo opened his round, starry eyes with a tiny squeak and stretched his sky-blue arms.`,
      `Beside him fluttered <strong>${c.name}</strong>, ${c.desc}. Together, the two friends looked out at the peaceful world below.`,
      `${q.act1}`,
      `${q.act2}`
    ],
    choicePrompt: q.choicePrompt,
    choices: q.choices,
    selectedChoice: null
  };

  renderWeaverTheatre();
}

function renderWeaverTheatre(){
  if(!weaverTheatre||!weaverState.currentTale)return;
  const t=weaverState.currentTale;
  weaverTheatre.style.display='block';
  theatreTitleTag.textContent=t.tag;
  theatreStoryTitle.textContent=t.title;
  
  theatreStoryProse.innerHTML=t.prose.map(p=>`<p>${p}</p>`).join('');
  choicePrompt.textContent=t.choicePrompt;
  choiceButtons.innerHTML='';
  theatreEnding.style.display='none';

  t.choices.forEach((ch,idx)=>{
    const btn=document.createElement('button');
    btn.className='choice-btn';
    btn.innerHTML=ch.label;
    btn.addEventListener('click',()=>{
      t.selectedChoice=idx;
      choiceButtons.querySelectorAll('.choice-btn').forEach(b=>b.classList.remove('selected'));
      btn.classList.add('selected');
      playChimeNote(523 + idx * 130, 'triangle', 0.9);
      
      // Append conclusion
      theatreStoryProse.innerHTML=t.prose.map(p=>`<p>${p}</p>`).join('') + `<p style="color:var(--ink);font-weight:700;margin-top:10px;">${ch.result}</p>`;
      endingBlessing.innerHTML=`💤 Bobo whispers: <em>"Rest your sleepy eyes now, sweet friend. You are safe, kind, and deeply loved tonight. Sweet dreams!"</em> ⭐`;
      theatreEnding.style.display='flex';
      theatreEnding.scrollIntoView({behavior:'smooth',block:'nearest'});
    });
    choiceButtons.appendChild(btn);
  });

  weaverTheatre.scrollIntoView({behavior:'smooth',block:'nearest'});
  playChimeNote(523.25, 'triangle', 0.8);
}

if(weaverGenerateBtn){
  weaverGenerateBtn.addEventListener('click', generateBedtimeStory);
}

// Theatre Read Aloud
if(theatreNarrateBtn){
  theatreNarrateBtn.addEventListener('click',()=>{
    if(!('speechSynthesis' in window))return;
    if(window.speechSynthesis.speaking){
      window.speechSynthesis.cancel();
      theatreNarrateBtn.querySelector('span').textContent='Read Aloud';
      return;
    }
    if(!weaverState.currentTale)return;
    const text=theatreStoryTitle.textContent + '. ' + theatreStoryProse.textContent;
    const utter=new SpeechSynthesisUtterance(text);
    utter.rate=0.92;
    utter.pitch=1.12;
    utter.onstart=()=>theatreNarrateBtn.querySelector('span').textContent='Stop';
    utter.onend=()=>theatreNarrateBtn.querySelector('span').textContent='Read Aloud';
    utter.onerror=()=>theatreNarrateBtn.querySelector('span').textContent='Read Aloud';
    window.speechSynthesis.speak(utter);
  });
}

// Copy Story to Clipboard
if(theatreCopyBtn){
  theatreCopyBtn.addEventListener('click',()=>{
    if(!weaverState.currentTale)return;
    const fullText=theatreStoryTitle.textContent + '\n\n' + theatreStoryProse.textContent + '\n\n— A cozy bedtime tale co-created with Bobo ✨';
    navigator.clipboard.writeText(fullText).then(()=>{
      const btnSpan=theatreCopyBtn.querySelector('span');
      if(btnSpan) btnSpan.textContent='✨ Copied!';
      setTimeout(()=>{ if(btnSpan) btnSpan.textContent='Copy Tale'; }, 2000);
    });
  });
}

// Tuck Bobo in
if(tuckBoboBtn){
  tuckBoboBtn.addEventListener('click',()=>{
    playChimeNote(659.25, 'sine', 1.2);
    clickSFX();
    tuckBoboBtn.innerHTML='<span>💖 Tucked in! Bobo is snoring happily...</span>';
    tuckBoboBtn.disabled=true;
    setTimeout(()=>{
      tuckBoboBtn.innerHTML='<span>💤 Tuck Bobo in for Bed</span>';
      tuckBoboBtn.disabled=false;
    }, 3000);
  });
}

if(remixStoryBtn){
  remixStoryBtn.addEventListener('click',()=>{
    generateBedtimeStory();
  });
}

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
    const playSvg = playBtn.querySelector('.icon-play');
    const pauseSvg = playBtn.querySelector('.icon-pause');
    const textSpan = playBtn.querySelector('.synth-btn-text');
    if (playSvg) playSvg.style.display = 'none';
    if (pauseSvg) pauseSvg.style.display = 'inline-block';
    if (textSpan) textSpan.textContent = 'Pause Lullaby';
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
    const playSvg = playBtn.querySelector('.icon-play');
    const pauseSvg = playBtn.querySelector('.icon-pause');
    const textSpan = playBtn.querySelector('.synth-btn-text');
    if (playSvg) playSvg.style.display = 'inline-block';
    if (pauseSvg) pauseSvg.style.display = 'none';
    if (textSpan) textSpan.textContent = 'Play Melodic Lullaby';
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
  drawCanvasGameItem(ctx2d, {x: W/2 - 36, y: H/2 + 58, type: 'star', color: '#fde047'});
  drawCanvasGameItem(ctx2d, {x: W/2, y: H/2 + 58, type: 'moon', color: '#38bdf8'});
  drawCanvasGameItem(ctx2d, {x: W/2 + 36, y: H/2 + 58, type: 'heart', color: '#f43f5e'});
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
  const btnText=document.getElementById('game-btn-text');
  if(btnText)btnText.textContent='Restart Game';
  gameLoop();
}

function updateGameUI(){
  const gs=document.getElementById('game-score');
  const gl=document.getElementById('game-lives');
  const gh=document.getElementById('game-hi');
  if(gs)gs.textContent=game.score;
  if(gl){
    const heartSvg = '<svg class="hud-heart" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
    const emptyHeartSvg = '<svg class="hud-heart empty" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
    gl.innerHTML = heartSvg.repeat(Math.max(0, game.lives)) + emptyHeartSvg.repeat(Math.max(0, 3 - game.lives));
  }
  if(gh)gh.textContent=game.hi;
}

const ITEM_TYPES=[
  {type:'star',good:true,points:10,speed:2.0,color:'#fde047'},
  {type:'moon',good:true,points:20,speed:2.3,color:'#38bdf8'},
  {type:'spark',good:true,points:15,speed:1.8,color:'#c084fc'},
  {type:'super',good:true,points:30,speed:2.6,color:'#fbbf24'},
  {type:'heart',good:true,points:5,speed:2.0,isHeart:true,color:'#f43f5e'},
  {type:'lightning',good:false,points:0,speed:2.8,color:'#eab308'},
  {type:'cloud',good:false,points:0,speed:2.4,color:'#94a3b8'},
];

function drawCanvasGameItem(ctx, item) {
  ctx.save();
  ctx.translate(item.x, item.y);
  if (item.type === 'star' || item.type === 'super') {
    ctx.fillStyle = item.color || '#fde047';
    ctx.shadowColor = item.color || '#fde047';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    const spikes = 5, outerR = item.type === 'super' ? 14 : 11, innerR = item.type === 'super' ? 7 : 5.5;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const x = Math.cos(angle) * r, y = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  } else if (item.type === 'moon') {
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, 11, -Math.PI / 2, Math.PI / 2, false);
    ctx.bezierCurveTo(4, 7, 4, -7, 0, -11);
    ctx.closePath();
    ctx.fill();
  } else if (item.type === 'spark') {
    ctx.fillStyle = '#c084fc';
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.quadraticCurveTo(0, 0, 12, 0);
    ctx.quadraticCurveTo(0, 0, 0, 12);
    ctx.quadraticCurveTo(0, 0, -12, 0);
    ctx.quadraticCurveTo(0, 0, 0, -12);
    ctx.closePath();
    ctx.fill();
  } else if (item.type === 'heart') {
    ctx.fillStyle = '#f43f5e';
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.bezierCurveTo(-8, -6, -12, 2, 0, 12);
    ctx.bezierCurveTo(12, 2, 8, -6, 0, 4);
    ctx.closePath();
    ctx.fill();
  } else if (item.type === 'lightning') {
    ctx.fillStyle = '#eab308';
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(2, -13);
    ctx.lineTo(-7, 0);
    ctx.lineTo(0, 0);
    ctx.lineTo(-2, 13);
    ctx.lineTo(7, -1);
    ctx.lineTo(0, -1);
    ctx.closePath();
    ctx.fill();
  } else if (item.type === 'cloud') {
    ctx.fillStyle = '#94a3b8';
    ctx.shadowColor = 'rgba(148, 163, 184, 0.4)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(-5, 2, 6, Math.PI * 0.5, Math.PI * 1.5);
    ctx.arc(0, -3, 8, Math.PI * 1, Math.PI * 2);
    ctx.arc(7, 2, 6, Math.PI * 1.5, Math.PI * 0.5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

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
    type: itemDef.type,
    color: itemDef.color,
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

  game.items = game.items.filter(item => {
    item.y += item.vy;
    drawCanvasGameItem(ctx2d, item);

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
  ctx2d.fillText('Game Over',W/2,H/2-30);
  ctx2d.fillStyle='#ffffff';
  ctx2d.font='bold 17px "Nunito", sans-serif';
  ctx2d.fillText('Score: '+game.score+'  |  Best: '+game.hi,W/2,H/2+8);
  ctx2d.fillStyle='#94a3b8';
  ctx2d.font='14px "Nunito", sans-serif';
  ctx2d.fillText('Tap "Restart Game" to play again!',W/2,H/2+38);
  const btnText=document.getElementById('game-btn-text');
  if(btnText)btnText.textContent='Restart Game';
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
      container.innerHTML='<div style="text-align:center;opacity:0.5;padding:24px;font-size:0.85rem;">Be the first to leave a dream!</div>';
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
    container.innerHTML='<div style="text-align:center;opacity:0.5;padding:24px;font-size:0.85rem;">Could not load dreams.</div>';
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
    const btnText=document.getElementById('submit-guest-text')||submitBtn;
    const name=nameEl.value.trim(),message=msgEl.value.trim();
    if(!name||!message){
      if(!name)nameEl.style.borderColor='#f87171';
      if(!message)msgEl.style.borderColor='#f87171';
      return;
    }
    nameEl.style.borderColor='';msgEl.style.borderColor='';
    btnText.textContent='Sending...';submitBtn.disabled=true;
    try{
      const r=await fetch('/api/guestbook',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,message,emoji:selectedEmoji})});
      if(r.ok){
        nameEl.value='';msgEl.value='';
        btnText.textContent='Dream Sent!';
        setTimeout(()=>{btnText.textContent='Sign the Guestbook';submitBtn.disabled=false;},2000);
        await loadGuestbook();
      }else{btnText.textContent='Try again';submitBtn.disabled=false;}
    }catch(err){btnText.textContent='Try again';submitBtn.disabled=false;}
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
