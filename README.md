# tournamenter-obr
Extensão para o Tournamenter que permite pontuar pelo tablet em competições da OBR

## Instalação desta Extensão
* Baixe o [Tournamenter App](https://github.com/ivanseidel/TournamenterApp) e instale
* Instale este módulo no gerenciador de extensões do Tournamenter, incluindo a seguinte URL: `https://github.com/ivanseidel/tournamenter-obr`
* Para cada instância de servidor que desejar utilizar, habilite o módulo

## Nacional 2026.2

A versão do pacote é `2026.2.7`. O pontuador de resgate nacional 2026 usa como
base as regras e a interface da nacional 2025.2, incluindo o tempo de 480 segundos.

### Classificação de Resgate (N1 e N2)

Crie **uma tabela por nível**. As novas tabelas já vêm com a fórmula
`resgate2026nacional` e as **10 colunas** abaixo. A fórmula também aceita o nome
`resgate2026obr`. Tabelas com o cabeçalho padrão anterior continuam usando a
ordem original para calcular e lançar as notas. Para outras modalidades, escolha
a fórmula e as colunas correspondentes na configuração da tabela.

```
Pôster, Relatório, Pontos R1, Tempo R1, Pontos R2, Tempo R2, Pontos R3, Tempo R3, Desafio Técnico, Pontos da Final
```

Com essa ordem, mantenha as 10 colunas na administração e ajuste
**Score Columns (View)** para **6** para exibir a parcial até R2. O placar
público usa apenas Pôster, Relatório e os pontos e tempos de R1 e R2, inclusive
nos desempates. A classificação administrativa continua usando as 10 colunas.

O pontuador preenche os pontos e tempos das preliminares. Lance manualmente
as notas brutas do Desafio Técnico, do Pôster (0 a 36) e do Relatório (0 a 96).
Use zero quando for a nota atribuída e deixe em branco enquanto estiver
pendente. Preencha as nove primeiras colunas de todas as equipes antes de
usar a classificação para definir a final.

A nota de arena é a soma das duas melhores preliminares e do Desafio Técnico.
A nota de classificação soma 80% da nota de arena da equipe, 10% da nota
proporcional de Pôster e 10% da nota proporcional de Relatório. Cada uma dessas
duas avaliações é convertida da sua escala bruta para a maior nota de arena
da própria tabela. Consulte as [páginas 61 e 67 do manual](https://obr.robocup.org.br/wp-content/uploads/2026/10/OBR2026_NACIONAL_MANUAL-DE-REGRAS-E-INSTRUCOES_RESGATE.pdf#page=61)
para a fórmula e a ordem dos desempates. O algoritmo anterior `obr2025`
continua disponível e não foi alterado.

O pontuador oferece a opção **Final** apenas para as equipes classificadas
entre as 10 melhores do nível, depois de completas as preliminares. Na
final, salva só os pontos na décima coluna; eles são somados à nota de
classificação, sem recalcular o descarte nem a normalização. Em caso de empate
persistente no corte, o sistema não escolhe arbitrariamente quem fica com
a vaga: a organização deve resolver a classificação dessas equipes antes
de fechar o resultado. Empates após a soma da final também são mantidos
para decisão da organização, pois o manual não explicita um critério
específico para eles. Confira as notas preliminares antes de lançar a final:
alterações nas preliminares recalculam a classificação.

### Classificação de Robótica Artística

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

### Pontuador Artística

Abra **Plugin OBR → Pontuador Artística**, escolha a coluna e selecione a
tabela e a equipe. As seis fichas reproduzem os critérios de Vídeo, Pôster,
Entrevista, Apresentação 1, Apresentação 2 e Stand. Registre a nota inteira
de consenso dos juízes em cada campo. A célula guarda o total em `value` e
os valores de cada critério, suas justificativas e a justificativa geral em
`data`. As justificativas são opcionais.

Para enviar a avaliação à equipe, acesse o pontuador como coordenação e
selecione a coluna, a tabela e a equipe. **Baixar PDF da ficha** exporta a
coluna escolhida. **Baixar PDF da equipe** reúne as fichas já registradas
nessa tabela. O relatório inclui cada critério com sua nota e justificativa,
além da justificativa geral. Os PDFs usam a última avaliação salva e também
estão disponíveis em tabelas bloqueadas. Para notas lançadas diretamente
na tabela, o relatório identifica o total e a ausência de detalhamento.

Na entrevista, a ficha grava a nota técnica e o bônus de sustentabilidade de
até 10 pontos em suas respectivas colunas. Nas apresentações, registre as
quantidades de intervenções, reinícios e blocos de 10 segundos excedentes
atribuíveis à equipe. Cada ocorrência desconta três pontos. Deduções acima
do subtotal podem resultar em nota negativa. Marque a opção de duração
inferior a 1 min 30 s para registrar nota zero. O stand vale
cinco pontos pela participação e apresentação.

A coluna Dedução acumula os pontos descontados na entrevista e nas duas
apresentações para o desempate. A coordenação pode manter um total manual
nessa coluna. Se uma nota antiga foi lançada diretamente na tabela e sua
dedução é desconhecida, confira o total de desempate ao corrigir a ficha.

## Acesso ao pontuador para voluntários

1. Configure a senha administrativa do Tournamenter (`PASSWORD`) e mantenha-a
   apenas com a coordenação. O acesso separado fica desativado sem essa senha.
2. Na sessão da coordenação, abra **Plugin OBR → Configurar → Acesso ao
   pontuador**. Defina uma senha diferente, de pelo menos 12 caracteres.
3. Compartilhe o endereço da instância seguido de `/tournamenter-obr/acesso`
   e a senha do pontuador com os voluntários. Nos tablets, use um navegador
   sem sessão administrativa. Use HTTPS em redes compartilhadas ou não confiáveis.

Com o acesso de voluntários ativo, o endereço antigo `/tournamenter-obr/`
pede a senha de voluntários se o navegador ainda não tiver uma sessão.
Quem já entrou como voluntário segue para o pontuador restrito. Quem já
entrou como coordenação continua abrindo o pontuador administrativo.

A sessão de voluntários dura até 12 horas e atende às duas modalidades.
Na tela de acesso, selecione **Resgate** ou **Artística**. O endereço
`/tournamenter-obr/acesso?modalidade=artistica` já seleciona Artística.
Voluntários podem consultar as equipes das tabelas desbloqueadas e registrar
a primeira súmula por rodada de Resgate ou por coluna da Artística. A final
de Resgate continua restrita a finalistas. Voluntários não podem carregar súmulas anteriores, corrigir notas,
acessar a administração nem alterar tabelas. A coordenação continua usando
o acesso administrativo para correções. Se uma correção na tabela for
recusada porque outra pessoa salvou a mesma linha, recarregue a tabela antes
de repetir a edição. A senha é enviada no corpo da
requisição, armazenada apenas como hash com sal, e pode ser trocada ou
revogada pela coordenação; ambas as ações encerram as sessões de voluntários.

Cada instância guarda o arquivo privado de credencial em seu diretório de
dados do Tournamenter, identificado pelo nome do banco. Use um diretório
persistente fora das pastas públicas, mantenha uma instância por processo, e
proteja rotas administrativas com a configuração normal do Tournamenter.
Reiniciar o processo preserva a senha e encerra sessões em andamento.

Se uma instância configurada em uma versão preliminar que usava scrypt for
movida para o Tournamenter Desktop, defina novamente a senha de voluntários
na configuração do plugin.
