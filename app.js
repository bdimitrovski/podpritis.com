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

(function () {
  'use strict';

  function init() {
    const root = document.getElementById('pp-calculator');
    if (!root) return;

    // --- config & helpers ---
    const CONFIG = {
      baseBySubstrate: {
        beton:   { min: 120, max: 220 },
        plocice: { min: 140, max: 260 },
        kamen:   { min: 180, max: 300 },
        drugo:   { min: 140, max: 260 }
      },
      soilMultiplier:    { 1: 1.00, 2: 1.20, 3: 1.50 },
      optionsMultiplier: { hot: 1.10, capture: 1.30 },
      currency: 'RSD',
      minFeeDefault: 9000
    };
    const nf  = new Intl.NumberFormat('sr-RS');
    const fmt = n => nf.format(Math.round(n));
    const $   = sel => root.querySelector(sel);

    // --- elements (scoped u #pp-calculator) ---
    const area   = $('#pp-area');
    const subs   = $('#pp-substrate');
    const soil   = $('#pp-soil');
    const hot    = $('#pp-hot');
    const cap    = $('#pp-capture');;
    const minfee = $('#pp-minfee');
    const city   = $('#pp-city');

    const total  = $('#pp-total');
    const ppsqm  = $('#pp-ppsqm');
    const assump = $('#pp-assumptions');

    const nameEl   = $('#pp-name');
    const phoneEl  = $('#pp-phone');
    const emailEl  = $('#pp-email');
    const submitBtn= $('#pp-submit');
    const status   = $('#pp-status');

    function fillSlider() {
      if (!soil) return;
      const pct = ((+soil.value - +soil.min) / (+soil.max - +soil.min)) * 100;
      soil.style.backgroundSize = pct + '% 100%';
    }

    function currentRange() {
      const base = CONFIG.baseBySubstrate[subs.value] || CONFIG.baseBySubstrate.drugo;
      const mult =
        (CONFIG.soilMultiplier[soil.value] || 1) *
        (hot.checked   ? CONFIG.optionsMultiplier.hot    : 1) *
        (cap.checked   ? CONFIG.optionsMultiplier.capture: 1)
      return { low: base.min * mult, high: base.max * mult };
    }

    function recompute() {
      const a = Math.max(0, Number(area.value) || 0);
      const r = currentRange();

      let lo = a * r.low;
      let hi = a * r.high;
      const minF = Number(minfee.value) || CONFIG.minFeeDefault;
      lo = Math.max(lo, minF);
      hi = Math.max(hi, minF);

      const mid = (lo + hi) / 2;
      total.textContent = `${fmt(mid)} ${CONFIG.currency}`;
      ppsqm.textContent =
        `≈ ${fmt(a ? mid / a : 0)} ${CONFIG.currency}/m² ` +
        `(raspon: ${fmt(r.low)}–${fmt(r.high)} ${CONFIG.currency}/m²)`;

      const soilMap = { 1: 'normalno', 2: 'teže', 3: 'teško' };
      const tags = [];
      if (hot.checked)   tags.push('topla voda');
      if (cap.checked)   tags.push('hvatanje vode');
      assump.innerHTML =
        `Podloga: <b>${subs.options[subs.selectedIndex].text}</b>` +
        ` · Zaprljanost: <b>${soilMap[soil.value]}</b>` +
        (tags.length ? ` · Dodatno: <b>${tags.join(', ')}</b>` : '');

      fillSlider();
      return Math.round(mid);
    }

    function syncPills() {
      [hot, cap].forEach(cb => {
        if (!cb) return;
        const lab = cb.closest('label');
        if (lab) lab.classList.toggle('active', cb.checked);
      });
    }

    function showToast(msg, type) {
      const zone = document.getElementById('pp-toast');
      if (!zone) return;
      const el = document.createElement('div');
      el.className = 'toast ' + (type || '');
      el.textContent = msg;
      zone.appendChild(el);
      requestAnimationFrame(() => el.classList.add('show'));
      setTimeout(() => {
        el.classList.remove('show');
        setTimeout(() => zone.removeChild(el), 200);
      }, 3500);
    }

    async function handleSubmit(e) {
      e.preventDefault();
      if (!nameEl.value.trim())  { status.textContent='Unesi ime i prezime';  showToast('Unesi ime i prezime','err');  return; }
      if (!phoneEl.value.trim()) { status.textContent='Unesi broj telefona';  showToast('Unesi broj telefona','err');  return; }
      if (!emailEl.value.trim()) { status.textContent='Unesi email';         showToast('Unesi email','err');         return; }

      const est = recompute();
      if (submitBtn) submitBtn.disabled = true;
      status.textContent = 'Šaljem…'; status.className = '';

      const payload = {
        name: nameEl.value.trim(),
        phone: phoneEl.value.trim(),
        email: emailEl.value.trim(),
        city: city.value.trim(),
        area: area.value,
        substrate: subs.value,
        soil: soil.value,
        options: { hot: hot.checked, capture: cap.checked },
        estimate: String(est),
        minfee: String(minfee.value || CONFIG.minFeeDefault),
        _subject: 'Upit sa kalkulatora – Podpritis'
      };

      try {
        await fetch(root.dataset.formspree, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        status.textContent = 'Hvala! Poslali smo upit.'; status.className = 'ok';
        showToast('Hvala! Tvoj upit je poslat.', 'ok');
      } catch (e) {
        status.textContent = 'Greška pri slanju. Pokušaj ponovo.'; status.className = 'err';
        showToast('Greška pri slanju. Pokušaj ponovo.', 'err');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    }

    // event binding
    ['input','change'].forEach(ev =>
      [area, subs, soil, hot, cap, minfee, city].forEach(el => el && el.addEventListener(ev, recompute))
    );
    [hot, cap].forEach(cb => cb && cb.addEventListener('change', () => { syncPills(); recompute(); }));
    if (submitBtn) submitBtn.addEventListener('click', handleSubmit);

    // initial paint
    fillSlider(); syncPills(); recompute();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();