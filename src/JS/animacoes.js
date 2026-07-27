// ============================================================================
// ANIMACOES.JS — animações de entrada com GSAP, contador numérico animado e
// scroll suave com Lenis. Compartilhado por todas as páginas.
//
// Todas as funções aqui respeitam prefers-reduced-motion: quem prefere menos
// movimento simplesmente não vê a animação, o conteúdo já aparece no lugar.
// ============================================================================

const PREFERE_MENOS_MOVIMENTO = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Anima a entrada dos links da sidebar quando a página carrega. */
function animarEntradaSidebar() {
    if (PREFERE_MENOS_MOVIMENTO) {
        return;
    }

    gsap.from('.sidebar__link', {
        autoAlpha: 0,
        x: -12,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.out'
    });
}

/** Anima a entrada de um único elemento recém-revelado (ex.: depois de tirar a classe d-none). */
function animarRevelacaoConteudo(elemento) {
    if (PREFERE_MENOS_MOVIMENTO || !elemento) {
        return;
    }

    gsap.from(elemento, {
        autoAlpha: 0,
        y: 16,
        duration: 0.5,
        ease: 'power2.out'
    });
}

/** Anima a entrada de uma lista de elementos (ex.: linhas de tabela, cards) com efeito cascata. */
function animarRevelacaoLista(elementos) {
    if (PREFERE_MENOS_MOVIMENTO || !elementos || elementos.length === 0) {
        return;
    }

    gsap.from(elementos, {
        autoAlpha: 0,
        y: 12,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.out'
    });
}

/**
 * Anima um número subindo de 0 até o valor final (efeito "contador").
 * @param {HTMLElement} elemento - onde o número/texto final será escrito
 * @param {number} valorFinal
 * @param {Function} [formatador] - função opcional para formatar cada passo (ex.: moeda)
 */
function animarContador(elemento, valorFinal, formatador) {
    if (!elemento) {
        return;
    }

    if (PREFERE_MENOS_MOVIMENTO) {
        if (formatador) {
            elemento.textContent = formatador(valorFinal);
        } else {
            elemento.textContent = valorFinal;
        }
        return;
    }

    const objetoAnimado = { valor: 0 };

    gsap.to(objetoAnimado, {
        valor: valorFinal,
        duration: 1,
        ease: 'power1.out',
        onUpdate: function () {
            const valorArredondado = Math.round(objetoAnimado.valor * 100) / 100;

            if (formatador) {
                elemento.textContent = formatador(valorArredondado);
            } else {
                elemento.textContent = Math.round(valorArredondado);
            }
        }
    });
}

/** Liga o scroll suave (Lenis) na página inteira, exceto para quem prefere menos movimento. */
function inicializarScrollSuave() {
    if (PREFERE_MENOS_MOVIMENTO) {
        return;
    }

    const lenis = new Lenis();

    function loopDeAnimacao(tempoAtual) {
        lenis.raf(tempoAtual);
        requestAnimationFrame(loopDeAnimacao);
    }

    requestAnimationFrame(loopDeAnimacao);
}

animarEntradaSidebar();
inicializarScrollSuave();
