// Gera data/geo.js (países, capitais e cidades em português) para o globo 3D.
// Uso: npm i world-countries world-atlas topojson-client all-the-cities && node tools/build-geo.js
const fs = require('fs');
const path = require('path');
const topojson = require('topojson-client');
const atlas = require('world-atlas/countries-110m.json');
const countries = require('world-countries');
const cities = require('all-the-cities');

const nomePt = new Intl.DisplayNames(['pt-BR'], { type: 'region' });
const REGIOES = { Americas: 'Américas', Europe: 'Europa', Asia: 'Ásia', Africa: 'África', Oceania: 'Oceania', Antarctic: 'Antártida' };
// nomes de cidades que mudam em português
const CIDADES_PT = {
  London:'Londres', Rome:'Roma', Paris:'Paris', Berlin:'Berlim', Lisbon:'Lisboa', Moscow:'Moscou', Beijing:'Pequim',
  Tokyo:'Tóquio', 'Washington, D.C.':'Washington', 'Mexico City':'Cidade do México', 'New Delhi':'Nova Délhi', Brussels:'Bruxelas',
  Vienna:'Viena', Warsaw:'Varsóvia', Prague:'Praga', Athens:'Atenas', Copenhagen:'Copenhague', Stockholm:'Estocolmo',
  Helsinki:'Helsinque', Bern:'Berna', Cairo:'Cairo', Algiers:'Argel', Tunis:'Túnis', Rabat:'Rabat', Tehran:'Teerã',
  Baghdad:'Bagdá', Damascus:'Damasco', Riyadh:'Riad', Jerusalem:'Jerusalém', Ankara:'Ancara', Kabul:'Cabul', Kyiv:'Kiev',
  Bucharest:'Bucareste', Budapest:'Budapeste', Belgrade:'Belgrado', Seoul:'Seul', Pyongyang:'Pyongyang', Bangkok:'Bangkok',
  Hanoi:'Hanói', Singapore:'Singapura', 'Kuwait City':'Cidade do Kuwait', 'Panama City':'Cidade do Panamá', Havana:'Havana',
  'Guatemala City':'Cidade da Guatemala', Bogota:'Bogotá', Brasilia:'Brasília', 'Sao Paulo':'São Paulo', 'Rio de Janeiro':'Rio de Janeiro',
  Asuncion:'Assunção', 'New York City':'Nova York', 'Los Angeles':'Los Angeles', Munich:'Munique', Milan:'Milão', Naples:'Nápoles',
  Cologne:'Colônia', Hamburg:'Hamburgo', Istanbul:'Istambul', 'Saint Petersburg':'São Petersburgo', 'Cape Town':'Cidade do Cabo',
  Geneva:'Genebra', Zurich:'Zurique', Edinburgh:'Edimburgo', Dublin:'Dublin', Reykjavik:'Reykjavík', Tallinn:'Tallinn',
  Vilnius:'Vilnius', Riga:'Riga', Minsk:'Minsk', Chisinau:'Chisinau', Sofia:'Sófia', Tirana:'Tirana', Skopje:'Escópia',
  Nicosia:'Nicósia', Valletta:'Valeta', Luxembourg:'Luxemburgo', Monaco:'Mônaco', 'Vatican City':'Vaticano', Amman:'Amã',
  Beirut:'Beirute', Doha:'Doha', 'Abu Dhabi':'Abu Dhabi', Muscat:'Mascate', "Sana'a":'Sanaa', Islamabad:'Islamabad', Dhaka:'Daca',
  Kathmandu:'Katmandu', Colombo:'Colombo', Manila:'Manila', Jakarta:'Jacarta', 'Kuala Lumpur':'Kuala Lumpur', Canberra:'Camberra',
  Wellington:'Wellington', Nairobi:'Nairóbi', 'Addis Ababa':'Adis Abeba', Khartoum:'Cartum', Tripoli:'Trípoli', Dakar:'Dacar',
  Luanda:'Luanda', Maputo:'Maputo', Pretoria:'Pretória', Kinshasa:'Kinshasa', Lagos:'Lagos', Abuja:'Abuja', Accra:'Acra',
  Ottawa:'Ottawa', 'Buenos Aires':'Buenos Aires', Santiago:'Santiago', Lima:'Lima', Quito:'Quito', Caracas:'Caracas',
  Montevideo:'Montevidéu', 'La Paz':'La Paz', Sucre:'Sucre', Mumbai:'Mumbai', Shanghai:'Xangai', Guangzhou:'Cantão',
  Shenzhen:'Shenzhen', 'Hong Kong':'Hong Kong', Osaka:'Osaka', Karachi:'Karachi', Alexandria:'Alexandria', Barcelona:'Barcelona',
  Seville:'Sevilha', Porto:'Porto', Tbilisi:'Tbilisi', Yerevan:'Erevan', Baku:'Baku', Tashkent:'Tashkent', Astana:'Astana',
  Ulaanbaatar:'Ulan Bator', Taipei:'Taipé', 'Port-au-Prince':'Porto Príncipe', 'Santo Domingo':'Santo Domingo', Kingston:'Kingston',
  'San Jose':'San José', Managua:'Manágua', Tegucigalpa:'Tegucigalpa', 'San Salvador':'San Salvador', Bissau:'Bissau',
  Praia:'Praia', 'Sao Tome':'São Tomé', Dili:'Díli', Antananarivo:'Antananarivo', Harare:'Harare', Lusaka:'Lusaka',
  Kampala:'Kampala', Kigali:'Kigali', Mogadishu:'Mogadíscio', Djibouti:'Djibuti', Asmara:'Asmara', Yaounde:'Iaundé',
  Bamako:'Bamako', Niamey:'Niamei', "N'Djamena":'N’Djamena', Ouagadougou:'Uagadugu', Conakry:'Conacri', Freetown:'Freetown',
  Monrovia:'Monróvia', Abidjan:'Abidjan', Yamoussoukro:'Yamoussoukro', Nouakchott:'Nouakchott', Windhoek:'Windhoek',
  Gaborone:'Gaborone', Maseru:'Maseru', Mbabane:'Mbabane', Lilongwe:'Lilongwe', Dodoma:'Dodoma', 'Dar es Salaam':'Dar es Salaam'
};
// bairros/distritos que o GeoNames lista como cidades
const IGNORAR = new Set(['Brooklyn', 'Queens', 'Manhattan', 'The Bronx', 'Staten Island', 'Yono']);
const pt = n => CIDADES_PT[n] || n;
const r1 = x => Math.round(x * 100) / 100;

const byIso = {};
countries.forEach(c => {
  let nome; try { nome = nomePt.of(c.cca2); } catch (e) { nome = c.translations.por.common; }
  byIso[c.cca2] = {
    iso: c.cca2, num: c.ccn3, nome, regiao: REGIOES[c.region] || c.region,
    area: Math.round(c.area), lat: r1(c.latlng[0]), lng: r1(c.latlng[1]),
    capital: null, cidades: []
  };
});

// capitais (GeoNames PPLC) e maiores cidades por país
const porPais = {};
cities.forEach(ci => {
  if (!byIso[ci.country]) return;
  if (IGNORAR.has(ci.name) || ci.featureCode === 'PPLX') return;
  (porPais[ci.country] = porPais[ci.country] || []).push(ci);
});
Object.keys(porPais).forEach(iso => {
  const lista = porPais[iso].sort((a, b) => b.population - a.population);
  const capitais = lista.filter(ci => ci.featureCode === 'PPLC');
  const cap = capitais[0];
  const pais = byIso[iso];
  if (cap) pais.capital = { nome: pt(cap.name), lat: r1(cap.loc.coordinates[1]), lng: r1(cap.loc.coordinates[0]), pop: cap.population };
  const capNome = cap && cap.name;
  const vistos = new Set([capNome]);
  pais.cidades = lista.filter(ci => {
    if (vistos.has(ci.name)) return false;
    const entra = ci.population >= 1000000 || (pais.cidades.length < 3 && ci.population >= 150000);
    if (entra) vistos.add(ci.name);
    return entra;
  }).slice(0, 8).map(ci => ({ nome: pt(ci.name), lat: r1(ci.loc.coordinates[1]), lng: r1(ci.loc.coordinates[0]), pop: ci.population }));
  // garante pelo menos as 3 maiores cidades (além da capital)
  if (pais.cidades.length < 3) {
    lista.filter(ci => !vistos.has(ci.name) && ci.population >= 100000).slice(0, 3 - pais.cidades.length)
      .forEach(ci => pais.cidades.push({ nome: pt(ci.name), lat: r1(ci.loc.coordinates[1]), lng: r1(ci.loc.coordinates[0]), pop: ci.population }));
  }
});
// fallback para a capital vinda do world-countries quando o GeoNames não marcou
countries.forEach(c => {
  const p = byIso[c.cca2];
  if (!p.capital && c.capital && c.capital[0]) p.capital = { nome: pt(c.capital[0]), lat: p.lat, lng: p.lng, pop: 0 };
});

// polígonos (Natural Earth 1:110m) com coordenadas arredondadas
const numToIso = {};
countries.forEach(c => { numToIso[c.ccn3] = c.cca2; });
const nomeParaIso = { Kosovo: 'XK', 'N. Cyprus': 'CY', Somaliland: 'SO' };
const geo = topojson.feature(atlas, atlas.objects.countries);
const round = coords => Array.isArray(coords[0]) ? coords.map(round) : [Math.round(coords[0] * 10) / 10, Math.round(coords[1] * 10) / 10];
const poligonos = geo.features.map(f => ({
  iso: numToIso[f.id] || nomeParaIso[f.properties.name] || null,
  g: { type: f.geometry.type, coordinates: round(f.geometry.coordinates) }
})).filter(p => p.iso);

const paises = Object.values(byIso).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
const out = '// Gerado por tools/build-geo.js — dados: Natural Earth, GeoNames, mledoze/countries\n' +
  'window.GEO_PAISES=' + JSON.stringify(paises) + ';\nwindow.GEO_POLIGONOS=' + JSON.stringify(poligonos) + ';\n';
fs.writeFileSync(path.join(__dirname, '..', 'data', 'geo.js'), out);
console.log('países', paises.length, 'polígonos', poligonos.length, 'KB', Math.round(out.length / 1024));
