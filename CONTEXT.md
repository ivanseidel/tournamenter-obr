# Tournamenter OBR

Este contexto descreve a linguagem de domínio da extensão Tournamenter OBR, que adiciona fluxos operacionais da Olimpíada Brasileira de Robótica ao Tournamenter.

## Linguagem

**Tournamenter**:
Sistema de gerenciamento de torneios que é dono das competições, equipes, tabelas, rodadas e pontuações salvas.
_Evite_: sistema base, app principal

**Tournamenter OBR**:
Extensão do Tournamenter para a OBR. Ela adiciona fluxos específicos da OBR e continua usando o Tournamenter como sistema de registro.
_Evite_: App OBR, camada OBR

**Pontuador**:
Fluxo usado por juízes para registrar a pontuação e o tempo de uma equipe em uma rodada.
_Evite_: Scorer UI, tela de nota

**Desafio Surpresa**:
Fluxo usado para sortear e registrar desafios atribuídos a equipes durante a competição.
_Evite_: desafio aleatório, desafio manual

**Gerador de Horários**:
Fluxo usado pela organização para distribuir equipes, arenas, níveis e rodadas em uma tabela de horários.
_Evite_: agenda, grade genérica

**Sistema Olimpo**:
Sistema externo usado como fonte ou destino de dados oficiais da OBR, como equipes e resultados sincronizados.
_Evite_: API externa, sistema nacional

**Modernização transparente**:
Refatoração técnica que troca stack, organização e testes sem alterar URLs, fluxos, textos, formato de dados salvos ou aparência geral percebida por quem usa o Tournamenter OBR.
_Evite_: redesign, nova experiência

## Exemplo de Diálogo

"O juiz usa o Pontuador para registrar a nota de uma equipe. O Tournamenter OBR fornece esse fluxo, mas a competição e as pontuações salvas pertencem ao Tournamenter. A modernização transparente pode trocar AngularJS por React, desde que o juiz continue vendo o mesmo fluxo e o Tournamenter continue recebendo o mesmo formato de pontuação."
