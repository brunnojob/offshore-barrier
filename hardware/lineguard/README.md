# LineGuard — ESP32, PIR e DHT11

[Abrir dashboard](https://brunnojob.github.io/offshore-barrier/lineguard/)

Firmware MicroPython executável em um ESP32 clássico e dashboard Web Serial por USB. Sem backend, login, token, buzzer ou biblioteca externa. O som é sintetizado no alto-falante do computador/celular pelo navegador, após clicar em **Habilitar som**. A conexão USB deve ser usada no Chrome/Edge desktop com Web Serial disponível.

## O que o conjunto realmente informa

PIR informa mudanças de radiação infravermelha compatíveis com movimento no seu campo. Não mede distância, não confirma presença de carga e pode não detectar mão parada, coberta, movimento pequeno ou fora do campo. Um fio solto pode se parecer com sinal baixo; o firmware não diagnostica essa falha. DHT11 informa temperatura e umidade do ar; não determina risco de prensamento.

As três zonas espaciais não podem ser obtidas de um único PIR e DHT11. O dashboard separa testes fictícios de leituras reais. Para pesquisar zonas por distância, evoluir com sensores ToF/UWB ou sistemas de visão, com análise de oclusões e validação. Para proteção efetiva de mãos, projetar também meios físicos, dispositivos de proteção adequados e procedimentos com especialistas; este conjunto não deve ser usado como proteção de máquina ou para liberar movimentação de cargas.

## Estados e LED azul

| Estado | Fonte e significado | LED |
| --- | --- | --- |
| Segura — somente teste | Comando fictício; nunca inferido pelo PIR | Apagado |
| Alerta — teste | Comando fictício de atenção | Aceso fixo |
| Aquecimento | Inicialização do PIR, 120 s configuráveis conforme modelo | Aceso fixo |
| Não verificada | PIR sem movimento atual; não é área segura | Aceso fixo |
| Risco retido | Movimento observado após aquecimento, retido até rearme | Piscando a 4 Hz enquanto o estado persistir |
| Sem telemetria | Dashboard sem quadro válido por 3 s ou com mensagem inválida | Estado físico desconhecido; não controla o LED remoto |

Interpretação do pedido: segura = apagado; alerta = fixo; risco = piscando. A taxa de 4 Hz é didática e configurada em `controller.py`; não é um critério industrial. O firmware mantém o padrão sem depender do navegador. O painel pode reduzir a animação conforme a preferência de acessibilidade; o texto mantém a indicação de piscar.

Movimento retido não some quando o PIR baixa. O botão de rearme e o comando serial só limpam a retenção com PIR sem movimento; o estado resultante continua não verificado. Teste de LED tem duração máxima de 5 s e não pode ocultar risco real já retido. Ao reiniciar/perder energia, a retenção em RAM é perdida e o dispositivo passa novamente pelo aquecimento; não há memória de segurança persistente.

## Ligações de referência

Alvo de software: ESP32 clássico DevKit/WROOM com MicroPython. O modelo exato da placa e do PIR do usuário ainda não foi confirmado. Confira a documentação do seu hardware antes de ligar.

| Componente | Ligação |
| --- | --- |
| PIR OUT | GPIO27, sinal lógico compatível com 3,3 V |
| PIR GND | GND comum |
| PIR VCC | Conforme o módulo exato; não presumir que todos aceitam a mesma alimentação |
| DHT11 DATA | GPIO26 |
| DHT11 VCC/GND | Alimentação de 3,3 V somente se suportada pelo módulo, e GND comum |
| Pull-up DHT11 | Se sensor avulso/sem resistor no módulo: 4,7–10 kΩ de DATA para 3,3 V |
| LED azul integrado | GPIO2 por padrão; verificar se existe, pino e polaridade na sua placa |
| LED externo opcional | GPIO2 → resistor 330 Ω → ânodo; cátodo para GND; ajustar pino se necessário |
| Botão de rearme opcional | GPIO25 e GND, normalmente aberto, pull-up interno |
| Alimentação da placa | USB do computador, somente bancada |

GPIO do ESP32 não tolera 5 V. Não conecte a saída de sensor ou pull-up em 5 V diretamente a GPIO. Módulos PIR como HC-SR501 e AM312 têm requisitos diferentes; verifique seu modelo. Não ligue por tentativa. Monte sem alimentação e não conecte rede elétrica, guindaste, relés, equipamento industrial ou carga suspensa. A placa de desenvolvimento não é equipamento Ex para área classificada.

## Instalação e uso

1. Instale uma versão MicroPython compatível com seu modelo de ESP32 pelo procedimento oficial. Isso pode apagar arquivos da placa: guarde seu projeto atual antes. Este trabalho não gravou nem apagou a placa do usuário.
2. Abra a placa no Thonny e copie os três arquivos Python desta pasta: `config.py`, `controller.py` e `main.py`.
3. Confira os pinos em `config.py`, inclusive `LED_ACTIVE_HIGH`; altere para `False` se o LED for ativo em nível baixo.
4. Reinicie o ESP32. Feche a conexão do Thonny/monitor serial para liberar a porta USB.
5. Abra o dashboard, clique em **Conectar ESP32 por USB** e selecione a porta da placa. O navegador solicita a escolha local; a página não recebe suas credenciais nem envia dados a servidor.
6. Aguarde o aquecimento configurado. Observe as leituras DHT11 e mova um alvo de bancada, sem carga real. O risco deve ficar retido e o LED deve piscar.
7. Retire o movimento e use **Rearmar evento na placa** ou o botão físico. O resultado deve ser **não verificada**, com LED fixo.
8. Clique em **Habilitar som** e **Testar som**. Confirme manualmente volume e saída. O ESP32 sozinho, sem buzzer/alto-falante, não emite som.

O DHT11 é lido a cada 2,5 s; erro de leitura gera `null`/`dht_ok:false`, sem apagar o risco PIR. O polling do loop não é uma garantia de tempo real; leitura DHT, serial e execução Python podem atrasar eventos. O PIR também tem tempo de resposta e retenção próprios, conforme o módulo.

## Testes das três zonas

Sem placa: os três botões alteram apenas os dados fictícios da página. Com placa: selecione uma zona e clique em **Aplicar teste ao LED da placa por 5 s**. Aguarde o retorno `mode:led_test`. O painel identifica esse modo explicitamente, sem fingir que uma distância foi medida. Em qualquer instante, **Voltar à leitura real** envia `cmd:live`. Movimento real continua sendo processado durante o teste e prevalece sobre a simulação.

## Protocolo USB

JSON delimitado por nova linha, 115200 baud. Mensagem a cada 500 ms, contendo esquema, identificação da placa, sessão aleatória de boot, sequência, uptime, modo, estado, retenção, sinal PIR e dados ambientais. A página rejeita protocolo desconhecido, duplicidade, mensagem fora de ordem e retorno de sessão antiga; após 3 s sem mensagem válida mostra desconhecido. Não é autenticação criptográfica nem diagnóstico do PIR.

Comandos aceitos:

```json
{"cmd":"reset"}
{"cmd":"live"}
{"cmd":"demo","zone":"safe"}
{"cmd":"demo","zone":"alert"}
{"cmd":"demo","zone":"risk"}
```

Os dados e os últimos 100 eventos ficam em memória no navegador. A exportação inclui até 600 amostras da sessão. Recarregar reinicia a página. Não existe gravação em nuvem.

## Validação e limites

Testes automatizados cobrem máquina de estados, retenção/rearme, padrão do LED e validação/perda de telemetria no navegador. Sintaxe do firmware é verificada em CPython; isso não substitui execução MicroPython em hardware. Não houve ensaio físico, gravação da placa ou medição de latência. Validar em bancada: pinos/polaridade, estabilização PIR, sinal alto persistente, pulso, reset bloqueado com movimento, reset com sinal baixo, falha DHT, perda USB, reinício e teste de LED com risco ativo.

Não expor mãos a mecanismos de prensamento para testar. Usar alvos e cargas de maquete sem energia perigosa. O sistema não é certificado, não mede segurança de zona e não autoriza operações. O som do navegador depende de usuário habilitar áudio, volume, hardware e execução da aba; fechamento, suspensão, mudo ou falha podem interrompê-lo.

## Referências

- [MicroPython: ESP32 e DHT](https://docs.micropython.org/en/latest/esp32/quickref.html)
- [MicroPython: intervalo DHT](https://docs.micropython.org/en/latest/esp8266/tutorial/dht.html)
- [Panasonic: limitações de PIR](https://industry.panasonic.eu/products/components/sensors/passive-infrared-motion-sensors-papirs/passive-infrared-motion-sensors-faq)
- [MDN: Web Serial](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)
- [Chrome: política de áudio](https://developer.chrome.com/blog/autoplay/)
