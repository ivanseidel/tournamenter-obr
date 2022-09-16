# Guia de Contribuições

Se você abriu este arquivo é porque provavelmente deseja contribuir com o plugin do Tournamenter para a OBR! 

Sua contribuição é muito bem vinda, este guia de contribuições tem como objetivo te orientar durante este processo de contribuição.

Existem duas principais formas de contribuir com o plugin, descritas a seguir.

## 1 - Atualizando o plugin para uma nova etapa da competição

A OBR é uma competição dinâmica, e todos os anos pequenas alterações são realizadas na prova prática, missões são adicionadas, regras modificadas, pontuações atualizadas, etc.

Portanto é necessário atualizar o plugin para cada nova edição da modalidade prática da OBR. O que pode ser feito através dos passos a seguir.

### Passos para atualização
1. [Faça um fork](https://github.com/ivanseidel/tournamenter-obr/fork) do repositório e em seguida clone em seu computador. *dica: Você pode abrir uma issue no repositório avisando ao mantenedor e outros desenvolvedores que pretende atualizar o plugin para uma respectiva versão* 
2. Copie a view da respectiva etapa do ano anterior, por exemplo, se você deseja atualizar o plugin para a etapa estadual em 2023, faça uma cópia do arquivo `public/tournamenter-obr/views/rescue_scorer_2022_regional.html` renomeando-o para `public/tournamenter-obr/views/rescue_scorer_2023_regional.html`
3. Vá em `public/tournamenter-obr/scripts/scorers.js` e copie a `.factory` do ano anterior, por exemplo, `RescueScorer2022Regional`, então renomeei a sua cópia para `RescueScorer2023Regional`
4. Atualize a versão do plugin, que segue o esquema de `[yyyy-[0, 1]-x]` onde `"yyyy"` é o ano da respectiva versão, por exemplo, 2023, `"[0, 1]"` deve ser 0 para estadual ou 1 para nacional, `"x"` atualizado a cada modificação pós lançamento. Atualize a versão dentro `package.json` e do html da view copiada no passo 2
5. Atualize a variável global `GlobalScorerName` dentro do arquivo `public/tournamenter-obr/scripts/controllers.js` com o nome da factory criada no passo 3.
6. Atualize a tabela de pontuação das missões que tiveram suas pontuações atualizadas de acordo com o manual da obr. Esta tabela se encontra dentro da factory criada no passo 3 na variável `scorings`. Para atualizar, por exemplo, a pontuação do obstáculo de 10 para 15 pontos, basta modificar de `obstacles: [0,10]` para `obstacles: [0,15]`
7. Adicione as novas missões se existirem, dentro da view criada e do scorer, seguindo como modelo as outras missões
8. Faça um push dos seus commits para seu fork e [abra um pull request](https://github.com/ivanseidel/tournamenter-obr/compare)

### Considerações

- As cópias são criadas, em vez de simplemente modificar o arquivo, para manter um histórico dentro do plugin
- Cada missão pontuável dentro do scorer possui seus respectivos pontos registrados na variável `scorings`, representadas por um array, na primeira posição deve ser manter a pontuação de não concluído *geralmente 0*, depois a pontuação de concluído de primeira ou única tentativa, e se a missão considerar qual tentativa de solução foi utilizada, as demais pontuações nas próximas posições.
ex: se uma missão pontua 35 pontos se concluída em qualquer tentativa deve ser representada como [0, 35], mas se a missão perde 5 pontos a cada tentativa até a 3, e na 4 não pontua mais, deve registrar [0, 35, 30, 25, 0]

## 2 - Alterações gerais/Melhorias

1. [Faça um fork](https://github.com/ivanseidel/tournamenter-obr/fork) do repositório e em seguida clone em seu computador.
2. Abra uma issue discutindo sua ideia e proposta de melhoria
3. Realize suas melhorias no código do plugin
4. Faça um push dos seus commits para seu fork e [abra um pull request](https://github.com/ivanseidel/tournamenter-obr/compare)

## Testando localmente suas alterações

### Instalando seu plugin através do seu fork

É possível instalar um plugin do tournamenter direto de uma URL do GitHub, então uma vez que você faça pushes de seu código para seu fork, basta desinstalar o plugin da obr, e reinstalar direto da url de seu GitHub para testar suas alterações

### Alterando os arquivos instalados no seu computador

Procure o diretório base onde o Tournamenter está instalado, no meu caso está no caminho: `/Users/user.name/Library/Application Support/Tournamenter/`, é possível observar o caminho base no Tournamenter APP, ao abrir um servidor e observar o endereço do banco de dados, então basta remover o `nomeServer.pb` que você terá a url base.

Em posse da URL base navegue até: `extensions -> node_modules -> tournamenter-obr`, então basta modificar também os arquivos aqui dentro desta pasta, adcionando suas alterações de código



## Recursos

- [Como contribuir com Open Source](https://opensource.guide/how-to-contribute/)
- [Sobre pull requests](https://help.github.com/articles/about-pull-requests/)
- [Ajuda do GitHub](https://help.github.com)
