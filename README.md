# Offshore Barrier

Protótipo em Python para identificar lacunas nas verificações de barreiras antes de operações offshore. Primeiro módulo: içamento. Autoria do projeto: brunnodev.store.

O problema escolhido é a perda de visibilidade sobre controles que foram declarados, falharam ou perderam validade entre o planejamento e a revisão da atividade. O objetivo inicial é tornar essas lacunas explícitas e rastreáveis.

[Dashboard LineGuard: ESP32 + PIR + DHT11](https://brunnojob.github.io/offshore-barrier/lineguard/) · [Firmware e ligações](hardware/lineguard/README.md)

[Demonstração interativa](https://brunnojob.github.io/offshore-barrier/) · [Projetos de hardware](hardware/README.md) · [DeckWatch](hardware/deckwatch/README.md)

## Demonstração e projetos alvo

Pages responsivo em PT-BR/EN: sete barreiras editáveis, quatro cenários, exportação JSON, simulação de perda de telemetria e catálogo de nove projetos. Sem login, token ou backend. Os dados ficam somente em memória e são reiniciados ao recarregar. O motor Python continua disponível para uso local; a demonstração executa JavaScript no navegador.

Projetos: DeckWatch (piso), LiftZone (içamento), LineGuard (prensamento), GasLink (H2S), ThermoTag (queimaduras), BarrierPulse (processo), ApproachWatch (aproximação marítima), MotionLog (movimento) e HeliReady (preparação de embarque). Cada proposta descreve componentes, fluxo, validação e limitações. DeckWatch e LineGuard incluem firmware inicial de bancada; não houve ensaio em placa. LineGuard lê PIR/DHT11 por USB, mantém evento de movimento retido, sinaliza LED azul e usa áudio do navegador; as três zonas espaciais não são medidas por esses sensores.

## Executar

Python 3.10 ou superior. Sem dependências externas, login, token ou rede.

Clone o repositório e abra o terminal na pasta `offshore-barrier`:

```bash
python -m offshore_barrier examples/lifting_failure.json --at 2026-10-27T15:00:00Z
python -m offshore_barrier examples/lifting_complete.json --at 2026-10-27T15:00:00Z --output review.json
python -m unittest discover -s tests -v
```

As datas dos exemplos são fixas para reprodução. Sem `--at`, a avaliação usa o horário UTC atual; os exemplos podem estar vencidos. As validades são fictícias, não intervalos recomendados para operação real.

## Resultado

| Resultado | Significado |
| --- | --- |
| BARRIER_FAILURE_RECORDED | Há declaração explícita de falha de barreira |
| INCOMPLETE_EVIDENCE | Falta confirmação, referência, identificação, data válida ou evidência vigente |
| READY_FOR_HUMAN_REVIEW | Todos os registros previstos neste modelo estão completos; exige revisão humana |

`work_authorized` é sempre `false`. Não existe média que compense uma barreira falha. Evidência ausente, inválida, futura ou vencida não conta como registrada. Erros estruturais encerram o comando com código 2 e não geram avaliação. Código 0 significa processamento concluído, nunca autorização de trabalho.

## Modelo de entrada

`operation_id`, `area`, `activity: lifting`, `mode: simulation` e `checks`.

Cada controle recebe `status: confirmed | failed | unknown`. Uma confirmação exige `evidence_ref`, `procedure_ref`, `verified_by`, `observed_at` e `expires_at`, com datas ISO 8601 e fuso. Uma falha não depende de documentação completa para aparecer. Não há opção de marcar controles obrigatórios como não aplicáveis.

Os sete controles são uma seleção inicial de engenharia de software, inspirada em verificação de barreiras: plano, equipamento, capacidade, exclusão, comunicação, ambiente e operações simultâneas. Não constituem checklist completo, reprodução oficial da IOGP ou demonstração de conformidade com NR-37.

## Limites da versão 0.1

Somente simulação e revisão de registros declarados. O navegador roda sem dependências; Node 22 é utilizado pelos testes de comparação entre motores. Para visualizar localmente: `python -m http.server 8000 --directory web`. O programa não verifica documentos, competência do declarante, identidade, sensores, meteorologia, carga, capacidade do guindaste ou presença de pessoas. Não emite PT/APR, não controla máquinas, não prevê acidentes e não substitui sistemas certificados ou decisões de profissionais habilitados. Arquivos JSON podem ser alterados; não são trilha de auditoria autenticada.

O protótipo não usa IA para decidir segurança. A redução de acidentes é uma hipótese a validar; ainda não há evidência de eficácia em campo.

Veja `docs/PROJETO.md` para cobertura dos riscos, arquitetura, etapas e critérios de validação; `docs/FONTES.md` para as referências consultadas.

## Estrutura

- `offshore_barrier/`: motor Python e CLI.
- `web/`: demonstração estática e catálogo PT-BR/EN.
- `hardware/`: projetos alvo e firmware MicroPython de bancada.
- `tests/`: lógica, mensagens e comparação de cenários Python/JavaScript.
- `.github/workflows/pages.yml`: testes e publicação no GitHub Pages.

Licença MIT. Desenvolvido por [brunnodev.store](https://brunnodev.store).

## Testar LineGuard

```bash
python -m unittest discover -s tests -v
node --test tests/lineguard.test.mjs
```

Veja o guia específico de instalação em `hardware/lineguard/README.md`. Não houve gravação do ESP32 do usuário.
