/* search.js - lógica de busca Overpass (extraída do index original) */
// Mantém compatibilidade com o design anterior: função buscar() e handlers
let abortController = null;
let currentSearchId = 0;
let markersLayerGlobal = null;

function criarIconeSearch(emoji = '🍷') {
  return L.divIcon({
    html: `<div style="background:linear-gradient(135deg,#7c3aed,#c026d3);width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 20px rgba(124,58,237,0.5);border:2px solid rgba(255,255,255,0.2)">${emoji}</div>`,
    className: '', iconSize: [36,36], iconAnchor:[18,18]
  });
}

async function buscar() {
  if (!window.map) return;
  if (abortController) abortController.abort();
  abortController = new AbortController();
  currentSearchId = Date.now();
  const thisSearchId = currentSearchId;

  const listaAdegas = document.getElementById('listaAdegas');
  const feedEl = document.getElementById('feed');
  const btnBuscar = document.getElementById('btnBuscar');

  if (btnBuscar) { btnBuscar.disabled = true; btnBuscar.textContent = 'Buscando...'; }
  if (listaAdegas) listaAdegas.innerHTML = '<div class="p-8 text-center">Buscando...</div>';
  if (feedEl) feedEl.innerHTML = '<div class="p-8 text-center">Buscando...</div>';

  const tipo = (document.getElementById('tipo')?.value||'').trim();
  const categoria = (document.getElementById('categoria')?.value||'').trim();
  const cidade = (document.getElementById('cidade')?.value||'').trim() || 'Brasil';

  try{
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cidade)}&limit=1` , { signal: abortController.signal});
    const geo = await geoRes.json(); if (!geo[0]) throw new Error('Cidade não encontrada');
    const { lat, lon, boundingbox, display_name } = geo[0];
    window.map.setView([parseFloat(lat), parseFloat(lon)], 13);
    if (thisSearchId !== currentSearchId) return;

    const bbox = `${boundingbox[0]},${boundingbox[2]},${boundingbox[1]},${boundingbox[3]}`;
    let shopFilters = `node["shop"="alcohol"](${bbox});way["shop"="alcohol"](${bbox});node["shop"="beverages"](${bbox});way["shop"="beverages"](${bbox});node["shop"="wine"](${bbox});way["shop"="wine"](${bbox});`;
    const query = `[out:json][timeout:25];( ${shopFilters} node["amenity"="bar"](${bbox});way["amenity"="bar"](${bbox}); ); out center 60;`;

    const overRes = await fetch('https://overpass-api.de/api/interpreter', { method:'POST', body: 'data=' + encodeURIComponent(query), headers:{'Content-Type':'application/x-www-form-urlencoded'}, signal: abortController.signal });
    if (!overRes.ok) throw new Error('Overpass falhou');
    const data = await overRes.json();

    // remove marcadores antigos
    if (markersLayerGlobal) markersLayerGlobal.clearLayers();
    else markersLayerGlobal = L.layerGroup().addTo(window.map);

    listaAdegas && (listaAdegas.innerHTML=''); feedEl && (feedEl.innerHTML='');
    const bounds = [];
    (data.elements||[]).slice(0,50).forEach((el,i)=>{
      const elLat = el.lat || el.center?.lat; const elLon = el.lon || el.center?.lon; if(!elLat) return;
      bounds.push([elLat,elLon]);
      const tags = el.tags||{}; const nome = tags.name || tags.shop || tags.amenity || `Local ${i+1}`;
      const emoji = tags.shop==='wine'?'🍷':(tags.amenity==='bar'?'🍺':'🍾');
      const marker = L.marker([elLat,elLon], { icon: criarIconeSearch(emoji) }).addTo(markersLayerGlobal);
      marker.bindPopup(`<strong>${nome}</strong><div style="margin-top:6px">${tags.operator||''}</div>`);
      if (listaAdegas) listaAdegas.insertAdjacentHTML('beforeend', `<div class="p-3 border-b">${nome}</div>`);
      if (feedEl) feedEl.insertAdjacentHTML('beforeend', `<div class="mb-2">${nome} • ${cidade}</div>`);
    });
    if (bounds.length>1) window.map.fitBounds(bounds, { padding:[40,40] });
  }catch(err){ console.error(err); listaAdegas && (listaAdegas.innerHTML=`<div class="p-6">Erro: ${err.message}</div>`); }
  finally{ if (btnBuscar) { btnBuscar.disabled=false; btnBuscar.textContent='Buscar'; } }
}

window.buscar = buscar;
