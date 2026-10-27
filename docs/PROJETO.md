# Projeto e plano de desenvolvimento

## Objetivo verificável

Melhorar a identificação e o tratamento de barreiras degradadas antes de uma atividade offshore. Público inicial: equipe de segurança, supervisão e planejamento de içamento. A primeira entrega executável revisa registros de sete controles e explica cada pendência. Há uma demonstração web estática PT-BR/EN, telemetria sintética e firmware inicial DeckWatch. Não há integração com sensores reais ou implantação operacional.

Escolha de içamento como piloto: atividade com controles observáveis que permitem testar o fluxo sem inventar limites de gases, vento, estabilidade ou cálculo estrutural. Essa escolha é de escopo, não um ranking de frequência de acidentes.

## Cobertura dos riscos apresentados

| Risco | Recurso proposto | Situação |
| --- | --- | --- |
| Quedas, tropeços e escorregões | Registro por área de piso, acesso, proteções e pendências, com prazo e responsável | Planejado |
| Içamento | Revisão de registros de plano, equipamento, capacidade, zona, comunicação, ambiente e SIMOPS | Motor simulado implementado |
| Prensamento no drill floor | Verificação de isolamento e exposição à linha de fogo antes do manuseio | Planejado |
| H2S | Exibição de estado e saúde de detectores certificados, incluindo perda de sinal | Planejado; sem limiares universais |
| Queimaduras e contato químico | Evidência de isolamento, identificação de linhas e documentação de substâncias | Planejado |
| Incêndio e perda de controle do poço | Visibilidade de barreiras e pendências provenientes de sistemas especializados | Planejado; sem controle de poço |
| Colisões marítimas | Registro de coordenação da aproximação e restrições da operação | Planejado; sem navegação autônoma |
| Estabilidade | Apresentação de alertas de sistemas validados da unidade | Planejado; sem cálculo ou comando de lastro |
| Transporte aéreo | Pendências de preparação e comunicação com o operador aéreo | Planejado; sem despacho ou liberação de voo |

Complementar depois com riscos elétricos, objetos caídos, espaços confinados e homem ao mar. O catálogo inicial não esgota os perigos offshore.

## Fluxo do piloto

1. Registrar atividade, local, procedimento e verificações.
2. Avaliar consistência e vigência de cada registro.
3. Mostrar todas as lacunas, preservando a identificação da barreira.
4. Submeter registros e pendências à revisão da equipe responsável.
5. Alterações nas condições exigem nova verificação conforme procedimento local.

Não há estado de operação autorizada. O software não emite comando físico de parada; a expressão de falha é informativa no protótipo.

## Arquitetura

Agora: arquivo JSON → motor Python determinístico → relatório JSON com versão das regras e instante de avaliação. O Pages executa um motor JavaScript local; não hospeda um servidor Python. Há testes de comparação entre motores nos cenários definidos.

Evolução proposta: interface responsiva PT-BR/EN → API Python → banco com revisões, responsáveis e eventos → adaptadores somente de leitura para dados operacionais. Separar dados simulados dos reais em armazenamento e apresentação. Não conectar o protótipo a PLC, SIS, ESD, guindaste, navegação ou lastro.

Um demonstrador pode funcionar sem login. Uso em equipe com responsabilização exige identidade verificável, controle de acesso, integridade dos registros e governança de alterações. Não alegar auditoria confiável usando apenas dados locais anônimos.

## Entregas seguintes

| Etapa | Entrega | Critério de conclusão |
| --- | --- | --- |
| 0 — atual | Motor Python, exemplos e testes | Falhas, ausência e vencimento nunca produzem registro completo |
| 1 | Revisão do modelo com profissional de segurança e especialista em içamento | Controles, evidências e vigências vinculados ao procedimento da unidade |
| 2 — parcial | Interface de demonstração e catálogo de hardware implementados | Próximo: fluxo de responsável, evidência e pendências persistentes |
| 3 | Histórico persistente e revisão de pendências | Reabertura, alteração e revisão preservadas sem apagar a falha original |
| 4 | Piloto observacional, sem decisões operacionais | Comparação com revisão independente e análise de omissões e alertas indevidos |
| 5 | Integrações somente de leitura | Falta de sinal, dados antigos e unidade de medida inválida aparecem como desconhecidos |

## Como medir utilidade

Medir barreiras faltantes detectadas em cenários conhecidos, falhas não detectadas, alertas indevidos, tempo até revisão e pendências vencidas. Comparar com avaliação independente de especialistas. Não usar quantidade de cliques ou checklists preenchidos como evidência de redução de acidentes.

Para estudar eficácia: definir população, atividade, período, exposição (por exemplo, número de içamentos) e critério de quase acidente; preservar o incentivo ao relato. Um aumento de relatos pode refletir melhoria da notificação. Não prometer percentual de redução antes de estudo adequado.

## Antes de uso real

Revisar requisitos com a unidade e profissionais habilitados, validar a lógica e o tratamento de falhas, definir governança de regras e dados, testar uso e contingência e verificar obrigações aplicáveis. Este pacote não realiza essas etapas nem é certificado.
