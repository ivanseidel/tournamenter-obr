# Adapter CommonJS na borda do plugin

O entrypoint da extensão continuará CommonJS porque o Tournamenter carrega módulos por `require()`. A lógica nova pode ser organizada em TypeScript e compilada, mas a borda pública precisa continuar compatível com o host legado para reduzir risco de instalação.
