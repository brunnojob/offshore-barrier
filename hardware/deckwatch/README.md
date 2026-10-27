# DeckWatch — bancada

Primeiro experimento embarcado do Offshore Barrier. Um botão representa uma condição molhada; um LED fornece indicação local; mensagens JSON são emitidas a cada segundo pela serial. Não há sensor de umidade real nesta versão.

## Componentes e ligações

Alvo: ESP32 clássico DevKit com MicroPython compatível. Confira os pinos na documentação da sua placa antes de montar; variantes C3/S3 podem ter pinagem diferente.

| Componente | Ligação |
| --- | --- |
| Botão normalmente aberto | GPIO27 e GND; pull-up interno |
| LED externo | GPIO25 → resistor de 330 ohms → ânodo; cátodo → GND |
| Alimentação | USB da placa, apenas bancada |

Monte com a placa desligada. Use apenas sinais de 3,3 V compatíveis com o ESP32. Não conecte instalações da plataforma, rede elétrica, relés, gás ou líquidos à bancada. O botão permite estudar o fluxo sem criar condição perigosa.

Copie `logic.py` e `main.py` para a placa com o procedimento normal do seu ambiente MicroPython. Ao iniciar, pressionar o botão acende o LED e envia `wet_simulated: true`; soltar apaga. O debounce de 50 ms e heartbeat de 1 s são parâmetros didáticos.

Exemplo de mensagem:

```json
{"schema":"deckwatch-demo/0.1","device_id":"SIM-NODE-001","sequence":1,"uptime_ms":1000,"mode":"bench_simulation","wet_simulated":true,"quality":"synthetic"}
```

`uptime_ms` é um contador local com rollover; não é data UTC. Reiniciar zera a sequência. Um futuro receptor deve acrescentar instante de recebimento e sessão de inicialização, validar esquema e indicar desconexão. Não há receptor serial integrado ao Pages: a página demonstra esse comportamento com dados sintéticos independentes.

## Validação pendente

O firmware foi verificado quanto à sintaxe; a função que constrói mensagens tem testes em CPython. Não houve gravação em placa ou ensaio elétrico. Em bancada, verificar botão pressionado/solto, estabilidade do debounce, sequência, reinício e perda da serial. Depois, avaliar se um sensor adequado consegue representar uma condição útil; umidade não equivale a coeficiente de atrito ou presença de óleo.

É experimento de laboratório, não equipamento Ex ou dispositivo de proteção. Uso real exigiria projeto específico, classificação de área, seleção e avaliação de conformidade aplicáveis, proteção ambiental e validação de falhas.

Referências: [MicroPython ESP32](https://docs.micropython.org/en/latest/esp32/quickref.html), [HSE: atmosferas explosivas](https://www.hse.gov.uk/electricity/explosive.htm).
