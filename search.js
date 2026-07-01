/* search.js - busca frevo/eventos no mapa usando dados locais e OSM */
let abortController = null;
let markersLayerGlobal = null;

function criarIconeSearch(emoji = '🎶') {
  return L.divIcon({
    html: `<div style="background:linear-gradient(135deg,#7c3aed,#c026d3);width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 20px rgba(124,58,237,0.5);border:2px solid rgba(255,255,255,0.2)">${emoji}</div>`,
    className: '', iconSize: [36,36], iconAnchor:[18,18]
  });
}

function getCityMatch(cityName) {
  const query = (cityName || '').toString().trim().toLowerCase();
  if(!query) return window.APP_DATA.cities[0];
  return window.APP_DATA.cities.find(c=>c.id===query || c.name.toLowerCase()===query || c.name.toLowerCase().includes(query)) || window.APP_DATA.cities[0];
}

async function buscar(options = {}) {
  if (!window.map) return;
  if (abortController) abortController.abort();
  abortController = new AbortController();

  const btnBuscar = document.getElementById('btnBuscar');
  const feedEl = document.getElementById('feed');
  const detailsEl = document.getElementById('details');
  const cityInput = document.getElementById('cityInput');
  const typeInput = document.getElementById('typeInput');
  const city = (options.city || cityInput?.value || '').trim();
  const type = (options.type || typeInput?.value || '').trim().toLowerCase();

  if (btnBuscar) { btnBuscar.disabled = true; btnBuscar.textContent = 'Buscando...'; }
  if (feedEl) feedEl.innerHTML = '<div style="color:#ccc">Buscando resultados...</div>';
  if (detailsEl) detailsEl.innerHTML = 'Buscando no mapa...';

  try{
    const cityObj = getCityMatch(city);
    let center = cityObj.center;

    if (!cityObj || !cityObj.center) {
      const resp = await axios.get('https://nominatim.openstreetmap.org/search', { params:{ format:'json', q: city || 'Brasil', limit:1 }, signal: abortController.signal });
      const geo = resp.data && resp.data[0];
      if (geo) center = [parseFloat(geo.lat), parseFloat(geo.lon)];
    }

    if (center) window.map.setView(center, cityObj?.zoom || 12);

    if (markersLayerGlobal) markersLayerGlobal.clearLayers();
    else markersLayerGlobal = L.layerGroup().addTo(window.map);

    const results = [];

    window.APP_DATA.places.filter(p=>p.city===cityObj.id).forEach(p=>{
      const matches = !type || p.name.toLowerCase().includes(type) || p.type.toLowerCase().includes(type);
      if(matches) results.push({ lat:p.lat, lng:p.lng, name:p.name, type:p.type, kind:'place', eventId:p.eventId });
    });

    window.APP_DATA.events.filter(e=>e.city===cityObj.id).forEach(e=>{
      const matches = !type || e.title.toLowerCase().includes(type) || (e.description || '').toLowerCase().includes(type);
      if(matches) results.push({ lat: cityObj.center[0], lng: cityObj.center[1], name:e.title, type:'evento', kind:'event', event:e });
    });

    window.APP_DATA.frevos.filter(f=>f.city===cityObj.id).forEach(f=>{
      const matches = !type || f.name.toLowerCase().includes(type) || (f.description || '').toLowerCase().includes(type) || (f.type || '').toLowerCase().includes(type);
      if(matches) results.push({ lat:f.lat, lng:f.lng, name:f.name, type:f.type || 'frevo', kind:'frevo', frevo:f });
    });

    const bounds = [];
    if (feedEl) feedEl.innerHTML = '';
    if (detailsEl) detailsEl.innerHTML = results.length ? 'Resultados no mapa:' : 'Nenhum resultado encontrado.';

    results.forEach((r)=>{
      if (!r.lat || !r.lng) return;
      bounds.push([r.lat, r.lng]);
      const emoji = (r.kind==='frevo') ? '🎺' : (r.kind==='event' ? '🎟️' : '📍');
      const marker = L.marker([r.lat, r.lng], { icon: criarIconeSearch(emoji) }).addTo(markersLayerGlobal);
      let popup = `<strong>${r.name}</strong><div style="margin-top:6px">Tipo: ${r.type}</div>`;
      if (r.event) {
        popup += `<div style="margin-top:8px"><a href='${r.event.sympla}' target='_blank' rel='noopener'>Sympla</a> · <a href='${r.event.instagram}' target='_blank' rel='noopener'>Instagram</a></div>`;
      }
      if (r.frevo) {
        popup += `<div style="margin-top:8px"><a href='${r.frevo.instagram || r.frevo.insta || '#'}' target='_blank' rel='noopener'>Instagram</a></div>`;
      }
      marker.bindPopup(popup);
      marker.on('click', ()=>{
        let detailHtml = `<strong>${r.name}</strong><div style="margin-top:6px">Tipo: ${r.type}</div>`;
        if (r.event) detailHtml += `<div style="margin-top:8px"><a href='${r.event.sympla}' target='_blank' rel='noopener'>Sympla</a> · <a href='${r.event.instagram}' target='_blank' rel='noopener'>Instagram</a></div>`;
        if (r.frevo) detailHtml += `<div style="margin-top:8px"><a href='${r.frevo.instagram || r.frevo.insta || '#'}' target='_blank' rel='noopener'>Instagram</a></div>`;
        if (detailsEl) detailsEl.innerHTML = detailHtml;
      });
      if (feedEl) feedEl.insertAdjacentHTML('beforeend', `<div class="mb-2"><strong>${r.name}</strong><div style="font-size:12px;color:#ccc">${r.type}</div></div>`);
    });

    if(bounds.length>1) window.map.fitBounds(bounds, { padding:[40,40] });
  }catch(err){ console.error(err); if(feedEl) feedEl.innerHTML = `<div style="color:#f99">Erro: ${err.message}</div>`; if(detailsEl) detailsEl.innerHTML = 'Não foi possível carregar os resultados.'; }
  finally{ if (btnBuscar) { btnBuscar.disabled=false; btnBuscar.textContent='Buscar no mapa'; } }
}

window.buscar = buscar;
