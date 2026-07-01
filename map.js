/* map.js - inicializa Leaflet, gerencia marcadores e ícones por tipo */
(function(){
  let map, markersLayer;

  function createIcon(type){
    const color = (type==='distribuidora')? '#2ecc71' : (type==='evento')? '#e74c3c' : (type==='bar')? '#f1c40f' : '#3498db';
    return L.divIcon({className:'custom-marker', html:`<svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="10" r="6" fill="${color}" stroke="#222" stroke-width="1.5"/></svg>` , iconSize:[24,24], iconAnchor:[12,24]});
  }

  function initMap(){
    const first = window.APP_DATA.cities[0];
    map = L.map('map', {zoomControl:true}).setView(first.center, first.zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    markersLayer = L.layerGroup().addTo(map);
    // expõe referência do mapa globalmente para integrações simples
    try{ window.map = map; }catch(e){}
    // ajustar tamanho quando o mapa for exibido
    setTimeout(()=>{ try{ map.invalidateSize(); }catch(e){} }, 300);
  }

  function clearMarkers(){ markersLayer.clearLayers(); }

  function addMarkersForCity(cityIdOrName){
    clearMarkers();
    const query = (cityIdOrName || '').toString().trim().toLowerCase();
    const city = window.APP_DATA.cities.find(x=>x.id===query || x.name.toLowerCase()===query) || window.APP_DATA.cities.find(x=>x.name.toLowerCase().includes(query)) || window.APP_DATA.cities[0];
    const places = window.APP_DATA.places.filter(p=>p.city===city.id);
    places.forEach(p=>{
      const evt = p.eventId ? window.APP_DATA.events.find(e=>e.id===p.eventId) : null;
      const marker = L.marker([p.lat,p.lng], {icon:createIcon(p.type)}).addTo(markersLayer);
      marker.bindPopup(`<strong>${p.name}</strong><br>${p.type}${evt?`<br><em>${evt.title}</em>`:''}`);
      marker.on('click', ()=>{
        const detailsEl = document.getElementById('details');
        let html = `<strong>${p.name}</strong> <div style="margin-top:6px">Tipo: ${p.type}</div>`;
        if(evt){ html += `<div style="margin-top:8px"><strong>Evento:</strong> ${evt.title}<br>${evt.date}<br><a href='${evt.sympla}' target='_blank' rel='noopener'>Ingressos (Sympla)</a> · <a href='${evt.instagram}' target='_blank' rel='noopener'>Instagram</a></div>`}
        detailsEl.innerHTML = html;
        // atualiza botões globais
        const symplaBtn = document.getElementById('symplaBtn');
        const instaBtn = document.getElementById('instaBtn');
        if(evt){ symplaBtn.href = evt.sympla; instaBtn.href = evt.instagram } else { symplaBtn.href='#'; instaBtn.href='#' }
      });
    });
  }

  function focusCity(cityIdOrName){
    const query = (cityIdOrName || '').toString().trim().toLowerCase();
    const c = window.APP_DATA.cities.find(x=>x.id===query || x.name.toLowerCase()===query) || window.APP_DATA.cities.find(x=>x.name.toLowerCase().includes(query)) || window.APP_DATA.cities[0];
    map.setView(c.center, c.zoom);
    try{ map.invalidateSize(); }catch(e){}
  }

  function locateMe(){
    if(!navigator.geolocation) return alert('Geolocalização não suportada');
    navigator.geolocation.getCurrentPosition(pos=>{
      const lat = pos.coords.latitude, lon = pos.coords.longitude;
      map.setView([lat,lon], 15);
      const m = L.circleMarker([lat,lon], {radius:8,fillColor:'#1abc9c',color:'#fff',weight:2,fillOpacity:0.9}).addTo(markersLayer);
      m.bindPopup('Você está aqui').openPopup();
    }, err=>{ alert('Falha ao obter localização: '+err.message); }, { enableHighAccuracy:true, timeout:8000 });
  }

  window.QQMap = { initMap, addMarkersForCity, focusCity, locateMe };
  document.addEventListener('DOMContentLoaded', ()=>{ initMap(); });
})();
