/* main.js - lógica da UI: popula selects, liga mapa e feed */
(function(){
  function populateCities(){
    const sel = document.getElementById('citySelect'); sel.innerHTML='';
    window.APP_DATA.cities.forEach(c=>{
      const opt = document.createElement('option'); opt.value=c.id; opt.textContent=c.name; sel.appendChild(opt);
    });
  }

  function populateFrevos(cityId){
    const sel = document.getElementById('frevoSelect'); sel.innerHTML='';
    const frevos = window.APP_DATA.frevos.filter(f=>f.city===cityId);
    const events = window.APP_DATA.events.filter(e=>e.city===cityId);
    const merged = [...frevos.map(f=>({id:f.id,label:f.name,type:'frevo'})), ...events.map(e=>({id:e.id,label:e.title,type:'event'}))];
    merged.forEach(m=>{ const opt=document.createElement('option'); opt.value=m.id; opt.textContent=(m.type==='event'?`[E] ${m.label}`:m.label); sel.appendChild(opt); });
  }

  function populateReviews(){
    const el = document.getElementById('reviewsList'); el.innerHTML='';
    window.APP_DATA.reviewsSites.forEach(r=>{ const a=document.createElement('a'); a.href=r.url; a.target='_blank'; a.rel='noopener'; a.textContent=r.name; el.appendChild(a); });
  }

  function onCityChange(){
    const city = document.getElementById('citySelect').value;
    window.QQMap.focusCity(city);
    window.QQMap.addMarkersForCity(city);
    window.QQFeed.renderFeed(city);
    renderUserPosts(city);
    populateFrevos(city);
  }

  function onFrevoChange(){
    const id = document.getElementById('frevoSelect').value;
    // tenta localizar evento ou frevo e atualizar detalhes
    const ev = window.APP_DATA.events.find(e=>e.id===id);
    if(ev){ document.getElementById('symplaBtn').href=ev.sympla; document.getElementById('instaBtn').href=ev.instagram; }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    populateCities(); populateReviews();
    const citySel = document.getElementById('citySelect'); citySel.addEventListener('change', onCityChange);
    const frevoSel = document.getElementById('frevoSelect'); frevoSel.addEventListener('change', onFrevoChange);
    // iniciar com primeira cidade
    citySel.value = window.APP_DATA.cities[0].id;
    onCityChange();
  });

})();

// posts em tempo real via localStorage
function renderUserPosts(city){
  const feedEl = document.getElementById('feed'); if(!feedEl) return;
  const posts = (window.QQPosts && window.QQPosts.getPostsForCity) ? window.QQPosts.getPostsForCity(city) : [];
  const html = posts.slice(0,20).map(p=>`<div class="feed-item"><strong>${p.title}</strong><div style="font-size:12px;color:#ccc">${p.city} · ${new Date(p.created).toLocaleString()}</div><div style="margin-top:6px">${p.description} <div style="margin-top:6px"><a href="${p.sympla||'#'}" target="_blank">Sympla</a> · <a href="${p.instagram||'#'}" target="_blank">Instagram</a></div></div></div>`).join('');
  if(html) feedEl.innerHTML = html; 
}

window.addEventListener('qqf:posts-updated', ()=>{ const city = document.getElementById('citySelect')?.value; renderUserPosts(city); });

