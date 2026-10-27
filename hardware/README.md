# Projetos alvo

Catálogo de propostas do Offshore Barrier. Apenas DeckWatch possui firmware inicial; os demais são conceitos. Todos dependem de validação. Nenhum equipamento foi ensaiado fisicamente.

## 01 — DeckWatch

**Risco:** Escorregões e tropeços

**Situação:** Firmware de bancada

Sinalizar uma condição de superfície reportada por um nó e tornar a perda de comunicação visível.

- Componentes: ESP32, botão de simulação, LED e USB. Sensor de umidade apenas em etapa posterior.
- Fluxo: Botão → estado local → LED → JSON serial → revisão. A página usa uma simulação independente.
- Validação: Simular condição, desconexão e reinício; depois estudar corrosão, respingos e falsos alertas.
- Limite: Não mede atrito, óleo, aderência ou segurança do piso.

## 02 — LiftZone

**Risco:** Içamento e linha de fogo

**Situação:** Conceito

Pesquisar alertas suplementares de proximidade na zona de exclusão de uma carga.

- Componentes: Tags UWB, âncoras e microcontrolador; buzzer/vibração em maquete.
- Fluxo: Posição estimada → zona configurada → alerta de proximidade e qualidade do sinal.
- Validação: Medir erro em oclusões, múltiplas tags, interferência e estruturas metálicas.
- Limite: Não substitui isolamento físico, sinaleiro, plano ou inspeção de acessórios.

## 03 — LineGuard

**Risco:** Prensamento de mãos e membros

**Situação:** Conceito

Estudar a identificação de presença em uma zona de manuseio de tubos numa bancada sem energia perigosa.

- Componentes: Microcontrolador, sensor ToF e peças leves de maquete.
- Fluxo: Presença simulada → indicação local → registro de evento para análise.
- Validação: Ensaiar pontos cegos, múltiplos objetos e falha do sensor; não movimentar máquinas reais.
- Limite: Não é cortina de luz certificada ou intertravamento de máquina.

## 04 — GasLink

**Risco:** Exposição a H2S

**Situação:** Conceito de integração

Apresentar estado, comunicação e manutenção de detectores certificados via interface aprovada.

- Componentes: Emulador de detector em bancada; gateway e interface industrial definidos com o fabricante.
- Fluxo: Mensagem de teste → saúde do dispositivo → indicação de dado vencido e alerta espelhado.
- Validação: Testar perda de mensagens, atraso, unidade incorreta e estados de manutenção usando dados sintéticos.
- Limite: Sem MQ genérico como proteção de vida, sem geração de gás e sem substituir alarmes locais certificados.

## 05 — ThermoTag

**Risco:** Queimaduras térmicas e químicas

**Situação:** Conceito

Associar identificação de linha e observação de temperatura à revisão de uma intervenção.

- Componentes: Microcontrolador, etiqueta QR/NFC e simulador de temperatura. Sensor industrial em etapa validada.
- Fluxo: Identificação → observação → vínculo com procedimento e pendência.
- Validação: Verificar identificação trocada, sensor solto, atraso e limites de medição.
- Limite: Temperatura não identifica corrosividade; não confirma isolamento ou ausência de pressão.

## 06 — BarrierPulse

**Risco:** Incêndio, explosão e perda de contenção

**Situação:** Conceito de integração

Tornar visíveis estados de barreiras e pendências recebidos de sistemas especializados.

- Componentes: Gerador de mensagens sintéticas; gateway somente de leitura após revisão da arquitetura.
- Fluxo: Fonte autorizada → validação de origem e tempo → painel de barreiras.
- Validação: Ensaiar mensagem antiga, fora de ordem, origem incorreta e desconexão.
- Limite: Sem comando para BOP, SIS, ESD ou controle de poço; sem previsão de blowout.

## 07 — ApproachWatch

**Risco:** Colisões marítimas

**Situação:** Conceito

Pesquisar visualização complementar de aproximação e qualidade dos dados de uma embarcação.

- Componentes: Microcontrolador e trajetórias GNSS/AIS sintéticas; futura recepção autorizada.
- Fluxo: Trajetória simulada → distância ilustrativa → indicador de qualidade e revisão.
- Validação: Simular perda de posição, deriva, atraso e embarcação sem mensagem.
- Limite: Não é radar, sistema anticolisão, posicionamento dinâmico ou instrumento de navegação.

## 08 — MotionLog

**Risco:** Movimento e estabilidade da unidade

**Situação:** Conceito

Registrar movimentos de uma maquete para estudar qualidade e apresentação de telemetria.

- Componentes: Microcontrolador, IMU de bancada e suporte móvel de maquete.
- Fluxo: Aceleração/rotação → registro → visualização de tendência e dado ausente.
- Validação: Ensaiar deriva, orientação incorreta, vibração e reinício.
- Limite: Uma IMU não determina estabilidade naval; não calcula GM, carga ou lastro e não comanda bombas.

## 09 — HeliReady

**Risco:** Preparação do transporte aéreo

**Situação:** Conceito

Organizar pendências de preparação, conferência e comunicação da equipe antes do embarque.

- Componentes: Leitor NFC de bancada ou QR e terminal de conferência; dados fictícios de passageiros.
- Fluxo: Identificação fictícia → checklist → pendências encaminhadas à equipe responsável.
- Validação: Testar duplicidade, lista desatualizada e perda de comunicação.
- Limite: Não avalia aeronave, meteorologia, peso e balanceamento ou liberação de voo.

## Prioridade sugerida

Começar pelo DeckWatch em bancada, depois testar LiftZone em maquete e estruturar GasLink apenas com emulador de detector. A prioridade reflete facilidade de ensaio e separação de riscos, não frequência estatística.

## Condições para evoluir

Não levar placas de desenvolvimento para área classificada. O projeto do produto exige avaliação de aplicabilidade regulatória local, certificação/adequação Ex quando pertinente, ambiente marinho, alimentação, compatibilidade eletromagnética, proteção de dados e ciclo de vida. Comunicações sem fio sofrem com metal, oclusão e interferência. Não usar sensores de hobby para funções de proteção de vida.

Referências: [HSE — equipamentos em atmosferas explosivas](https://www.hse.gov.uk/electricity/explosive.htm), [MicroPython — ESP32](https://docs.micropython.org/en/latest/esp32/quickref.html).
