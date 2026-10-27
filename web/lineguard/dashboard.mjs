import {Monitor} from './model.mjs';
const $=id=>document.getElementById(id);
let monitor=new Monitor(), port=null, reader=null, connected=false, connecting=false, running=false;
let simulation=true, selectedZone='alert', currentState='alert', lastState='', audio=null, soundEnabled=false, lastTone=0;
const events=[], samples=[];
const copy={
 safe:['ZONA SEGURA · SOMENTE TESTE','Estado fictício para verificar LED apagado e ausência de aviso. Não significa área livre ou segura.'],
 alert:['ZONA DE ALERTA · TESTE','Estado fictício para verificar indicação azul fixa e aviso de atenção.'],
 risk:['RISCO · EVENTO RETIDO','O PIR informou movimento. O evento permanece retido mesmo após o sinal baixar. Não mede distância nem identifica qual objeto se moveu.'],
 unverified:['ZONA NÃO VERIFICADA','PIR sem movimento ativo. Isso não exclui mão parada, ponto cego, falha do sensor ou carga. LED fixo: condição de atenção.'],
 warmup:['AQUECIMENTO DO PIR','A estabilização inicial está em andamento. Nenhuma zona segura será inferida. LED azul fixo.'],
 offline:['SEM DADOS CONFIÁVEIS','Conexão ausente, mensagem inválida ou telemetria vencida. Não há confirmação do estado físico do LED nem da área.']
};
function record(text){const event={at:new Date().toISOString(),text};events.push(event);if(events.length>100)events.shift();const li=document.createElement('li');li.textContent=`${new Date(event.at).toLocaleTimeString('pt-BR')} · ${text}`;$('events').prepend(li);while($('events').children.length>100)$('events').lastChild.remove();}
function paint(){
 const f=simulation?null:monitor.frame;
 currentState=simulation?selectedZone:monitor.view();
 const test=simulation||f?.mode==='led_test';
 document.body.dataset.state=currentState;
 $('state').textContent=copy[currentState][0];
 $('explanation').textContent=copy[currentState][1];
 if(currentState==='risk'&&test){$('state').textContent='ZONA DE RISCO · TESTE';$('explanation').textContent='Teste de indicação piscante e som. Os dados de teste não medem aproximação. Se o PIR real reter risco, o firmware impede que um teste desligue o LED.';}
 if(f?.live_state==='risk'&&currentState==='risk'){$('state').textContent='RISCO RETIDO · PIR';$('explanation').textContent=copy.risk[1];}
 $('mode').textContent=simulation?'SIMULAÇÃO LOCAL':currentState==='offline'?'SEM TELEMETRIA':f?.mode==='led_test'?'TESTE DE LED · 5 s':'USB · LEITURA REAL';
 $('scene').className='scene '+(currentState==='risk'?'is-risk':currentState==='safe'?'is-safe':'');
 $('led').className='led '+(currentState==='risk'?'blink':currentState==='safe'||currentState==='offline'?'':'on');
 $('ledText').textContent=currentState==='risk'?'LED azul piscando · 4 Hz':currentState==='safe'?'LED azul apagado':currentState==='offline'?'Estado físico desconhecido':'LED azul aceso fixo';
 $('ledSource').textContent=simulation?'Representação da simulação':currentState==='offline'?'Sem confirmação do ESP32':'Padrão esperado pelo firmware; sem retorno óptico';
 const fresh=!simulation&&currentState!=='offline';
 $('pir').textContent=simulation?'SIMULADO':fresh?(f.pir?'MOVIMENTO':'SEM MOVIMENTO'):'DESCONHECIDO';
 $('temp').textContent=fresh&&f.dht_ok?`${f.temperature_c.toFixed(1)} °C`:'— °C';
 $('humidity').textContent=fresh&&f.dht_ok?`${f.humidity_pct.toFixed(1)} %`:'— %';
 $('tempStatus').textContent=fresh?(f.dht_ok?'DHT11 · ambiente':'DHT11 sem leitura válida'):'Sem leitura real vigente';
 $('humidityStatus').textContent=fresh&&!f.dht_ok?'Falha de leitura DHT11':'Não mede piso molhado';
 $('age').textContent=monitor.lastReceived&&!simulation?`${((Date.now()-monitor.lastReceived)/1000).toFixed(1)} s`:'—';
 $('identity').textContent=f&&!simulation?`${f.device_id} · seq ${f.seq}`:'Sem dispositivo';
 $('connection').textContent=simulation?'DEMONSTRAÇÃO LOCAL':connecting?'CONECTANDO':connected?'USB CONECTADO · VERIFIQUE OS DADOS':'DESCONECTADO';
 $('connect').disabled=connected||connecting;$('disconnect').disabled=!connected;
 $('reset').disabled=!fresh||f.pir||f.mode!=='live'||f.state==='warmup';
 $('ledTest').disabled=!connected;$('live').disabled=!connected;
 $('testNotice').textContent=connected?`Selecionado: ${selectedZone}. Clique em aplicar para enviar um teste explícito de 5 s à placa. Risco real retido prevalece.`:'Teste somente no dashboard. Para testar o LED físico, conecte o ESP32 e clique explicitamente em aplicar.';
 document.querySelectorAll('[data-zone]').forEach(b=>b.classList.toggle('active',b.dataset.zone===selectedZone));
 if(lastState!==`${currentState}/${test}`){record(`${simulation?'Simulação':f?.mode==='led_test'?'Teste de LED':'Hardware'}: ${$('state').textContent}`);lastState=`${currentState}/${test}`;}
 $('audioState').textContent=!soundEnabled?'Som desabilitado. O ESP32 não produz áudio sem transdutor.':audio?.state==='running'?'Áudio habilitado no navegador. Confira o volume e a saída do dispositivo.':'Áudio suspenso ou indisponível. Clique em habilitar som novamente.';
}
function tone(frequency=880,duration=.12){
 if(!audio||audio.state!=='running')return;
 const osc=audio.createOscillator(),gain=audio.createGain();
 osc.type='sine';osc.frequency.value=frequency;gain.gain.setValueAtTime(0,audio.currentTime);gain.gain.linearRampToValueAtTime(.12,audio.currentTime+.015);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+duration+.02);osc.onended=()=>{osc.disconnect();gain.disconnect();};
}
async function enableAudio(){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw new Error('Web Audio indisponível.');audio??=new Audio();await audio.resume();soundEnabled=true;$('sound').textContent='Desabilitar som';paint();}
$('sound').onclick=async()=>{try{if(soundEnabled){soundEnabled=false;$('sound').textContent='Habilitar som';paint();}else await enableAudio();}catch(e){$('audioState').textContent=e.message;}};
$('testSound').onclick=async()=>{try{await enableAudio();tone(880,.25);record('Teste de som solicitado: confirme se você ouviu.');}catch(e){$('audioState').textContent=e.message;}};
async function send(command){if(!port?.writable)throw new Error('Porta serial indisponível.');const writer=port.writable.getWriter();try{await writer.write(new TextEncoder().encode(JSON.stringify(command)+'\n'));}finally{writer.releaseLock();}}
async function disconnect(){running=false;try{await reader?.cancel();}catch{}connected=false;monitor.fault=true;simulation=false;paint();}
$('disconnect').onclick=disconnect;
$('connect').onclick=async()=>{
 if(!('serial' in navigator)){$('message').textContent='Web Serial indisponível. Use Chrome/Edge desktop em HTTPS ou localhost. A simulação continua disponível.';return;}
 connecting=true;simulation=false;monitor=new Monitor();paint();
 try{
  port=await navigator.serial.requestPort();
  await port.open({baudRate:115200});connected=true;connecting=false;running=true;
  $('message').textContent='USB aberto. Aguardando JSON LineGuard; use o firmware desta pasta e feche Thonny/monitor serial.';paint();
  await send({cmd:'live'});
  reader=port.readable.getReader();let buffer='',decoder=new TextDecoder();
  while(running){const {value,done}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});if(buffer.length>16384){buffer='';monitor.fault=true;$('message').textContent='Entrada excedeu o limite; aguardando uma nova mensagem válida.';paint();}
   let i;while((i=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,i).trim();buffer=buffer.slice(i+1);if(!line)continue;
    try{const f=monitor.accept(line);samples.push({...f,received_at:new Date().toISOString()});if(samples.length>600)samples.shift();$('message').textContent=f.mode==='led_test'?'Teste explícito de LED ativo por no máximo 5 s. Não é zona medida.':f.state==='warmup'?`PIR em estabilização: ${Math.ceil(f.warmup_remaining_ms/1000)} s restantes.`:'Mensagens LineGuard recebidas. PIR não verifica distância nem presença estática.';}
    catch(e){monitor.fault=true;$('message').textContent=`Mensagem rejeitada: ${e.message}`;}
    paint();
   }
  }
 }catch(e){$('message').textContent=`Conexão não disponível: ${e.message}. Se a porta estiver ocupada, feche Thonny/Arduino Serial Monitor.`;}
 finally{running=false;connecting=false;connected=false;monitor.fault=true;try{reader?.releaseLock();}catch{}reader=null;try{await port?.close();}catch{}port=null;paint();}
};
if('serial' in navigator)navigator.serial.addEventListener('disconnect',()=>{if(connected)disconnect();});
document.querySelectorAll('[data-zone]').forEach(b=>b.onclick=()=>{selectedZone=b.dataset.zone;if(!connected&&!connecting){simulation=true;monitor=new Monitor();}paint();});
$('ledTest').onclick=async()=>{try{await send({cmd:'demo',zone:selectedZone});record(`Teste de LED solicitado: ${selectedZone} por 5 s; aguardando retorno.`);}catch(e){$('message').textContent=e.message;}};
$('live').onclick=async()=>{try{await send({cmd:'live'});record('Retorno à leitura real solicitado.');}catch(e){$('message').textContent=e.message;}};
$('reset').onclick=async()=>{try{await send({cmd:'reset'});record('Rearme solicitado; depende do estado do PIR na placa.');}catch(e){$('message').textContent=e.message;}};
$('export').onclick=()=>{const blob=new Blob([JSON.stringify({exported_at:new Date().toISOString(),work_authorized:false,events,samples,notice:'Dados de bancada. PIR não define zonas espaciais.'},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='lineguard-session.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
setInterval(()=>{paint();const alarm=['risk','alert','unverified','warmup','offline'].includes(currentState),period=currentState==='risk'?600:2000;if(soundEnabled&&alarm&&Date.now()-lastTone>=period){tone(currentState==='risk'?980:620);lastTone=Date.now();}},250);
paint();
