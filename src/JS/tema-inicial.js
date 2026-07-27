// ============================================================================
// TEMA-INICIAL.JS — aplica o tema salvo (claro/escuro) antes da primeira
// pintura da página, para não piscar o tema errado ao navegar.
//
// Precisa ser um arquivo externo (não inline no <head>) para funcionar com a
// Content-Security-Policy do projeto: script-src não libera scripts inline,
// só arquivos de origem própria ('self') ou dos CDNs autorizados.
// ============================================================================

(function () {
    var temaSalvo = localStorage.getItem('temaSalaoAmbar');

    if (temaSalvo) {
        document.documentElement.dataset.tema = temaSalvo;
    }
})();
