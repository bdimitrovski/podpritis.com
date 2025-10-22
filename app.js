
const LEADS_ENDPOINT = "https://formspree.io/f/xyznveoo";

(function(){
  function setPos(el,pct){ el.style.setProperty('--pos', pct.toFixed(2)+'%'); }
  function pctFromEvent(el,e){
    const rect = el.getBoundingClientRect();
    const t = e.touches && e.touches[0];
    const cx = t ? t.clientX : (e.clientX ?? rect.left);
    return Math.max(0, Math.min(100, ((cx - rect.left) / rect.width) * 100));
  }
  document.querySelectorAll('.ba').forEach(ba=>{
    const init = Number(ba.getAttribute('data-initial')||50);
    const handle = ba.querySelector('.handle');
    setPos(ba, init);
    let drag = false;
    const move  = e => { if(!drag) return; setPos(ba, pctFromEvent(ba, e)); };
    const start = e => { drag = true; setPos(ba, pctFromEvent(ba, e)); e.preventDefault(); };
    const end   = () => { drag = false; };

    ba.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);

    ba.addEventListener('touchstart', start, {passive:false});
    window.addEventListener('touchmove', move, {passive:false});
    window.addEventListener('touchend', end);
    window.addEventListener('touchcancel', end);

    if(handle){
      handle.addEventListener('keydown', e=>{
        if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
          const cur = parseFloat(getComputedStyle(ba).getPropertyValue('--pos')) || 50;
          const delta = e.key==='ArrowLeft' ? -2 : 2;
          setPos(ba, Math.max(0, Math.min(100, cur + delta)));
        }
      });
    }
  });
})();

(function () {
  const el = document.getElementById('rotator');
  if (!el) return;

  const words = Array.from(el.querySelectorAll('.word'));
  if (words.length <= 1) return;

  const MODE = 'random';
  const INTERVAL = 2300;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const effects = ['rotator--fade', 'rotator--slide', 'rotator--zoom'];
  let idx = 0, timer;

  function setEffectRandom() {
    el.classList.remove('rotator--fade', 'rotator--slide', 'rotator--zoom');
    const pick = effects[Math.floor(Math.random() * effects.length)];
    el.classList.add(pick);
  }

  function show(i) {
    words.forEach((w, j) => w.classList.toggle('is-visible', j === i));
  }

  function next() {
    if (MODE === 'random') setEffectRandom();

    const nextIdx = (idx + 1) % words.length;
    show(nextIdx);
    idx = nextIdx;
  }

  if (MODE === 'random') setEffectRandom();
  show(0);
  timer = setInterval(next, INTERVAL);

  el.addEventListener('mouseenter', () => clearInterval(timer));
  el.addEventListener('mouseleave', () => timer = setInterval(next, INTERVAL));
  el.addEventListener('focusin',   () => clearInterval(timer));
  el.addEventListener('focusout',  () => timer = setInterval(next, INTERVAL));
})();

const inputs = document.querySelectorAll('input, select, textarea');

  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      setTimeout(() => {
        input.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 300);
    });
  });

const toast = document.getElementById('toast');
function showToast(msg, type='success'){
  toast.textContent = msg;
  toast.className = 'toast show ' + type;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>{ toast.className = 'toast'; }, 4500);
}

const leadForm = document.getElementById('leadForm');
const formMsg  = document.getElementById('formMsg');
const toQuery  = obj => Object.entries(obj)
  .map(([k,v])=> encodeURIComponent(k)+'='+encodeURIComponent(v ?? ''))
  .join('&');

if(leadForm){
  leadForm.addEventListener('submit', async e=>{
    e.preventDefault();
    const btn = leadForm.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Šaljemo…';
    formMsg.textContent = '';

    const fd = new FormData(leadForm);
    const payload = {
      name:  (fd.get('name')   ||'').toString().trim(),
      email: (fd.get('email')  ||'').toString().trim(),
      service: fd.get('service')||'',
      city:    fd.get('city')   ||'',
      note:    fd.get('note')   ||'',
    };

    if(!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)){
      formMsg.innerHTML = '<span class="error">Molimo unesite ispravan email.</span>';
      showToast('Molimo unesite ispravan email.', 'error');
      btn.disabled = false; btn.textContent = 'Zatraži ponudu →';
      return;
    }

    try{
      const res = await fetch(LEADS_ENDPOINT, {
        method:'POST',
        headers:{
          'Content-Type':'application/x-www-form-urlencoded',
          'Accept':'application/json'
        },
        body: toQuery(payload),
        mode: 'cors'
      });

      if(!res.ok){ throw new Error('Greška ('+res.status+')'); }

      formMsg.innerHTML = '<span class="ok">Zahvaljujemo na upitu, uskoro ćemo vam se javiti za više detalja.</span>';
      showToast('Zahvaljujemo na upitu, uskoro ćemo vam se javiti za više detalja.', 'success');
      leadForm.reset();
    }catch(err){
      console.error(err);
      formMsg.innerHTML = '<span class="error">Došlo je do greške. Pokušaj kasnije ili piši na info@podpritis.com.</span>';
      showToast('Greška pri slanju — pokušaj ponovo ili piši na info@podpritis.com', 'error');
    }finally{
      btn.disabled = false; btn.textContent = 'Zatraži ponudu →';
    }
  });
}

(function(){
  const btn   = document.querySelector('.menu-toggle');
  const links = document.querySelectorAll('nav a');
  if(!btn) return;

  const set = open => {
    document.body.classList.toggle('nav-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  btn.addEventListener('click', ()=> set(!document.body.classList.contains('nav-open')));
  document.addEventListener('keydown', e => { if(e.key==='Escape') set(false); });
  links.forEach(a => a.addEventListener('click', ()=> set(false)));
})();

document.getElementById('y').textContent = new Date().getFullYear();

(function () {
  const wrap = document.getElementById('rotor');
  if (!wrap) return;

  const pron = wrap.querySelector('.pron');
  const noun = wrap.querySelector('.noun');

  const items = [
    { pron: 'tvoje', noun: 'dvorište' },
    { pron: 'tvoja', noun: 'fasada' },
    { pron: 'tvoj',  noun: 'auto' },
  ];

  const effects = ['fade-out', 'slide-out', 'zoom-out'];
  const INTERVAL = 5000;
  const FADE = 400;

  let i = 0;

  function next() {
    const effect = effects[Math.floor(Math.random() * effects.length)];
    wrap.classList.add(effect);

    setTimeout(() => {
      i = (i + 1) % items.length;
      pron.textContent = items[i].pron;
      noun.textContent = items[i].noun;

      wrap.classList.remove(effect);
    }, FADE);
  }

  pron.textContent = items[0].pron;
  noun.textContent = items[0].noun;

  let timer = setInterval(next, INTERVAL);

  const pause = () => clearInterval(timer);
  const resume = () => (timer = setInterval(next, INTERVAL));
  wrap.addEventListener('mouseenter', pause);
  wrap.addEventListener('mouseleave', resume);
  wrap.addEventListener('focusin', pause);
  wrap.addEventListener('focusout', resume);
})();

(function(global){
"use strict";


// --- util ---
function fmt(n){ return new Intl.NumberFormat('sr-RS').format(Math.round(n)); }
function qs(id){ return document.getElementById(id); }
function buildMailto(email, subject, body){
return "mailto:" + email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
}


const CONFIG = {
baseBySubstrate:{ beton:{min:120,max:220}, plocice:{min:140,max:260}, kamen:{min:180,max:300}, drugo:{min:140,max:260} },
soilMultiplier:{1:1.00,2:1.20,3:1.50},
optionsMultiplier:{hot:1.10,capture:1.30,night:1.20},
currency:"RSD",
minFeeDefault:9000
};


function currentRange(state){
const base = CONFIG.baseBySubstrate[state.substrate] || CONFIG.baseBySubstrate.drugo;
const mult = (CONFIG.soilMultiplier[state.soil]||1) * (state.hot?CONFIG.optionsMultiplier.hot:1) * (state.capture?CONFIG.optionsMultiplier.capture:1) * (state.night?CONFIG.optionsMultiplier.night:1);
return {low: base.min*mult, high: base.max*mult};
}


function updateSliderFill(el){
const min = +el.min, max = +el.max, val = +el.value;
const pct = ((val - min) / (max - min)) * 100;
el.style.backgroundSize = pct + "% 100%";
}


function init(){
const root = qs('pp-calculator');
if(!root){ console.error('[PodpritisCalc] Container not found'); return; }


const area=qs('pp-area'), substrate=qs('pp-substrate'), soil=qs('pp-soil');
const hot=qs('pp-hot'), capture=qs('pp-capture'), night=qs('pp-night');
const minfee=qs('pp-minfee'), total=qs('pp-total'), ppsqm=qs('pp-ppsqm');
const assumptions=qs('pp-assumptions'), share=qs('pp-share'), city=qs('pp-city');


const CONTACT_URL = (root.dataset.contactUrl||'').trim() || null;
const CONTACT_EMAIL = (root.dataset.contactEmail||'info@podpritis.com').trim();


function recompute(){
const state = {
area: Math.max(0, Number(area.value)||0),
substrate: substrate.value,
soil: soil.value,
hot: !!hot.checked,
capture: !!capture.checked,
night: !!night.checked,
minfee: Number(minfee.value)||CONFIG.minFeeDefault,
city: city.value||''
};
const range = currentRange(state);
let estLow = state.area * range.low, estHigh = state.area * range.high;
estLow = Math.max(estLow, state.minfee); estHigh = Math.max(estHigh, state.minfee);
const mid = (estLow + estHigh)/2;
total.textContent = fmt(mid);
const midPer = state.area>0 ? mid/state.area : 0;
ppsqm.textContent = `≈ ${fmt(midPer)} ${CONFIG.currency}/m² (raspon: ${fmt(range.low)}–${fmt(range.high)} ${CONFIG.currency}/m²)`;
const tags = []; if(state.hot) tags.push('topla voda'); if(state.capture) tags.push('hvatanje vode'); if(state.night) tags.push('noćni rad');
const soilMap={1:'normalno',2:'teže',3:'teško'};
assumptions.innerHTML = `Podloga: <b>${substrate.options[substrate.selectedIndex].text}</b> · Zaprljanost: <b>${soilMap[state.soil]}</b>${tags.length?` · Dodatno: <b>${tags.join(', ')}</b>`:''}`;


// link
const params = new URLSearchParams({area:state.area,substrate:state.substrate,soil:state.soil,hot:+state.hot,capture:+state.capture,night:+state.night,estimate:Math.round(mid),city:state.city}).toString();
if(CONTACT_URL){ share.href = CONTACT_URL + '?' + params; }
else{
const subject = `Upit za pranje (${state.city||'lokacija'})`;
const body = ['Pozdrav,','', 'Želeo bih ponudu za pranje pod pritiskom.','', `Podaci: ${params}`,'','Hvala!'].join('');
share.href = buildMailto(CONTACT_EMAIL, subject, body);
}
updateSliderFill(soil);
}


[area,substrate,soil,hot,capture,night,minfee,city].forEach(el=>{ el.addEventListener('input',recompute); el.addEventListener('change',recompute); });
recompute();
}

// Safe init on external script load
if(document.readyState === 'loading'){
document.addEventListener('DOMContentLoaded', init);
}else{ init(); }


})(window);