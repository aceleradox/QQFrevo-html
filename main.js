/* main.js - lógica da UI: popula a lista de créditos, liga mapa e busca */
(function(){
  function populateReviews(){
    const el = document.getElementById('reviewsList'); el.innerHTML='';
    window.APP_DATA.reviewsSites.forEach(r=>{ const a=document.createElement('a'); a.href=r.url; a.target='_blank'; a.rel='noopener'; a.textContent=r.name; el.appendChild(a); });
  }

  function runSearch(){
    const city = document.getElementById('cityInput')?.value?.trim() || 'Recife';
    const type = document.getElementById('typeInput')?.value?.trim() || '';
    if(window.QQMap && window.QQMap.focusCity){ window.QQMap.focusCity(city); }
    if(window.buscar){ window.buscar({ city, type }); }
    if(window.QQFeed && window.QQFeed.renderFeed){ window.QQFeed.renderFeed(city); }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    populateReviews();
    const cityInput = document.getElementById('cityInput');
    const typeInput = document.getElementById('typeInput');
    const btn = document.getElementById('btnBuscar');
    if(cityInput){ cityInput.value = cityInput.value || 'Recife'; }
    if(btn){ btn.addEventListener('click', runSearch); }
    [cityInput, typeInput].forEach(el=>{
      if(el){ el.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); runSearch(); } }); }
    });
    runSearch();
  });
})();

