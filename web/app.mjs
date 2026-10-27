import {controls, evaluate, sample} from './engine.mjs';
import {projects} from './projects.mjs';
const en = {
skip:'Skip to content',navSim:'Simulator',navTargets:'Project targets',navArch:'Architecture',eyebrow:'PREVENTION ENGINEERING / LAB 001',headline:'Before an accident,<br>there is a barrier.',intro:'Make failures between planning and operation visible. Explore lifting barriers and embedded project concepts for offshore risks.',try:'Explore the simulator ↗',explore:'Discover the projects →',statControls:'barriers in the pilot',statTargets:'project targets',statCore:'Python engine',mapTag:'CONCEPT MAP · NON-OPERATIONAL',mapText:'One platform. Multiple layers of prevention.',notice:'Demonstration with fictitious data. Does not authorize work, control equipment or replace certified systems.',simEye:'01 / EXPLORE THE WORKFLOW',simTitle:'One failure changes the review.',simIntro:'Choose a scenario or change each barrier. The result shows what needs attention without hiding failures in an average.',lifting:'Lifting review',simulation:'SIMULATION',scenarioLabel:'Load a scenario',optFailure:'Exclusion zone failure',optMissing:'Communication without evidence',optExpired:'Expired environmental check',optComplete:'All records complete',editNote:'The “recorded” options create fictitious references valid for one hour. No document is authenticated.',resultLabel:'REVIEW RESULT',recorded:'current declarations',never:'Work authorization: NOT ISSUED',export:'Download review JSON ↓',privacy:'No login or token. In-memory data; reload resets the demonstration.',teleEye:'BENCH / DECKWATCH',teleTitle:'Silence is a signal, too.',teleIntro:'Simulate a wet surface and interrupt telemetry. Without recent messages, the state becomes unknown.',synthetic:'SYNTHETIC DATA',wet:'Simulate a wet floor',teleLimit:'A 1 s heartbeat and 5 s timeout only demonstrate the logic. These are not operational parameters.',targetsEye:'02 / FROM RISK TO PROTOTYPE',targetsTitle:'Projects we can build.',targetsIntro:'Nine development targets. Each proposal has a target risk, bench components and a validation path.',filter:'Filter by focus',all:'All targets',people:'Occupational safety',process:'Process safety',logistics:'Logistics and transport',hardwareTitle:'There is an engineering phase between the bench and offshore.',hardwareNote:'ESP32 boards, sensors and development kits here are laboratory proposals. Installation in a hazardous area requires assessment and equipment suitable for the atmosphere, along with reliability, environmental and integration validation. A prototype is not a certified protective device.',archEye:'03 / NEXT STEPS',archTitle:'Start small.<br>Validate each layer.',archText:'First, validate bench behavior. Then review controls with specialists and observe usage without interfering with operational decisions.',hardwareLink:'Explore the hardware projects ↗',step1:'Engine and demonstration',step1Text:'Python for record review; JavaScript version in the browser, with cross-engine scenario tests.',step2:'DeckWatch bench prototype',step2Text:'MicroPython firmware with a button to simulate moisture, heartbeat and a local LED. No physical testing performed.',step3:'Validation and observational pilot',step3Text:'Evaluate missed failures, nuisance alerts and review time before considering real integrations.',sources:'Technical references',footer:'Open source · MIT · Research prototype'
};
const pt = Object.fromEntries([...document.querySelectorAll('[data-i]')].map(el => [el.dataset.i, el.innerHTML]));
let lang = 'pt', payload = sample(), result, streaming = true, lastMessage = Date.now(), lastWet = false;
const labels = {pt:['Plano revisado','Equipamentos inspecionados','Capacidade avaliada','Zona de exclusão','Comunicação verificada','Ambiente avaliado','Operações simultâneas'],en:['Reviewed lift plan','Inspected equipment','Assessed capacity','Exclusion zone','Verified communication','Assessed environment','Simultaneous operations']};
const states = {pt:{recorded:'Registro vigente',failed:'Falha declarada',unknown:'Não confirmado',expired:'Evidência vencida'},en:{recorded:'Current record',failed:'Declared failure',unknown:'Unconfirmed',expired:'Expired evidence'}};
const titles = {pt:{BARRIER_FAILURE_RECORDED:'Barreira com falha declarada.',INCOMPLETE_EVIDENCE:'Existem evidências pendentes.',READY_FOR_HUMAN_REVIEW:'Registros para revisão humana.'},en:{BARRIER_FAILURE_RECORDED:'A barrier failure is recorded.',INCOMPLETE_EVIDENCE:'Evidence needs attention.',READY_FOR_HUMAN_REVIEW:'Records for human review.'}};
const descriptions = {pt:{BARRIER_FAILURE_RECORDED:'A falha permanece em destaque mesmo com os demais registros completos. Encaminhe a pendência para tratamento e nova verificação.',INCOMPLETE_EVIDENCE:'Uma verificação ausente, incompleta ou vencida não conta como registro vigente.',READY_FOR_HUMAN_REVIEW:'Os sete registros estão completos neste modelo. Isso não comprova segurança, autenticidade das evidências ou autorização de trabalho.'},en:{BARRIER_FAILURE_RECORDED:'The failure remains visible even when other records are complete. Route the issue for treatment and a new check.',INCOMPLETE_EVIDENCE:'A missing, incomplete or expired check does not count as a current record.',READY_FOR_HUMAN_REVIEW:'The seven records are complete in this model. This does not establish safety, evidence authenticity or work authorization.'}};
const $ = id => document.getElementById(id);
function renderChecks() {
  $('checks').replaceChildren();
  controls.forEach((key, i) => {
    const row = document.createElement('label'); row.className = 'check';
    const num = document.createElement('span'); num.className = 'num'; num.textContent = `0${i+1}`;
    const title = document.createElement('span'); title.textContent = labels[lang][i];
    const select = document.createElement('select'); select.setAttribute('aria-label',labels[lang][i]);
    Object.entries(states[lang]).forEach(([value,text]) => select.add(new Option(text,value)));
    const current = result.controls.find(r=>r.control===key).state; select.value = current;
    select.addEventListener('change', () => {
      const fresh = sample('complete').checks[key];
      if (select.value === 'unknown') fresh.status = 'unknown';
      if (select.value === 'failed') fresh.status = 'failed';
      if (select.value === 'expired') fresh.expires_at = new Date(Date.now()-1000).toISOString();
      payload.checks[key] = fresh; update();
    });
    row.append(num,title,select); $('checks').append(row);
  });
}
function update() {
  result = evaluate(payload);
  $('resultTitle').textContent = titles[lang][result.result];
  $('resultText').textContent = descriptions[lang][result.result];
  $('recorded').textContent = `${result.controls.filter(r=>r.state==='recorded').length}/7`;
  $('resultIcon').textContent = result.result === 'READY_FOR_HUMAN_REVIEW' ? '↗' : '!';
  $('resultIcon').style.color = result.result === 'READY_FOR_HUMAN_REVIEW' ? '#247264' : '#8e421d';
  $('issues').replaceChildren();
  result.controls.forEach((row,i) => {if(row.state!=='recorded'){const li=document.createElement('li');li.textContent=`${labels[lang][i]} · ${states[lang][row.state]}`;$('issues').append(li);}});
  renderChecks();
}
function renderProjects() {
  const chosen = projects.filter(p => $('filter').value === 'all' || p.group === $('filter').value);
  $('projectCount').textContent = `${chosen.length} / 9 ${lang==='pt'?'projetos':'projects'}`;
  $('projects').replaceChildren();
  chosen.forEach(p=>{
    const n = lang==='pt'?0:1, card=document.createElement('article');card.className='project';
    const top=document.createElement('div');top.className='project-top';
    const id=document.createElement('span');id.textContent=`TARGET / ${p.id}`;
    const stage=document.createElement('span');stage.textContent=p.stage[n];top.append(id,stage);
    const title=document.createElement('h3');title.textContent=p.name;
    const risk=document.createElement('p');risk.className='risk';risk.textContent=p.risk[n];
    const purpose=document.createElement('p');purpose.className='purpose';purpose.textContent=p.purpose[n];
    const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent=lang==='pt'?'Componentes, fluxo e validação':'Components, flow and validation';
    const dl=document.createElement('dl');
    [['parts',['Componentes de bancada','Bench components']],['flow',['Funcionamento proposto','Proposed workflow']],['test',['Como validar','How to validate']],['limit',['Limitação','Limitation']]].forEach(([key,label])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label[n];dd.textContent=p[key][n];dl.append(dt,dd);});
    details.append(summary,dl);card.append(top,title,risk,purpose,details);$('projects').append(card);
  });
}
function telemetry() {
  const age = Math.floor((Date.now()-lastMessage)/1000), stale = age >= 5;
  $('sensorState').textContent = stale ? (lang==='pt'?'DESCONHECIDO · sem telemetria':'UNKNOWN · no telemetry') : lastWet ? (lang==='pt'?'CONDIÇÃO MOLHADA SIMULADA':'SIMULATED WET CONDITION') : (lang==='pt'?'SEM CONDIÇÃO MOLHADA SIMULADA':'NO SIMULATED WET CONDITION');
  $('sensorState').style.color=stale?'#f2ba58':lastWet?'#eeaa75':'#80d5bd';
  $('sensorAge').textContent=lang==='pt'?`Última mensagem: ${age} s · qualidade ${stale?'desconhecida':'sintética'}`:`Last message: ${age} s · ${stale?'unknown':'synthetic'} quality`;
  $('stream').textContent=streaming?(lang==='pt'?'Interromper mensagens':'Stop messages'):(lang==='pt'?'Retomar mensagens':'Resume messages');
  document.querySelector('.signal').classList.toggle('live',streaming);
}
$('scenario').addEventListener('change',()=>{payload=sample($('scenario').value);update();});
$('lang').addEventListener('change',()=>{lang=$('lang').value;document.documentElement.lang=lang==='pt'?'pt-BR':'en';document.querySelectorAll('[data-i]').forEach(el=>el.innerHTML=(lang==='pt'?pt:en)[el.dataset.i]);document.title=lang==='pt'?'Offshore Barrier — Laboratório de prevenção':'Offshore Barrier — Prevention engineering lab';$('platform-title').textContent=lang==='pt'?'Conceito de plataforma offshore':'Offshore platform concept';update();renderProjects();telemetry();});
$('filter').addEventListener('change',renderProjects);
$('stream').addEventListener('click',()=>{streaming=!streaming;if(streaming){lastMessage=Date.now();lastWet=$('wet').checked;}telemetry();});
$('wet').addEventListener('change',()=>{if(streaming){lastMessage=Date.now();lastWet=$('wet').checked;}telemetry();});
$('export').addEventListener('click',()=>{update();const blob=new Blob([JSON.stringify({...result,notice:lang==='pt'?pt.notice:en.notice},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='offshore-barrier-review.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
setInterval(()=>{if(streaming){lastMessage=Date.now();lastWet=$('wet').checked;}telemetry();},1000);
setInterval(update,15000);
update();renderProjects();telemetry();
