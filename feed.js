/* feed.js - renderiza um feed simples baseado em APP_DATA.feeds */
(function(){
  function renderFeed(cityId){
    const feedEl = document.getElementById('feed');
    feedEl.innerHTML = '';
    const items = (window.APP_DATA.feeds[cityId] || []).slice(0,20);
    if(items.length===0){ feedEl.innerHTML = '<div>Nenhuma notícia local encontrada.</div>'; return }
    items.forEach(it=>{
      const div = document.createElement('div'); div.className='feed-item';
      div.innerHTML = `<strong>${it.title}</strong><div style="font-size:13px;color:#ccc">${it.date} · ${it.tags.join(', ')}</div><div style="margin-top:6px">${it.summary} <a href="${it.url}" target="_blank" rel="noopener">ler</a></div>`;
      feedEl.appendChild(div);
    });
  }

  window.QQFeed = { renderFeed };
})();
