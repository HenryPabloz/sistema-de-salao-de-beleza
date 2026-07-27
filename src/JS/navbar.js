// ============================================================================
// NAVBAR.JS — comportamento da sidebar: link ativo + alternância de tema.
// ============================================================================

const CHAVE_TEMA_LOCALSTORAGE = 'temaSalaoAmbar';

/** Lê data-pagina-atual da sidebar e garante a classe "ativo"/aria-current no link certo. */
function destacarLinkAtivo() {
    const sidebar = document.getElementById('sidebarPrincipal');
    const paginaAtual = sidebar.dataset.paginaAtual;
    const links = document.querySelectorAll('.sidebar__link');

    links.forEach(function (link) {
        if (link.dataset.pagina === paginaAtual) {
            link.classList.add('ativo');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('ativo');
            link.removeAttribute('aria-current');
        }
    });
}

/** Lê o tema salvo no localStorage e aplica no <html>. */
function aplicarTemaSalvo() {
    const temaSalvo = localStorage.getItem(CHAVE_TEMA_LOCALSTORAGE);

    if (temaSalvo) {
        document.documentElement.dataset.tema = temaSalvo;
    }

    const botaoTema = document.getElementById('botaoAlternarTema');
    if (document.documentElement.dataset.tema === 'claro') {
        botaoTema.setAttribute('aria-pressed', 'true');
    } else {
        botaoTema.setAttribute('aria-pressed', 'false');
    }
}

/** Alterna entre "claro" e "escuro", atualiza o <html> e salva no localStorage. */
function alternarTema() {
    const temaAtual = document.documentElement.dataset.tema;
    let novoTema = 'claro';

    if (temaAtual === 'claro') {
        novoTema = 'escuro';
    }

    document.documentElement.dataset.tema = novoTema;
    localStorage.setItem(CHAVE_TEMA_LOCALSTORAGE, novoTema);

    const botaoTema = document.getElementById('botaoAlternarTema');
    if (novoTema === 'claro') {
        botaoTema.setAttribute('aria-pressed', 'true');
    } else {
        botaoTema.setAttribute('aria-pressed', 'false');
    }
}

aplicarTemaSalvo();
destacarLinkAtivo();

document.getElementById('botaoAlternarTema').addEventListener('click', alternarTema);
