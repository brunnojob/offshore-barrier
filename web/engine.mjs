export const controls = ['lift_plan', 'equipment', 'capacity', 'exclusion_zone', 'communication', 'environment', 'simops'];
export const ruleset = 'lifting-demo/0.1.0';
function instant(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(value)) return NaN;
  const calendar = new Date(value.slice(0,10)+'T00:00:00Z');
  if (!Number.isFinite(+calendar) || calendar.toISOString().slice(0,10) !== value.slice(0,10) || Number(value.slice(11,13)) > 23 || Number(value.slice(14,16)) > 59 || Number(value.slice(17,19)) > 59) return NaN;
  return Date.parse(value);
}
export function evaluate(payload, now = new Date()) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) || !payload.operation_id?.trim() || !payload.area?.trim() || payload.activity !== 'lifting' || payload.mode !== 'simulation' || !payload.checks || Array.isArray(payload.checks) || typeof payload.checks !== 'object' || !Number.isFinite(+now)) throw new Error('Invalid input');
  if (Object.keys(payload.checks).some(k => !controls.includes(k))) throw new Error('Unknown control');
  const rows = controls.map(control => {
    const check = payload.checks[control];
    let state = 'unknown';
    if (check != null) {
      if (typeof check !== 'object' || !['confirmed', 'failed', 'unknown'].includes(check.status)) throw new Error('Invalid status');
      if (check.status === 'failed') state = 'failed';
      if (check.status === 'confirmed') {
        const complete = ['evidence_ref', 'verified_by', 'procedure_ref'].every(k => typeof check[k] === 'string' && check[k].trim());
        const observed = instant(check.observed_at), expires = instant(check.expires_at);
        if (complete && Number.isFinite(observed) && Number.isFinite(expires) && observed <= +now && expires > observed) state = expires <= +now ? 'expired' : 'recorded';
      }
    }
    return {control, state, submitted: check ?? null};
  });
  const result = rows.some(r => r.state === 'failed') ? 'BARRIER_FAILURE_RECORDED' : rows.some(r => r.state !== 'recorded') ? 'INCOMPLETE_EVIDENCE' : 'READY_FOR_HUMAN_REVIEW';
  return {operation_id: payload.operation_id, area: payload.area, mode: 'simulation', ruleset, evaluated_at: now.toISOString(), result, work_authorized: false, controls: rows};
}
export function sample(scenario = 'failure', now = new Date()) {
  const checks = Object.fromEntries(controls.map(key => [key, {status:'confirmed', evidence_ref:`SIM-${key}`, procedure_ref:'SIM-PLAN-001', verified_by:'SIM-TEAM', observed_at:new Date(+now - 60000).toISOString(), expires_at:new Date(+now + 3600000).toISOString()}]));
  if (scenario === 'failure') checks.exclusion_zone.status = 'failed';
  if (scenario === 'missing') delete checks.communication;
  if (scenario === 'expired') checks.environment.expires_at = new Date(+now - 1000).toISOString();
  return {operation_id:'SIM-LIFT-001', area:'DECK-A', activity:'lifting', mode:'simulation', checks};
}
