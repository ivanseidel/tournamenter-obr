# React e Vite como runtime estático

O Tournamenter carrega extensões por `require()` e serve pastas retornadas por `getAssets().serve`; por isso a nova UI do Tournamenter OBR será uma aplicação React compilada pelo Vite para assets estáticos. Essa decisão evita acoplar a extensão a um servidor Next.js ou a um builder novo dentro do Tournamenter, mantendo o contrato de instalação atual.
