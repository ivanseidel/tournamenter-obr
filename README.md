# tournamenter-obr
Extensão para o Tournamenter que permite pontuar pelo tablet em competições da OBR

## Instalação desta Extensão
* Baixe o [Tournamenter App](https://github.com/ivanseidel/TournamenterApp) e instale
* Instale este módulo no gerenciador de extensões do Tournamenter, incluindo a seguinte URL: `https://github.com/ivanseidel/tournamenter-obr`
* Para cada instância de servidor que desejar utilizar, habilite o módulo

## Nacional 2026.2

A versão do pacote é `2026.2.1`. O pontuador de resgate nacional 2026 usa como
base as regras e a interface da nacional 2025.2, incluindo o tempo de 480 segundos.

Para a artística nacional, selecione a fórmula `artistica2026nacional` na tabela
do Tournamenter e configure oito colunas nesta ordem:

1. Vídeo (15%)
2. Pôster (15%)
3. Stand (até 5 pontos)
4. Sustentabilidade (até 10 pontos)
5. Entrevista (30%)
6. Palco 1
7. Palco 2
8. Dedução (somente desempate)

Tabelas existentes com sete colunas precisam ter os dados remapeados para esta
ordem, além da inclusão de Dedução. Apenas adicionar a oitava coluna não basta.

Preencha as notas originais, sem aplicar os pesos. A maior nota entre as duas
apresentações no palco recebe o peso de 40%.

Pontuação total = (Vídeo × 0,15) + (Pôster × 0,15) + (Entrevista × 0,3) +
(Maior apresentação × 0,4) + Sustentabilidade + Stand.

Os extras são somados diretamente, limitados a 0–10 e 0–5 pontos,
respectivamente. Valores vazios contam como zero. Com as quatro avaliações em
100 e os extras máximos, o total é 115 pontos. A Dedução não é subtraída nem altera a pontuação total.

Configure a classificação em ordem decrescente. Em caso de empate na pontuação
final, vence a maior soma de Palco 1 + Palco 2; persistindo o empate, vence a menor
Dedução. A fórmula retorna `[total, soma dos palcos, -dedução]`, mantendo apenas o
total como nota exibida. Se todos os critérios empatarem, as equipes continuam
empatadas na tabela; uma rodada extra, prevista no
[manual nacional 2026 (p. 48)](https://obr.robocup.org.br/wp-content/uploads/2026/10/OBR2026_-Manual-de-Regras-e-Instrucoes-_Etapa-Nacional_-Robotica-Artistica.pptx-1.pdf#page=48),
deve ser organizada separadamente. A fórmula
`artistica2026` continua disponível para as tabelas da etapa regional.
