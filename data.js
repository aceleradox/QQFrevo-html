/* Dados estáticos de exemplo. Substitua/expanda conforme necessário para produção. */
window.APP_DATA = {
  cities: [
    { id: 'recife', name: 'Recife', center: [-8.06379, -34.8711], zoom: 13 },
    { id: 'rio', name: 'Rio de Janeiro', center: [-22.9068, -43.1729], zoom: 12 }
  ],
  // Distribuidoras / locais e eventos vinculados
  places: [
    { id: 'd1', city: 'recife', name: 'Distribuidora A', lat:-8.060, lng:-34.872, type: 'distribuidora', eventId: 'e1' },
    { id: 'd2', city: 'recife', name: 'Bar Frevo', lat:-8.065, lng:-34.880, type: 'bar', eventId: null },
    { id: 'd3', city: 'rio', name: 'Pancadão Centro', lat:-22.906, lng:-43.170, type: 'evento', eventId: 'e2' }
  ],
  events: [
    { id: 'e1', city: 'recife', title: 'Samba de Frevo - Casa X', date: '2026-07-10', sympla: 'https://www.sympla.com.br/evento-exemplo-1', instagram: 'https://instagram.com/exemplo1', description: 'Frevo tradicional com DJ e orquestra. Ingressos no Sympla.' },
    { id: 'e2', city: 'rio', title: 'Baile Funk - Zona Sul', date: '2026-07-18', sympla: 'https://www.sympla.com.br/evento-exemplo-2', instagram: 'https://instagram.com/exemplo2', description: 'Pancadão com DJs convidados.' }
  ],
  frevos: [
    { id: 'f1', city: 'recife', name: 'Orquestra do Frevo', description: 'Banda tradicional de frevo, contato via Instagram', insta: 'https://instagram.com/orquestrafrevo' }
  ],
  reviewsSites: [
    { name: 'ResenhaBeat', url: 'https://resenhabeat.example' },
    { name: 'FunkReport', url: 'https://funkreport.example' },
    { name: 'FrevoHoje', url: 'https://frevohoje.example' },
    { name: 'RotaDosBailes', url: 'https://rotadosbailes.example' },
    { name: 'IngressosBR', url: 'https://ingressosbr.example' }
  ],
  // Feed simples por cidade (pode ser substituído por fetch de RSS/API no futuro)
  feeds: {
    recife: [
      { id: 'n1', title: 'Novo frevo na Praça do Arsenal', summary: 'Banda X anuncia show gratuito na praça.', url: '#', date:'2026-07-01', tags:['frevo'] },
      { id: 'n2', title: 'Distribuidora A lança sequência de eventos', summary: 'Ingressos à venda para a semana do frevo.', url: '#', date:'2026-07-02', tags:['evento'] }
    ],
    rio: [
      { id: 'n3', title: 'Baile funk no Arpoador', summary: 'Lineup com DJs locais.', url: '#', date:'2026-07-03', tags:['bailefunk'] }
    ]
  }
};
