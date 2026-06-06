// ═══════════════════════════════════════════════════
// TIMEZONE DATA
// ═══════════════════════════════════════════════════
const TIMEZONES = [
  {label:'WIB — Indonesia Barat (UTC+7)',  offset:7,  abbr:'WIB'},
  {label:'WITA — Indonesia Tengah (UTC+8)',offset:8,  abbr:'WITA'},
  {label:'WIT — Indonesia Timur (UTC+9)',  offset:9,  abbr:'WIT'},
  {label:'SGT — Singapura (UTC+8)',        offset:8,  abbr:'SGT'},
  {label:'MYT — Malaysia (UTC+8)',         offset:8,  abbr:'MYT'},
  {label:'ICT — Thailand/Vietnam (UTC+7)',offset:7,  abbr:'ICT'},
  {label:'PHT — Filipina (UTC+8)',         offset:8,  abbr:'PHT'},
  {label:'JST — Jepang (UTC+9)',           offset:9,  abbr:'JST'},
  {label:'KST — Korea (UTC+9)',            offset:9,  abbr:'KST'},
  {label:'CST — China (UTC+8)',            offset:8,  abbr:'CST'},
  {label:'IST — India (UTC+5:30)',         offset:5.5,abbr:'IST'},
  {label:'GST — Dubai/UAE (UTC+4)',        offset:4,  abbr:'GST'},
  {label:'AST — Arab Saudi (UTC+3)',       offset:3,  abbr:'AST'},
  {label:'EAT — Afrika Timur (UTC+3)',     offset:3,  abbr:'EAT'},
  {label:'CAT — Afrika Tengah (UTC+2)',    offset:2,  abbr:'CAT'},
  {label:'WAT — Afrika Barat (UTC+1)',     offset:1,  abbr:'WAT'},
  {label:'UTC — Universal (UTC+0)',        offset:0,  abbr:'UTC'},
  {label:'BST — UK Musim Panas (UTC+1)',   offset:1,  abbr:'BST'},
  {label:'CET — Eropa Tengah (UTC+2)',     offset:2,  abbr:'CET'},
  {label:'MSK — Moskow (UTC+3)',           offset:3,  abbr:'MSK'},
  {label:'EDT — New York/Miami (UTC-4)',   offset:-4, abbr:'EDT'},
  {label:'CDT — Chicago/Dallas (UTC-5)',   offset:-5, abbr:'CDT'},
  {label:'MDT — Denver (UTC-6)',           offset:-6, abbr:'MDT'},
  {label:'PDT — Los Angeles (UTC-7)',      offset:-7, abbr:'PDT'},
  {label:'BRT — Brasil (UTC-3)',           offset:-3, abbr:'BRT'},
  {label:'ART — Argentina (UTC-3)',        offset:-3, abbr:'ART'},
  {label:'AEST — Australia Timur (UTC+10)',offset:10, abbr:'AEST'},
  {label:'NZST — Selandia Baru (UTC+12)', offset:12, abbr:'NZST'},
];

// Match kick-off times in LOCAL US time (EDT = UTC-4)
// Format: [hour, minute] in EDT (UTC-4)
// Most matches: 15:00, 18:00, 21:00 EDT
const MATCH_TIMES_EDT = [
  [15,0],[18,0],[21,0],[21,0], // day round 1 stagger
  [15,0],[18,0],[21,0],[21,0],
  [15,0],[18,0],[21,0],[21,0],
  [15,0],[18,0],[21,0],[21,0],
  [15,0],[18,0],[21,0],[21,0],
  [15,0],[18,0],[21,0],[21,0],
];
// Per-match kick-off (EDT) for group matches, indexed by group+matchIdx
const GROUP_KO_TIMES = [
  [[15,0],[18,0],[15,0],[21,0],[18,0],[21,0]], // Group A
  [[15,0],[21,0],[18,0],[15,0],[21,0],[18,0]], // B
  [[18,0],[21,0],[15,0],[18,0],[21,0],[15,0]], // C
  [[21,0],[15,0],[18,0],[21,0],[15,0],[18,0]], // D
  [[15,0],[18,0],[21,0],[15,0],[18,0],[21,0]], // E
  [[18,0],[21,0],[15,0],[18,0],[21,0],[15,0]], // F
  [[15,0],[18,0],[21,0],[15,0],[18,0],[21,0]], // G
  [[18,0],[21,0],[15,0],[18,0],[21,0],[15,0]], // H
  [[15,0],[18,0],[21,0],[15,0],[18,0],[21,0]], // I
  [[18,0],[21,0],[15,0],[18,0],[21,0],[15,0]], // J
  [[15,0],[21,0],[18,0],[15,0],[21,0],[18,0]], // K
  [[18,0],[21,0],[15,0],[18,0],[21,0],[15,0]], // L
];
const KO_TIMES_EDT = {
  r32:[[15,0],[15,0],[18,0],[18,0],[21,0],[21,0],[21,0],[21,0],
       [15,0],[15,0],[18,0],[18,0],[21,0],[21,0],[21,0],[21,0]],
  r16:[[15,0],[18,0],[21,0],[21,0],[15,0],[18,0],[21,0],[21,0]],
  qf: [[15,0],[21,0],[15,0],[21,0]],
  sf: [[21,0],[21,0]],
  final:[[18,0]],
  third:[[14,0]]
};

function edtToLocal(h,m,tzOffset){
  // EDT = UTC-4
  const utcH = h + 4; // convert to UTC
  const localH = utcH + tzOffset;
  let d = m, hh = ((localH % 24) + 24) % 24;
  return `${String(hh).padStart(2,'0')}:${String(d).padStart(2,'0')}`;
}

// ── CURRENT TZ ──
let currentTZ = 0; // index into TIMEZONES

function buildTzSelect(){
  const sel = document.getElementById('tz-select');
  sel.innerHTML = TIMEZONES.map((tz,i)=>
    `<option value="${i}" ${i===currentTZ?'selected':''}>${tz.label}</option>`
  ).join('');
}
function onTzChange(){
  currentTZ = +document.getElementById('tz-select').value;
  sv('tz',currentTZ);
  buildGroups();
  buildFixtures();
  rebuildAllKO();
  buildFinal();
  notify(`Zona waktu: ${TIMEZONES[currentTZ].abbr} ✓`);
}
function getTzAbbr(){return TIMEZONES[currentTZ].abbr;}
function getLocalTime(h,m){return edtToLocal(h,m,TIMEZONES[currentTZ].offset);}

// ═══════════════════════════════════════════════════
// FLAGS DATA
// ═══════════════════════════════════════════════════
const FLAGS = [
  ['🇦🇫','Afghanistan'],['🇦🇱','Albania'],['🇩🇿','Algeria'],['🇦🇩','Andorra'],['🇦🇴','Angola'],
  ['🇦🇬','Antigua & Barbuda'],['🇦🇷','Argentina'],['🇦🇲','Armenia'],['🇦🇺','Australia'],['🇦🇹','Austria'],
  ['🇦🇿','Azerbaijan'],['🇧🇭','Bahrain'],['🇧🇩','Bangladesh'],['🇧🇪','Belgium'],['🇧🇿','Belize'],
  ['🇧🇯','Benin'],['🇧🇴','Bolivia'],['🇧🇦','Bosnia & Herz.'],['🇧🇼','Botswana'],['🇧🇷','Brazil'],
  ['🇧🇳','Brunei'],['🇧🇬','Bulgaria'],['🇧🇫','Burkina Faso'],['🇧🇮','Burundi'],['🇨🇲','Cameroon'],
  ['🇨🇦','Canada'],['🇨🇻','Cape Verde'],['🇨🇫','C. African Rep.'],['🇹🇩','Chad'],['🇨🇱','Chile'],
  ['🇨🇳','China'],['🇨🇴','Colombia'],['🇨🇬','Congo'],['🇨🇩','DR Congo'],['🇨🇷','Costa Rica'],
  ['🇨🇮','Côte d\'Ivoire'],['🇭🇷','Croatia'],['🇨🇺','Cuba'],['🇨🇼','Curaçao'],['🇨🇾','Cyprus'],
  ['🇨🇿','Czechia'],['🇩🇰','Denmark'],['🇩🇯','Djibouti'],['🇩🇴','Dominican Rep.'],['🇪🇨','Ecuador'],
  ['🇪🇬','Egypt'],['🇸🇻','El Salvador'],['🇬🇶','Eq. Guinea'],['🇪🇪','Estonia'],['🇸🇿','Eswatini'],
  ['🇪🇹','Ethiopia'],['🇫🇯','Fiji'],['🇫🇮','Finland'],['🇫🇷','France'],['🇬🇦','Gabon'],
  ['🇬🇲','Gambia'],['🇬🇪','Georgia'],['🇩🇪','Germany'],['🇬🇭','Ghana'],['🇬🇷','Greece'],
  ['🇬🇹','Guatemala'],['🇬🇳','Guinea'],['🇬🇼','Guinea-Bissau'],['🇭🇹','Haiti'],['🇭🇳','Honduras'],
  ['🇭🇺','Hungary'],['🇮🇸','Iceland'],['🇮🇳','India'],['🇮🇩','Indonesia'],['🇮🇷','Iran'],
  ['🇮🇶','Iraq'],['🇮🇪','Ireland'],['🇮🇱','Israel'],['🇮🇹','Italy'],['🇯🇲','Jamaica'],
  ['🇯🇵','Japan'],['🇯🇴','Jordan'],['🇰🇿','Kazakhstan'],['🇰🇪','Kenya'],['🇰🇷','South Korea'],
  ['🇽🇰','Kosovo'],['🇰🇼','Kuwait'],['🇰🇬','Kyrgyzstan'],['🇱🇻','Latvia'],['🇱🇧','Lebanon'],
  ['🇱🇷','Liberia'],['🇱🇾','Libya'],['🇱🇹','Lithuania'],['🇲🇬','Madagascar'],['🇲🇼','Malawi'],
  ['🇲🇾','Malaysia'],['🇲🇱','Mali'],['🇲🇹','Malta'],['🇲🇷','Mauritania'],['🇲🇽','Mexico'],
  ['🇲🇩','Moldova'],['🇲🇪','Montenegro'],['🇲🇦','Morocco'],['🇲🇲','Myanmar'],['🇳🇦','Namibia'],
  ['🇳🇵','Nepal'],['🇳🇱','Netherlands'],['🇳🇿','New Zealand'],['🇳🇮','Nicaragua'],['🇳🇪','Niger'],
  ['🇳🇬','Nigeria'],['🇲🇰','N. Macedonia'],['🇳🇴','Norway'],['🇴🇲','Oman'],['🇵🇸','Palestine'],
  ['🇵🇦','Panama'],['🇵🇾','Paraguay'],['🇵🇪','Peru'],['🇵🇭','Philippines'],['🇵🇱','Poland'],
  ['🇵🇹','Portugal'],['🇶🇦','Qatar'],['🇷🇴','Romania'],['🇷🇼','Rwanda'],['🇸🇦','Saudi Arabia'],
  ['🇸🇳','Senegal'],['🇷🇸','Serbia'],['🇸🇱','Sierra Leone'],['🇸🇰','Slovakia'],['🇸🇮','Slovenia'],
  ['🇿🇦','South Africa'],['🇸🇸','South Sudan'],['🇪🇸','Spain'],['🏴󠁧󠁢󠁳󠁣󠁴󠁿','Scotland'],['🇱🇰','Sri Lanka'],
  ['🇸🇩','Sudan'],['🇸🇷','Suriname'],['🇸🇪','Sweden'],['🇨🇭','Switzerland'],['🇸🇾','Syria'],
  ['🇹🇿','Tanzania'],['🇹🇭','Thailand'],['🇹🇱','Timor-Leste'],['🇹🇬','Togo'],['🇹🇹','Trinidad & Tobago'],
  ['🇹🇳','Tunisia'],['🇹🇷','Turkey'],['🇺🇬','Uganda'],['🇺🇦','Ukraine'],['🇦🇪','UAE'],
  ['🇺🇸','USA'],['🇺🇾','Uruguay'],['🇺🇿','Uzbekistan'],['🇻🇪','Venezuela'],['🇻🇳','Vietnam'],
  ['🇾🇪','Yemen'],['🇿🇲','Zambia'],['🇿🇼','Zimbabwe'],['🏴󠁧󠁢󠁥󠁮󠁧󠁿','England'],['🏴󠁧󠁢󠁷󠁬󠁳󠁿','Wales'],
  ['🇲🇨','Monaco'],['🇸🇦','Arab Saudi'],['🇵🇰','Pakistan'],['🇳🇴','Norwegia']
];

// ═══════════════════════════════════════════════════
// OFFICIAL GROUPS (FIFA Draw Dec 5 2024)
// ═══════════════════════════════════════════════════
const GROUPS = [
  {l:'A',teams:[{f:'🇲🇽',n:'Mexico'},{f:'🇰🇷',n:'South Korea'},{f:'🇨🇿',n:'Czechia'},{f:'🇿🇦',n:'South Africa'}],
   matches:[{d:'Jun 11',mi:0,t1:0,t2:3,venue:'Azteca, Mexico City'},{d:'Jun 11',mi:1,t1:1,t2:2,venue:'Akron, Zapopan'},
            {d:'Jun 15',mi:2,t1:0,t2:2,venue:'Omnilife, Guadalajara'},{d:'Jun 15',mi:3,t1:1,t2:3,venue:'BBVA, Monterrey'},
            {d:'Jun 19',mi:4,t1:0,t2:1,venue:'Azteca, Mexico City'},{d:'Jun 19',mi:5,t1:2,t2:3,venue:'Omnilife, Guadalajara'}]},
  {l:'B',teams:[{f:'🇨🇭',n:'Switzerland'},{f:'🇨🇦',n:'Canada'},{f:'🇶🇦',n:'Qatar'},{f:'🇧🇦',n:'Bosnia & Herz.'}],
   matches:[{d:'Jun 12',mi:0,t1:1,t2:3,venue:'BMO, Toronto'},{d:'Jun 13',mi:1,t1:2,t2:0,venue:"Levi's, Santa Clara"},
            {d:'Jun 16',mi:2,t1:1,t2:2,venue:'BC Place, Vancouver'},{d:'Jun 16',mi:3,t1:0,t2:3,venue:'Lumen, Seattle'},
            {d:'Jun 20',mi:4,t1:1,t2:0,venue:'BMO, Toronto'},{d:'Jun 20',mi:5,t1:2,t2:3,venue:'BC Place, Vancouver'}]},
  {l:'C',teams:[{f:'🇧🇷',n:'Brazil'},{f:'🇲🇦',n:'Morocco'},{f:'🏴󠁧󠁢󠁳󠁣󠁴󠁿',n:'Scotland'},{f:'🇭🇹',n:'Haiti'}],
   matches:[{d:'Jun 13',mi:0,t1:0,t2:1,venue:'MetLife, NY/NJ'},{d:'Jun 13',mi:1,t1:3,t2:2,venue:'Gillette, Foxborough'},
            {d:'Jun 17',mi:2,t1:0,t2:3,venue:'Lincoln, Philadelphia'},{d:'Jun 17',mi:3,t1:1,t2:2,venue:'Mercedes-Benz, Atlanta'},
            {d:'Jun 21',mi:4,t1:0,t2:2,venue:'MetLife, NY/NJ'},{d:'Jun 21',mi:5,t1:1,t2:3,venue:'Hard Rock, Miami'}]},
  {l:'D',teams:[{f:'🇺🇸',n:'United States'},{f:'🇹🇷',n:'Turkey'},{f:'🇦🇺',n:'Australia'},{f:'🇵🇾',n:'Paraguay'}],
   matches:[{d:'Jun 12',mi:0,t1:0,t2:3,venue:'SoFi, Inglewood'},{d:'Jun 13',mi:1,t1:2,t2:1,venue:'AT&T, Dallas'},
            {d:'Jun 16',mi:2,t1:0,t2:2,venue:"Levi's, San Francisco"},{d:'Jun 17',mi:3,t1:1,t2:3,venue:'NRG, Houston'},
            {d:'Jun 21',mi:4,t1:0,t2:1,venue:'SoFi, Inglewood'},{d:'Jun 21',mi:5,t1:2,t2:3,venue:'AT&T, Dallas'}]},
  {l:'E',teams:[{f:'🇩🇪',n:'Germany'},{f:'🇪🇨',n:'Ecuador'},{f:'🇨🇮',n:"Côte d'Ivoire"},{f:'🇨🇼',n:'Curaçao'}],
   matches:[{d:'Jun 14',mi:0,t1:0,t2:1,venue:'MetLife, NY/NJ'},{d:'Jun 14',mi:1,t1:2,t2:3,venue:'Gillette, Boston'},
            {d:'Jun 18',mi:2,t1:0,t2:2,venue:'Lincoln, Philadelphia'},{d:'Jun 18',mi:3,t1:1,t2:3,venue:'Hard Rock, Miami'},
            {d:'Jun 22',mi:4,t1:0,t2:3,venue:'MetLife, NY/NJ'},{d:'Jun 22',mi:5,t1:1,t2:2,venue:'Mercedes-Benz, Atlanta'}]},
  {l:'F',teams:[{f:'🇳🇱',n:'Netherlands'},{f:'🇯🇵',n:'Japan'},{f:'🇸🇪',n:'Sweden'},{f:'🇹🇳',n:'Tunisia'}],
   matches:[{d:'Jun 14',mi:0,t1:0,t2:1,venue:'Lumen, Seattle'},{d:'Jun 14',mi:1,t1:2,t2:3,venue:'NRG, Houston'},
            {d:'Jun 18',mi:2,t1:0,t2:2,venue:'BC Place, Vancouver'},{d:'Jun 18',mi:3,t1:1,t2:3,venue:"Levi's, San Francisco"},
            {d:'Jun 22',mi:4,t1:0,t2:3,venue:'AT&T, Dallas'},{d:'Jun 22',mi:5,t1:1,t2:2,venue:'SoFi, Inglewood'}]},
  {l:'G',teams:[{f:'🇧🇪',n:'Belgium'},{f:'🇮🇷',n:'Iran'},{f:'🇪🇬',n:'Egypt'},{f:'🇳🇿',n:'New Zealand'}],
   matches:[{d:'Jun 15',mi:0,t1:0,t2:2,venue:'Hard Rock, Miami'},{d:'Jun 15',mi:1,t1:1,t2:3,venue:'NRG, Houston'},
            {d:'Jun 19',mi:2,t1:0,t2:1,venue:'AT&T, Dallas'},{d:'Jun 19',mi:3,t1:2,t2:3,venue:'Mercedes-Benz, Atlanta'},
            {d:'Jun 23',mi:4,t1:0,t2:3,venue:'Hard Rock, Miami'},{d:'Jun 23',mi:5,t1:1,t2:2,venue:'NRG, Houston'}]},
  {l:'H',teams:[{f:'🇪🇸',n:'Spain'},{f:'🇺🇾',n:'Uruguay'},{f:'🇸🇦',n:'Saudi Arabia'},{f:'🇨🇻',n:'Cape Verde'}],
   matches:[{d:'Jun 15',mi:0,t1:0,t2:1,venue:"Levi's, San Francisco"},{d:'Jun 16',mi:1,t1:2,t2:3,venue:'SoFi, Inglewood'},
            {d:'Jun 19',mi:2,t1:0,t2:2,venue:'Lumen, Seattle'},{d:'Jun 19',mi:3,t1:1,t2:3,venue:'Arrowhead, Kansas City'},
            {d:'Jun 23',mi:4,t1:0,t2:3,venue:"Levi's, San Francisco"},{d:'Jun 23',mi:5,t1:1,t2:2,venue:'SoFi, Inglewood'}]},
  {l:'I',teams:[{f:'🇫🇷',n:'France'},{f:'🇸🇳',n:'Senegal'},{f:'🇳🇴',n:'Norway'},{f:'🇮🇶',n:'Iraq'}],
   matches:[{d:'Jun 16',mi:0,t1:0,t2:1,venue:'Arrowhead, Kansas City'},{d:'Jun 16',mi:1,t1:2,t2:3,venue:'Mercedes-Benz, Atlanta'},
            {d:'Jun 20',mi:2,t1:0,t2:2,venue:'AT&T, Dallas'},{d:'Jun 20',mi:3,t1:1,t2:3,venue:'NRG, Houston'},
            {d:'Jun 24',mi:4,t1:0,t2:3,venue:'Arrowhead, Kansas City'},{d:'Jun 24',mi:5,t1:1,t2:2,venue:'Hard Rock, Miami'}]},
  {l:'J',teams:[{f:'🇦🇷',n:'Argentina'},{f:'🇦🇹',n:'Austria'},{f:'🇩🇿',n:'Algeria'},{f:'🇯🇴',n:'Jordan'}],
   matches:[{d:'Jun 17',mi:0,t1:0,t2:1,venue:'MetLife, NY/NJ'},{d:'Jun 17',mi:1,t1:2,t2:3,venue:'Gillette, Boston'},
            {d:'Jun 21',mi:2,t1:0,t2:2,venue:'Lincoln, Philadelphia'},{d:'Jun 21',mi:3,t1:1,t2:3,venue:'Mercedes-Benz, Atlanta'},
            {d:'Jun 25',mi:4,t1:0,t2:3,venue:'MetLife, NY/NJ'},{d:'Jun 25',mi:5,t1:1,t2:2,venue:'Gillette, Boston'}]},
  {l:'K',teams:[{f:'🇵🇹',n:'Portugal'},{f:'🇨🇴',n:'Colombia'},{f:'🇨🇩',n:'DR Congo'},{f:'🇺🇿',n:'Uzbekistan'}],
   matches:[{d:'Jun 17',mi:0,t1:0,t2:1,venue:'SoFi, Inglewood'},{d:'Jun 18',mi:1,t1:2,t2:3,venue:'Lumen, Seattle'},
            {d:'Jun 22',mi:2,t1:0,t2:2,venue:"Levi's, San Francisco"},{d:'Jun 22',mi:3,t1:1,t2:3,venue:'BC Place, Vancouver'},
            {d:'Jun 26',mi:4,t1:0,t2:3,venue:'SoFi, Inglewood'},{d:'Jun 26',mi:5,t1:1,t2:2,venue:"Levi's, San Francisco"}]},
  {l:'L',teams:[{f:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',n:'England'},{f:'🇭🇷',n:'Croatia'},{f:'🇵🇦',n:'Panama'},{f:'🇬🇭',n:'Ghana'}],
   matches:[{d:'Jun 18',mi:0,t1:0,t2:1,venue:'AT&T, Dallas'},{d:'Jun 19',mi:1,t1:2,t2:3,venue:'NRG, Houston'},
            {d:'Jun 22',mi:2,t1:0,t2:2,venue:'Hard Rock, Miami'},{d:'Jun 22',mi:3,t1:1,t2:3,venue:'Mercedes-Benz, Atlanta'},
            {d:'Jun 26',mi:4,t1:0,t2:3,venue:'AT&T, Dallas'},{d:'Jun 26',mi:5,t1:1,t2:2,venue:'Hard Rock, Miami'}]}
];

const KO_ROUNDS = [
  {id:'r32',lbl:'Round of 32',sub:'Jun 29 – Jul 2',n:16,
   dates:['Jun 29','Jun 29','Jun 29','Jun 29','Jun 30','Jun 30','Jun 30','Jun 30',
          'Jul 1','Jul 1','Jul 1','Jul 1','Jul 2','Jul 2','Jul 2','Jul 2']},
  {id:'r16',lbl:'Round of 16',sub:'Jul 4 – 5',n:8,
   dates:['Jul 4','Jul 4','Jul 4','Jul 4','Jul 5','Jul 5','Jul 5','Jul 5']},
  {id:'qf', lbl:'Quarter-Finals',sub:'Jul 8 – 9',n:4,
   dates:['Jul 8','Jul 8','Jul 9','Jul 9']},
  {id:'sf', lbl:'Semi-Finals',sub:'Jul 14 – 15',n:2,
   dates:['Jul 14','Jul 15']}
];

// ═══════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════
let SD={};
try{SD=JSON.parse(localStorage.getItem('wc2026v3')||'{}');}catch(e){}
function sv(k,v){SD[k]=v;try{localStorage.setItem('wc2026v3',JSON.stringify(SD));}catch(e){}}
function ld(k,d){return SD[k]!==undefined?SD[k]:d;}

// ═══════════════════════════════════════════════════
// FLAG PICKER
// ═══════════════════════════════════════════════════
let _flagCb=null,_sch='';
function openFlagPicker(cb,cur){
  _flagCb=cb;
  document.getElementById('modal-search').value='';_sch='';
  renderFlagGrid(cur);
  document.getElementById('modal-bg').classList.add('open');
  setTimeout(()=>document.getElementById('modal-search').focus(),50);
}
function closeModal(e){if(e.target===document.getElementById('modal-bg'))document.getElementById('modal-bg').classList.remove('open');}
function filterFlags(){_sch=document.getElementById('modal-search').value.toLowerCase();renderFlagGrid();}
function renderFlagGrid(sel){
  const g=document.getElementById('flag-grid');
  const fl=_sch?FLAGS.filter(([f,n])=>n.toLowerCase().includes(_sch)):FLAGS;
  g.innerHTML=fl.map(([f,n])=>`
    <div class="flag-item ${sel===f?'selected':''}" onclick="pickFlag('${f}','${n.replace(/'/g,"&#39;")}')"}>
      <span>${f}</span><span>${n}</span>
    </div>`).join('');
}
function pickFlag(f,n){
  if(_flagCb)_flagCb(f,n);
  document.getElementById('modal-bg').classList.remove('open');
  notify('Bendera diperbarui ✓');
}

// ═══════════════════════════════════════════════════
// KLASEMEN OTOMATIS
// Hitung dari hasil pertandingan di fixtures
// ═══════════════════════════════════════════════════
function calcStandings(gi){
  const g = GROUPS[gi];
  // init stats for each team
  const stats = g.teams.map((_,ti)=>({ti,mp:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}));
  g.matches.forEach(m=>{
    const mk=`fx_g${gi}_${m.t1}v${m.t2}`;
    const s1=ld(`${mk}_s1`,'');
    const s2=ld(`${mk}_s2`,'');
    if(s1===''||s2==='')return; // unplayed
    const g1=parseInt(s1)||0, g2=parseInt(s2)||0;
    const t1=m.t1, t2=m.t2;
    stats[t1].mp++;stats[t2].mp++;
    stats[t1].gf+=g1;stats[t1].ga+=g2;
    stats[t2].gf+=g2;stats[t2].ga+=g1;
    if(g1>g2){stats[t1].w++;stats[t1].pts+=3;stats[t2].l++;}
    else if(g1<g2){stats[t2].w++;stats[t2].pts+=3;stats[t1].l++;}
    else{stats[t1].d++;stats[t1].pts++;stats[t2].d++;stats[t2].pts++;}
  });
  // sort: pts > gd > gf
  stats.sort((a,b)=>{
    if(b.pts!==a.pts)return b.pts-a.pts;
    const gdA=a.gf-a.ga,gdB=b.gf-b.ga;
    if(gdB!==gdA)return gdB-gdA;
    return b.gf-a.gf;
  });
  return stats;
}

// ═══════════════════════════════════════════════════
// BUILD GROUPS
// ═══════════════════════════════════════════════════
function buildGroups(){
  const grid=document.getElementById('groups-grid');
  grid.innerHTML='';
  GROUPS.forEach((g,gi)=>{
    const standings=calcStandings(gi);
    // Create sorted order map: original ti -> rank
    const rankOf={};standings.forEach((s,rank)=>rankOf[s.ti]=rank);
    const statsOf={};standings.forEach(s=>statsOf[s.ti]=s);

    const card=document.createElement('div');card.className='gc';
    let html=`<div class="gh"><span class="gl">GROUP ${g.l}</span><span class="gb">Jun 11–26</span></div>`;
    // col headers — added GD column
    html+=`<div class="col-h">
      <div class="ch">Tim</div>
      <div class="ch">M</div><div class="ch">W</div><div class="ch">D</div><div class="ch">L</div>
      <div class="ch">GD</div><div class="ch" style="color:var(--gold)">PTS</div>
    </div>`;
    // render in sorted order
    standings.forEach((s,rank)=>{
      const ti=s.ti;
      const qcls=rank===0?'q1':rank===1?'q2':rank===2?'q3':'';
      const fn=`g${gi}t${ti}flag`,nn=`g${gi}t${ti}name`;
      const f=ld(fn,g.teams[ti].f),n=ld(nn,g.teams[ti].n);
      const gd=(s.gf-s.ga);
      const gdStr=(gd>0?'+':'')+gd;
      html+=`<div class="tr ${qcls}" id="tr-g${gi}t${ti}">
        <div class="tn-cell">
          <button class="flag-btn" title="Ganti bendera"
            onclick="openFlagPicker(function(nf,nn){sv('g${gi}t${ti}flag',nf);sv('g${gi}t${ti}name',nn);buildGroups();buildFixtures();},'${f}')">${f}</button>
          <input class="team-name-inp" value="${n}"
            onchange="sv('g${gi}t${ti}name',this.value);buildFixtures()"
            onfocus="this.select()">
        </div>
        <span class="stat-inp">${s.mp}</span>
        <span class="stat-inp">${s.w}</span>
        <span class="stat-inp">${s.d}</span>
        <span class="stat-inp">${s.l}</span>
        <span class="stat-inp stat-gd" style="color:${gd>0?'var(--green)':gd<0?'var(--red)':'var(--text2)'}">${s.mp>0?gdStr:'—'}</span>
        <span class="stat-inp stat-pts">${s.pts}</span>
      </div>`;
    });
    card.innerHTML=html;
    grid.appendChild(card);
  });
}

// ═══════════════════════════════════════════════════
// BUILD FIXTURES
// ═══════════════════════════════════════════════════
function buildFixtures(){
  const c=document.getElementById('fixtures-container');
  const allM=[];
  GROUPS.forEach((g,gi)=>{
    g.matches.forEach((m,mi)=>allM.push({...m,gi,grp:g.l,mi}));
  });
  const byDate={};
  allM.forEach(m=>{
    if(!byDate[m.d])byDate[m.d]=[];
    byDate[m.d].push(m);
  });
  const tzAbbr=getTzAbbr();
  let html='';
  Object.keys(byDate).sort().forEach(date=>{
    html+=`<div class="fx-date-hdr">
      <span>📅 ${date} 2026</span>
      <span style="font-size:10px;color:var(--text2)">${tzAbbr}</span>
    </div><div class="fx-grid">`;
    byDate[date].forEach(m=>{
      const f1=ld(`g${m.gi}t${m.t1}flag`,GROUPS[m.gi].teams[m.t1].f);
      const n1=ld(`g${m.gi}t${m.t1}name`,GROUPS[m.gi].teams[m.t1].n);
      const f2=ld(`g${m.gi}t${m.t2}flag`,GROUPS[m.gi].teams[m.t2].f);
      const n2=ld(`g${m.gi}t${m.t2}name`,GROUPS[m.gi].teams[m.t2].n);
      const mk=`fx_g${m.gi}_${m.t1}v${m.t2}`;
      const s1=ld(`${mk}_s1`,''),s2=ld(`${mk}_s2`,'');
      const played=s1!==''&&s2!=='';
      const g1=played?parseInt(s1)||0:null,g2=played?parseInt(s2)||0:null;
      const win1=played&&g1>g2,win2=played&&g2>g1;
      const [kh,km]=GROUP_KO_TIMES[m.gi][m.mi]||[15,0];
      const localTime=getLocalTime(kh,km);
      html+=`<div class="fx-card">
        <div class="fx-top">
          <span class="fx-grp">GRUP ${m.grp}</span>
          <span class="fx-venue">${m.venue}</span>
        </div>
        <div class="fx-time-row">
          <span class="fx-time">⏰ ${localTime}</span>
          <span class="fx-tz-name">${tzAbbr}</span>
          <span style="font-family:var(--font);font-size:9px;color:var(--text2);opacity:.5">(${kh}:${String(km).padStart(2,'0')} EDT)</span>
        </div>
        <div class="fx-body">
          <div class="fx-team ${win1?'fx-win1':''}">
            <span class="fx-flag" onclick="openFlagPicker(function(nf,nn){sv('g${m.gi}t${m.t1}flag',nf);sv('g${m.gi}t${m.t1}name',nn);buildGroups();buildFixtures();},'${f1}')" title="Ganti bendera">${f1}</span>
            <span class="fx-tname" style="${win1?'color:var(--gold)':''}">${n1}</span>
          </div>
          <div class="fx-score-wrap">
            <input class="fx-score" value="${s1}" maxlength="2" placeholder="—"
              style="${win1?'color:var(--gold)':''}"
              onchange="saveFxScore('${mk}',1,this.value,${m.gi})"
              onfocus="this.select()">
            <span class="fx-sep">:</span>
            <input class="fx-score" value="${s2}" maxlength="2" placeholder="—"
              style="${win2?'color:var(--gold)':''}"
              onchange="saveFxScore('${mk}',2,this.value,${m.gi})"
              onfocus="this.select()">
          </div>
          <div class="fx-team right ${win2?'fx-win2':''}">
            <span class="fx-tname fx-tname-r" style="${win2?'color:var(--gold)':''}">${n2}</span>
            <span class="fx-flag" onclick="openFlagPicker(function(nf,nn){sv('g${m.gi}t${m.t2}flag',nf);sv('g${m.gi}t${m.t2}name',nn);buildGroups();buildFixtures();},'${f2}')" title="Ganti bendera">${f2}</span>
          </div>
        </div>
      </div>`;
    });
    html+=`</div>`;
  });
  c.innerHTML=html;
}

function saveFxScore(mk,side,val,gi){
  sv(`${mk}_s${side}`,val);
  // auto recalculate standings
  buildGroups();
  // also refresh fixtures to update highlight
  buildFixtures();
  notify('Skor disimpan · Klasemen diperbarui ✓');
}

// ═══════════════════════════════════════════════════
// BUILD KNOCKOUT
// ═══════════════════════════════════════════════════
function buildKO(id,n,lbl,sub,dates){
  const br=document.getElementById(`br-${id}`);
  if(!br)return;
  br.innerHTML='';
  const col=document.createElement('div');col.className='rcol';
  col.innerHTML=`<div class="rlabel">${lbl}<span>${sub}</span></div>`;
  const mc=document.createElement('div');mc.className='mcol';
  const times=KO_TIMES_EDT[id]||[];
  for(let i=0;i<n;i++){
    const mk=`${id}_m${i}`;
    const f1=ld(`${mk}_f1`,'🏳️'),t1=ld(`${mk}_t1`,`Tim ${i*2+1}`);
    const f2=ld(`${mk}_f2`,'🏳️'),t2=ld(`${mk}_t2`,`Tim ${i*2+2}`);
    const s1=ld(`${mk}_s1`,''),s2=ld(`${mk}_s2`,'');
    const w=ld(`${mk}_w`,0);
    const [kh,km]=times[i]||[18,0];
    const localTime=getLocalTime(kh,km);
    const tzAbbr=getTzAbbr();
    const div=document.createElement('div');
    div.innerHTML=`<div class="mcard">
      <div class="mdate">⚽ ${dates[i]||'TBD'}</div>
      <div class="mtime-row">
        <span class="mtime">${localTime}</span>
        <span class="mtz">${tzAbbr}</span>
      </div>
      <div class="mteam ${w===1?'winner':''}" onclick="setKOWinner('${mk}',1,this)">
        <button class="mflag-btn" onclick="event.stopPropagation();openFlagPicker(function(nf){sv('${mk}_f1',nf);rebuildAllKO();},'${f1}')">${f1}</button>
        <input class="mname" value="${t1}" onchange="sv('${mk}_t1',this.value)" onclick="event.stopPropagation()" onfocus="this.select()">
        <input class="mscore" value="${s1}" maxlength="2" onchange="sv('${mk}_s1',this.value)" onclick="event.stopPropagation()" onfocus="this.select()">
      </div>
      <div class="mteam ${w===2?'winner':''}" onclick="setKOWinner('${mk}',2,this)">
        <button class="mflag-btn" onclick="event.stopPropagation();openFlagPicker(function(nf){sv('${mk}_f2',nf);rebuildAllKO();},'${f2}')">${f2}</button>
        <input class="mname" value="${t2}" onchange="sv('${mk}_t2',this.value)" onclick="event.stopPropagation()" onfocus="this.select()">
        <input class="mscore" value="${s2}" maxlength="2" onchange="sv('${mk}_s2',this.value)" onclick="event.stopPropagation()" onfocus="this.select()">
      </div>
    </div>`;
    mc.appendChild(div);
  }
  col.appendChild(mc);br.appendChild(col);
}

function rebuildAllKO(){
  KO_ROUNDS.forEach(r=>buildKO(r.id,r.n,r.lbl,r.sub,r.dates));
  buildFinal();
}

function buildFinal(){
  const br=document.getElementById('br-final');if(!br)return;
  br.innerHTML='';
  const wrap=document.createElement('div');
  wrap.style.cssText='display:flex;align-items:center;gap:0;width:100%;min-width:560px';
  const mk='final_m0';
  const f1=ld(`${mk}_f1`,'🏳️'),t1=ld(`${mk}_t1`,'TBD');
  const f2=ld(`${mk}_f2`,'🏳️'),t2=ld(`${mk}_t2`,'TBD');
  const s1=ld(`${mk}_s1`,''),s2=ld(`${mk}_s2`,'');
  const w=ld(`${mk}_w`,0);
  const [fkh,fkm]=KO_TIMES_EDT.final[0]||[18,0];
  const finalLocalTime=getLocalTime(fkh,fkm);
  const tzAbbr=getTzAbbr();
  const fc=document.createElement('div');fc.className='rcol';fc.style.maxWidth='240px';
  fc.innerHTML=`
    <div class="rlabel" style="font-size:12px;color:var(--gold)">THE FINAL<span>19 Juli 2026 · MetLife, NJ</span></div>
    <div class="mcard final-card">
      <div class="mdate final-date">🏆 FIFA WORLD CUP FINAL</div>
      <div class="mtime-row" style="background:rgba(232,200,74,.08)">
        <span class="mtime">⏰ ${finalLocalTime}</span>
        <span class="mtz">${tzAbbr}</span>
      </div>
      <div class="mteam ${w===1?'winner':''}" onclick="setFinalWinner(1,this)">
        <button class="mflag-btn" onclick="event.stopPropagation();openFlagPicker(function(nf){sv('${mk}_f1',nf);buildFinal();},'${f1}')">${f1}</button>
        <input class="mname" value="${t1}" style="font-size:13px;font-weight:900"
          onchange="sv('${mk}_t1',this.value);updateChamp()" onclick="event.stopPropagation()" onfocus="this.select()">
        <input class="mscore" value="${s1}" style="font-size:14px;font-weight:900" maxlength="2"
          onchange="sv('${mk}_s1',this.value)" onclick="event.stopPropagation()" onfocus="this.select()">
      </div>
      <div class="mteam ${w===2?'winner':''}" onclick="setFinalWinner(2,this)">
        <button class="mflag-btn" onclick="event.stopPropagation();openFlagPicker(function(nf){sv('${mk}_f2',nf);buildFinal();},'${f2}')">${f2}</button>
        <input class="mname" value="${t2}" style="font-size:13px;font-weight:900"
          onchange="sv('${mk}_t2',this.value);updateChamp()" onclick="event.stopPropagation()" onfocus="this.select()">
        <input class="mscore" value="${s2}" style="font-size:14px;font-weight:900" maxlength="2"
          onchange="sv('${mk}_s2',this.value)" onclick="event.stopPropagation()" onfocus="this.select()">
      </div>
    </div>`;
  const champName=w===1?t1:w===2?t2:ld('champion','?');
  const cc=document.createElement('div');cc.className='champ-col';
  cc.innerHTML=`
    <div class="champ-trophy">🏆</div>
    <div class="champ-lbl">Juara Dunia</div>
    <input class="champ-name" id="champ-name" value="${champName}"
      onchange="sv('champion',this.value)" onfocus="this.select()">
    <div style="font-family:var(--font);font-size:10px;color:var(--text2);letter-spacing:2px;margin-top:3px">2026</div>`;
  wrap.appendChild(fc);wrap.appendChild(cc);br.appendChild(wrap);

  // 3rd place
  const tm='third_m0';
  const tf1=ld(`${tm}_f1`,'🏳️'),tt1=ld(`${tm}_t1`,'Semifinal Kalah 1');
  const tf2=ld(`${tm}_f2`,'🏳️'),tt2=ld(`${tm}_t2`,'Semifinal Kalah 2');
  const ts1=ld(`${tm}_s1`,''),ts2=ld(`${tm}_s2`,'');
  const tw=ld(`${tm}_w`,0);
  const [tkh,tkm]=KO_TIMES_EDT.third[0]||[14,0];
  const thirdLocalTime=getLocalTime(tkh,tkm);
  document.getElementById('br-3rd').innerHTML=`
    <div class="mcard">
      <div class="mdate" style="text-align:center;letter-spacing:2px">🥉 PEREBUTAN JUARA 3</div>
      <div class="mtime-row">
        <span class="mtime">⏰ ${thirdLocalTime}</span>
        <span class="mtz">${tzAbbr}</span>
      </div>
      <div class="mteam ${tw===1?'winner':''}" onclick="set3rdWinner(1,this)">
        <button class="mflag-btn" onclick="event.stopPropagation();openFlagPicker(function(nf){sv('${tm}_f1',nf);buildFinal();},'${tf1}')">${tf1}</button>
        <input class="mname" value="${tt1}" onchange="sv('${tm}_t1',this.value)" onclick="event.stopPropagation()" onfocus="this.select()">
        <input class="mscore" value="${ts1}" maxlength="2" onchange="sv('${tm}_s1',this.value)" onclick="event.stopPropagation()" onfocus="this.select()">
      </div>
      <div class="mteam ${tw===2?'winner':''}" onclick="set3rdWinner(2,this)">
        <button class="mflag-btn" onclick="event.stopPropagation();openFlagPicker(function(nf){sv('${tm}_f2',nf);buildFinal();},'${tf2}')">${tf2}</button>
        <input class="mname" value="${tt2}" onchange="sv('${tm}_t2',this.value)" onclick="event.stopPropagation()" onfocus="this.select()">
        <input class="mscore" value="${ts2}" maxlength="2" onchange="sv('${tm}_s2',this.value)" onclick="event.stopPropagation()" onfocus="this.select()">
      </div>
    </div>`;
}

function setKOWinner(mk,num,el){
  const card=el.closest('.mcard');
  [...card.querySelectorAll('.mteam')].forEach((t,i)=>t.classList.toggle('winner',i+1===num));
  sv(`${mk}_w`,num);notify('Pemenang dicatat ✓');
}
function setFinalWinner(num,el){
  const card=el.closest('.mcard');
  [...card.querySelectorAll('.mteam')].forEach((t,i)=>t.classList.toggle('winner',i+1===num));
  sv('final_m0_w',num);updateChamp();notify('Juara Dunia ditetapkan 🏆');
}
function set3rdWinner(num,el){
  const card=el.closest('.mcard');
  [...card.querySelectorAll('.mteam')].forEach((t,i)=>t.classList.toggle('winner',i+1===num));
  sv('third_m0_w',num);notify('Juara 3 dicatat ✓');
}
function updateChamp(){
  const w=ld('final_m0_w',0);
  const names=document.querySelectorAll('#br-final .mname');
  const cn=document.getElementById('champ-name');
  if(cn&&names.length>=2){const nm=w===1?names[0].value:w===2?names[1].value:ld('champion','?');cn.value=nm;sv('champion',nm);}
}

// ═══════════════════════════════════════════════════
// TABS / UTILS
// ═══════════════════════════════════════════════════
function switchTab(id,el){
  document.querySelectorAll('.phase').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById(`phase-${id}`).classList.add('active');
  el.classList.add('active');
}
function resetAll(){
  if(!confirm('Reset semua data? Tidak bisa dibatalkan.'))return;
  try{localStorage.removeItem('wc2026v3');}catch(e){}
  SD={};location.reload();
}
function notify(msg){
  const n=document.getElementById('notif');n.textContent=msg;
  n.classList.add('show');setTimeout(()=>n.classList.remove('show'),2200);
}
function updateDays(){
  const ko=new Date('2026-06-11'),now=new Date();
  const d=Math.ceil((ko-now)/86400000);
  const el=document.getElementById('dcount');
  if(el)el.textContent=d>0?d:'▶';
}

// ═══════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════
currentTZ = ld('tz',0);
buildTzSelect();
buildGroups();
buildFixtures();
KO_ROUNDS.forEach(r=>buildKO(r.id,r.n,r.lbl,r.sub,r.dates));
buildFinal();
updateDays();