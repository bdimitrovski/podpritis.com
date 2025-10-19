
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

      if(!res.ok){ throw new Error('Formspree greška ('+res.status+')'); }

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
