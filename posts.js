/* posts.js - gerencia envios (POST simulada) e armazenamento local para feed em tempo real */
(function(){
  const STORAGE_KEY = 'QQF_POSTS_V1';

  function loadPosts(){
    try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }catch(e){ return []; }
  }

  function savePosts(posts){ localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)); }

  function submitPost(payload){
    // payload: { title, city, date, sympla, instagram, description }
    const posts = loadPosts();
    const item = Object.assign({id: 'p'+Date.now()}, payload, {created: new Date().toISOString()});
    posts.unshift(item);
    savePosts(posts);
    // dispara evento storage para outras abas
    try{ localStorage.setItem('QQF_LAST_UPDATE', Date.now().toString()); }catch(e){}
    // opcional: enviar para webhook se fornecer 'webhook' em payload
    if(payload.webhook){ fetch(payload.webhook, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(item)}).catch(()=>{}); }
    return item;
  }

  function getPostsForCity(city){ return loadPosts().filter(p=>!city || p.city===city); }

  // API pública
  window.QQPosts = { submitPost, loadPosts, getPostsForCity };

  // listener para atualizações em outras abas
  window.addEventListener('storage', (e)=>{ if(e.key=== 'QQF_LAST_UPDATE'){ const ev = new Event('qqf:posts-updated'); window.dispatchEvent(ev); } });
})();
