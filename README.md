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
do Tournamenter e configure sete colunas nesta ordem:

1. Vídeo de demonstração técnica (15%)
2. Pôster técnico (15%)
3. Entrevista técnica (30%)
4. Apresentação no palco 1
5. Apresentação no palco 2
6. Ponto extra de prática sustentável (até 10 pontos)
7. Ponto extra de apresentação no Stand (até 5 pontos)

Preencha as notas originais, sem aplicar os pesos. A maior nota entre as duas
apresentações no palco recebe o peso de 40%.

Pontuação total = (Vídeo × 0,15) + (Pôster × 0,15) + (Entrevista × 0,3) +
(Maior apresentação × 0,4) + Sustentabilidade + Stand.

Os extras são somados diretamente, limitados a 0–10 e 0–5 pontos,
respectivamente. Valores vazios contam como zero. Com as quatro avaliações em
100 e os extras máximos, o total é 115 pontos. Esta fórmula retorna somente a
pontuação total, sem critérios adicionais de desempate. A fórmula
`artistica2026` continua disponível para as tabelas da etapa regional.
