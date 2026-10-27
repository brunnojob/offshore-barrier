# Validação da versão 0.1

Execução em 27/10/2026.

- 15 testes automatizados aprovados com `python -m unittest discover -s tests -v`.
- Casos incluem cada barreira ausente, falha explícita, vencimento no instante limite, datas futuras, datas sem fuso, referência vazia, estrutura inválida, status desconhecido, equivalência de fusos e preservação da entrada.
- Três execuções integradas da CLI confirmaram os resultados esperados dos exemplos completo, com falha e com vencimento.
- Instante de avaliação inválido foi rejeitado com código 2 e sem relatório.
- Tentativa de sobrescrever o arquivo de entrada foi rejeitada com código 2.
- Todas as saídas verificadas mantiveram `work_authorized: false`.

Essa validação verifica comportamento de software nos cenários definidos. Não comprova adequação operacional, conformidade normativa, autenticidade das evidências ou redução de acidentes.

## Extensão web e hardware

Dois testes adicionais comparam os motores Python/JavaScript em nove variações de entrada; dois verificam a construção das mensagens DeckWatch. A sintaxe Python do firmware e dos módulos JavaScript foi verificada. Os testes não são ensaios físicos de hardware.
