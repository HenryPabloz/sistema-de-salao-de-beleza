// ============================================================================
// ANIMACOES.JS — animações de entrada (GSAP e Anime.js), contador numérico
// animado e scroll suave (Lenis). Compartilhado por todas as páginas.
//
// A sidebar é sempre estática (sem animação de entrada) — só o CONTEÚDO
// PRINCIPAL (dentro de .conteudo-principal) anima. Por isso os seletores
// abaixo são explicitamente escopados a essa área.
//
// Divisão de responsabilidade entre as duas bibliotecas de animação:
//   - GSAP: sequências com controle fino (stagger, easing custom, tweens de
//     números) — cards de KPI, seções, contadores, barra vertical.
//   - Anime.js: efeito pontual e simples de entrada das linhas de tabela.
// As duas nunca animam a MESMA propriedade do MESMO elemento ao mesmo tempo,
// para não competirem entre si (isso já causou um bug real neste projeto).
//
// Todas as funções aqui respeitam prefers-reduced-motion: quem prefere menos
// movimento simplesmente não vê a animação, o conteúdo já aparece no lugar.
// ============================================================================

/** Anima a entrada de um único elemento recém-revelado (ex.: depois de tirar a classe d-none). */
function animarRevelacaoConteudo(elemento) {
    if (prefereReducedMotion() || !elemento) {
        return;
    }

    gsap.from(elemento, {
        autoAlpha: 0,
        y: 16,
        duration: 0.5,
        ease: 'power2.out'
    });
}

/** Anima a entrada de um grupo de seções/cards (não linhas de tabela) com cascata via GSAP. */
function animarRevelacaoSecoes(elementos) {
    if (prefereReducedMotion() || !elementos || elementos.length === 0) {
        return;
    }

    // Só autoAlpha, sem "y": animar transform (translateY/scale) em cascata,
    // no GSAP, em VÁRIOS elementos ao mesmo tempo, deixava alguns elementos
    // com um deslocamento residual que nunca chegava a zero (ficavam
    // "tortos"/desalinhados). Opacidade sozinha não tem esse problema.
    gsap.from(elementos, {
        autoAlpha: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out'
    });
}

/** Anima a entrada dos 4 cards de KPI do dashboard: fade em cascata. */
function animarCardsKPI() {
    const cards = document.querySelectorAll('.conteudo-principal .card-indicador');

    if (prefereReducedMotion() || cards.length === 0) {
        return;
    }

    // Só autoAlpha aqui, sem "y" nem "scale" — ver o comentário em
    // animarRevelacaoSecoes: transform + cascata em múltiplos elementos
    // travava com valores residuais e desalinhava os cards.
    gsap.from(cards, {
        autoAlpha: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out'
    });
}

/** Anima a entrada das linhas de uma tabela recém-preenchida (fade + slide da esquerda), com Anime.js. */
function animarRevelacaoLista(elementos) {
    if (prefereReducedMotion() || !elementos || elementos.length === 0) {
        return;
    }

    anime.set(elementos, { opacity: 0, translateX: -20 });

    anime({
        targets: elementos,
        opacity: 1,
        translateX: 0,
        duration: 400,
        delay: anime.stagger(50),
        easing: 'easeOutQuad'
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

    if (prefereReducedMotion()) {
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

/** Anima o preenchimento da barra vertical de taxa de cancelamento, de baixo para cima. */
function animarBarraVertical(elemento, percentual) {
    if (!elemento) {
        return;
    }

    if (prefereReducedMotion()) {
        elemento.style.height = percentual + '%';
        return;
    }

    gsap.to(elemento, {
        height: percentual + '%',
        duration: 0.8,
        ease: 'power1.inOut'
    });
}

/** Liga o scroll suave (Lenis) na página inteira, exceto para quem prefere menos movimento. */
function inicializarScrollSuave() {
    if (prefereReducedMotion()) {
        return;
    }

    const lenis = new Lenis();

    function loopDeAnimacao(tempoAtual) {
        lenis.raf(tempoAtual);
        requestAnimationFrame(loopDeAnimacao);
    }

    requestAnimationFrame(loopDeAnimacao);
}

/**
 * Ao clicar num link da sidebar, faz um fade-out rápido antes de navegar.
 * Cliques com Ctrl/Cmd/Shift ou o botão do meio do mouse são ignorados aqui
 * (o navegador já sabe abrir esses em nova aba — interceptar quebraria isso).
 */
function animarSaidaAoNavegar() {
    document.querySelectorAll('.sidebar__link').forEach(function (link) {
        link.addEventListener('click', function (evento) {
            const abrirEmNovaAba = evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.button === 1;

            if (abrirEmNovaAba || prefereReducedMotion()) {
                return;
            }

            evento.preventDefault();
            const destino = link.href;

            gsap.to('.conteudo-principal', {
                autoAlpha: 0,
                duration: 0.15,
                onComplete: function () {
                    window.location.href = destino;
                }
            });
        });
    });
}

animarSaidaAoNavegar();
inicializarScrollSuave();
