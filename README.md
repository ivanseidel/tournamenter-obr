# tournamenter-obr
Extensão para o Tournamenter que permite pontuar pelo tablet em competições da OBR

## Instalação desta Extensão
* Baixe o [Tournamenter App](https://github.com/ivanseidel/TournamenterApp) e instale
* Instale este módulo no gerenciador de extensões do Tournamenter, incluindo a seguinte URL: `https://github.com/ivanseidel/tournamenter-obr`
* Para cada instância de servidor que desejar utilizar, habilite o módulo

## Nacional 2026.2

A versão do pacote é `2026.2.4`. O pontuador de resgate nacional 2026 usa como
base as regras e a interface da nacional 2025.2, incluindo o tempo de 480 segundos.

### Classificação de Resgate (N1 e N2)

Crie **uma tabela por nível**. As novas tabelas já vêm com a fórmula
`resgate2026nacional` e as **10 colunas** abaixo. As tabelas existentes não
são alteradas. Para outras modalidades, escolha a fórmula e as colunas
correspondentes na configuração da tabela.

```
Pontos R1, Tempo R1, Pontos R2, Tempo R2, Pontos R3, Tempo R3, Desafio Técnico, Pôster, Relatório, Pontos da Final
```

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

## Acesso ao pontuador para voluntários

1. Configure a senha administrativa do Tournamenter (`PASSWORD`) e mantenha-a
   apenas com a coordenação. O acesso separado fica desativado sem essa senha.
2. Na sessão da coordenação, abra **Plugin OBR → Configurar → Acesso ao
   pontuador**. Defina uma senha diferente, de pelo menos 12 caracteres.
3. Compartilhe o endereço da instância seguido de `/tournamenter-obr/acesso`
   e a senha do pontuador com os voluntários. Nos tablets, use um navegador
   sem sessão administrativa. Use HTTPS em redes compartilhadas ou não confiáveis.

A sessão de voluntários dura até 12 horas e permite apenas consultar nomes
de equipes e rodadas disponíveis de tabelas de Resgate desbloqueadas, além de
registrar a primeira súmula de cada rodada. A final continua restrita a
finalistas. Voluntários não podem carregar súmulas anteriores, corrigir notas,
acessar a administração nem alterar tabelas. A coordenação continua usando
o acesso administrativo para correções. A senha é enviada no corpo da
requisição, armazenada apenas como hash com sal, e pode ser trocada ou
revogada pela coordenação; ambas as ações encerram as sessões de voluntários.

Cada instância guarda o arquivo privado de credencial em seu diretório de
dados do Tournamenter, identificado pelo nome do banco. Use um diretório
persistente fora das pastas públicas, mantenha uma instância por processo, e
proteja rotas administrativas com a configuração normal do Tournamenter.
Reiniciar o processo preserva a senha e encerra sessões em andamento.
