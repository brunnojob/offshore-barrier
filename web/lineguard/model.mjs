export const states = ['safe','alert','risk','unverified','warmup'];
export function parseFrame(line) {
  const f = JSON.parse(line);
  if (!f || f.schema !== 'lineguard/1' || typeof f.device_id !== 'string' || !f.device_id || typeof f.session !== 'string' || !f.session || !Number.isSafeInteger(f.seq) || f.seq < 1 || !Number.isSafeInteger(f.uptime_ms) || f.uptime_ms < 0 || !['live','led_test'].includes(f.mode) || !states.includes(f.state) || !['risk','unverified','warmup'].includes(f.live_state) || typeof f.pir !== 'boolean' || typeof f.latched !== 'boolean' || typeof f.led_on !== 'boolean' || typeof f.dht_ok !== 'boolean' || f.work_authorized !== false) throw new Error('Mensagem fora do protocolo LineGuard.');
  if (f.mode==='live' && (f.state !== f.live_state || f.state === 'safe' || f.state === 'alert')) throw new Error('Estado real inconsistente.');
  if ((f.live_state==='risk')!==f.latched || (f.latched && f.state!=='risk')) throw new Error('Retenção de risco inconsistente.');
  if (f.dht_ok && (!Number.isFinite(f.temperature_c) || !Number.isFinite(f.humidity_pct) || f.humidity_pct < 0 || f.humidity_pct > 100)) throw new Error('Leitura ambiental inválida.');
  if (!Number.isFinite(f.warmup_remaining_ms) || f.warmup_remaining_ms < 0) throw new Error('Aquecimento inválido.');
  return f;
}
export class Monitor {
  constructor() {this.frame=null;this.lastReceived=null;this.lastSeq=0;this.session=null;this.device=null;this.fault=false;this.sessions=new Set();}
  accept(line, now=Date.now()) {
    const f=parseFrame(line);
    if(this.device && this.device!==f.device_id)throw new Error('Dispositivo mudou. Reconecte.');
    if(this.session===f.session && f.seq<=this.lastSeq)throw new Error('Mensagem duplicada ou fora de ordem.');
    if(this.session!==f.session && this.sessions.has(f.session))throw new Error('Sessão de inicialização antiga.');
    this.sessions.add(f.session);
    this.device=f.device_id;this.session=f.session;this.lastSeq=f.seq;this.lastReceived=now;this.frame=f;this.fault=false;return f;
  }
  view(now=Date.now()) {return !this.frame || this.fault || now-this.lastReceived>=3000 ? 'offline' : this.frame.state;}
}
