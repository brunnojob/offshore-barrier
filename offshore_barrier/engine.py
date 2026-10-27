"""Deterministic checks for a simulated lifting review, not a work permit."""

from datetime import datetime, timezone

RULESET = "lifting-demo/0.1.0"
CONTROLS = {
    "lift_plan": "Plano de içamento revisado por pessoa competente",
    "equipment": "Equipamentos e acessórios com inspeção registrada",
    "capacity": "Capacidade avaliada para a configuração e a carga",
    "exclusion_zone": "Zona de exclusão estabelecida e verificada",
    "communication": "Comunicação e responsabilidades verificadas",
    "environment": "Condições ambientais avaliadas frente ao plano",
    "simops": "Interferências com operações simultâneas avaliadas",
}


def timestamp(value):
    if not isinstance(value, str):
        raise ValueError("Data deve ser texto ISO 8601 com fuso.")
    try:
        result = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError("Data inválida; utilize ISO 8601 com fuso.") from exc
    if result.tzinfo is None:
        raise ValueError("Data sem fuso horário.")
    return result.astimezone(timezone.utc)


def required_text(obj, key):
    value = obj.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"Campo obrigatório: {key}")
    return value.strip()


def evaluate(payload, now=None):
    if not isinstance(payload, dict):
        raise ValueError("Entrada deve ser objeto JSON.")
    operation = required_text(payload, "operation_id")
    required_text(payload, "area")
    if payload.get("activity") != "lifting":
        raise ValueError("Atividade suportada nesta versão: lifting.")
    if payload.get("mode") != "simulation":
        raise ValueError("Esta versão aceita apenas mode=simulation.")
    checks = payload.get("checks")
    if not isinstance(checks, dict):
        raise ValueError("checks deve ser um objeto.")
    if set(checks) - set(CONTROLS):
        raise ValueError("Controle desconhecido; verifique os identificadores.")
    now = now or datetime.now(timezone.utc)
    if not isinstance(now, datetime) or now.tzinfo is None:
        raise ValueError("Instante de avaliação deve ter fuso horário.")
    rows = []
    for key, title in CONTROLS.items():
        check = checks.get(key)
        state, reason = "unknown", "Verificação ausente."
        if check is not None:
            if not isinstance(check, dict):
                raise ValueError(f"{key}: verificação deve ser objeto.")
            status = check.get("status")
            if status not in ("confirmed", "failed", "unknown"):
                raise ValueError(f"{key}: status inválido.")
            if status == "failed":
                state, reason = "failed", "Barreira declarada falha; requer tratamento e nova verificação."
            elif status == "confirmed":
                try:
                    for field in ("evidence_ref", "verified_by", "procedure_ref"):
                        required_text(check, field)
                    observed = timestamp(check.get("observed_at"))
                    expires = timestamp(check.get("expires_at"))
                    if observed > now:
                        reason = "Verificação no futuro."
                    elif expires <= observed:
                        reason = "Validade inconsistente com a observação."
                    elif now >= expires:
                        state, reason = "expired", "Evidência vencida."
                    else:
                        state, reason = "recorded", "Declaração registrada; evidência não autenticada pelo protótipo."
                except ValueError as exc:
                    reason = f"Confirmação incompleta: {exc}"
            else:
                reason = "Condição não confirmada."
        rows.append({"control": key, "title": title, "state": state,
                     "reason": reason, "submitted": check})
    if any(row["state"] == "failed" for row in rows):
        result = "BARRIER_FAILURE_RECORDED"
    elif any(row["state"] != "recorded" for row in rows):
        result = "INCOMPLETE_EVIDENCE"
    else:
        result = "READY_FOR_HUMAN_REVIEW"
    return {"operation_id": operation, "area": payload["area"],
            "mode": "simulation", "ruleset": RULESET,
            "evaluated_at": now.isoformat(), "result": result,
            "work_authorized": False, "controls": rows,
            "notice": "Protótipo: não emite PT nem atesta segurança ou conformidade."}
