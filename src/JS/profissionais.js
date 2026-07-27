// ============================================================================
// PROFISSIONAIS.JS — listagem e cadastro/edição de profissionais.
// ============================================================================

let listaProfissionaisCompleta = [];

/** Busca os profissionais na API e guarda em listaProfissionaisCompleta (ordenados por nome). */
async function carregarProfissionais() {
    const estadoCarregando = document.getElementById('estadoCarregandoProfissionais');
    const estadoErro = document.getElementById('estadoErroProfissionais');
    const estadoVazio = document.getElementById('estadoVazioProfissionais');
    const conteudo = document.getElementById('conteudoListaProfissionais');

    estadoCarregando.classList.add('ativo');
    estadoErro.classList.remove('ativo');
    estadoVazio.classList.remove('ativo');
    conteudo.classList.add('d-none');

    try {
        const profissionais = await listarProfissionais();

        listaProfissionaisCompleta = profissionais.sort(function (a, b) {
            return a.nome.localeCompare(b.nome);
        });

        estadoCarregando.classList.remove('ativo');
        renderizarTabelaProfissionais();
    } catch (erro) {
        console.log('Erro ao carregar profissionais:', erro);
        estadoCarregando.classList.remove('ativo');
        estadoErro.classList.add('ativo');
    }
}

function criarLinhaProfissional(profissional) {
    const linha = document.createElement('tr');
    linha.innerHTML =
        '<td>' + profissional.nome + '</td>' +
        '<td>' + capitalizarPrimeiraLetra(profissional.especialidade) + '</td>' +
        '<td><div class="acoes-tabela">' +
            '<button type="button" class="botao-icone botao-icone--editar" data-id="' + profissional.id + '" title="Editar profissional">' + ICONE_SVG_EDITAR + '</button>' +
            '<button type="button" class="botao-icone botao-icone--perigo" data-id="' + profissional.id + '" title="Excluir profissional">' + ICONE_SVG_LIXEIRA + '</button>' +
        '</div></td>';
    return linha;
}

/** Renderiza as linhas da tabela de profissionais. */
function renderizarTabelaProfissionais() {
    const estadoVazio = document.getElementById('estadoVazioProfissionais');
    const conteudo = document.getElementById('conteudoListaProfissionais');
    const corpoTabela = document.getElementById('corpoTabelaProfissionais');

    if (listaProfissionaisCompleta.length === 0) {
        conteudo.classList.add('d-none');
        estadoVazio.classList.add('ativo');
        return;
    }

    estadoVazio.classList.remove('ativo');
    conteudo.classList.remove('d-none');

    corpoTabela.innerHTML = '';
    listaProfissionaisCompleta.forEach(function (profissional) {
        corpoTabela.appendChild(criarLinhaProfissional(profissional));
    });
    animarRevelacaoLista(corpoTabela.querySelectorAll('tr'));
}

function mostrarFormularioProfissional(profissionalParaEditar) {
    const formulario = document.getElementById('formularioProfissional');
    formulario.reset();

    limparErroCampo(document.getElementById('campoNomeProfissional'));
    limparErroCampo(document.getElementById('campoEspecialidadeProfissional'));

    if (profissionalParaEditar) {
        document.getElementById('tituloFormularioProfissional').textContent = 'Editar profissional';
        document.getElementById('profissionalIdEditando').value = profissionalParaEditar.id;
        document.getElementById('campoNomeProfissional').value = profissionalParaEditar.nome;
        document.getElementById('campoEspecialidadeProfissional').value = profissionalParaEditar.especialidade;
    } else {
        document.getElementById('tituloFormularioProfissional').textContent = 'Novo profissional';
        document.getElementById('profissionalIdEditando').value = '';
    }

    document.getElementById('secaoListagemProfissionais').classList.add('d-none');
    document.getElementById('secaoFormularioProfissional').classList.remove('d-none');
    animarRevelacaoConteudo(document.getElementById('secaoFormularioProfissional'));
}

function mostrarListagemProfissionais() {
    document.getElementById('secaoFormularioProfissional').classList.add('d-none');
    document.getElementById('secaoListagemProfissionais').classList.remove('d-none');
}

/** Valida os campos do formulário e exibe as mensagens de erro específicas. */
function validarFormularioProfissional() {
    let formularioValido = true;

    const campoNome = document.getElementById('campoNomeProfissional');
    const campoEspecialidade = document.getElementById('campoEspecialidadeProfissional');

    limparErroCampo(campoNome);
    limparErroCampo(campoEspecialidade);

    const nome = campoNome.value.trim();
    const especialidade = campoEspecialidade.value;

    if (campoPreenchido(nome) === false) {
        exibirErroCampo(campoNome, 'Nome é obrigatório');
        formularioValido = false;
    } else if (contemNumero(nome)) {
        exibirErroCampo(campoNome, 'Nome não pode conter números');
        formularioValido = false;
    }

    if (campoPreenchido(especialidade) === false) {
        exibirErroCampo(campoEspecialidade, 'Especialidade é obrigatória');
        formularioValido = false;
    }

    return formularioValido;
}

/** Lê o formulário, chama a API (criar ou editar) e trata sucesso/erro. */
async function salvarProfissional(evento) {
    evento.preventDefault();

    if (validarFormularioProfissional() === false) {
        return;
    }

    const idEditando = document.getElementById('profissionalIdEditando').value;
    const nome = document.getElementById('campoNomeProfissional').value.trim();
    const especialidade = document.getElementById('campoEspecialidadeProfissional').value;

    const botaoSalvar = document.getElementById('botaoSalvarProfissional');
    botaoSalvar.disabled = true;

    try {
        if (idEditando === '') {
            let maiorId = 0;
            listaProfissionaisCompleta.forEach(function (profissional) {
                if (profissional.idProfissional > maiorId) {
                    maiorId = profissional.idProfissional;
                }
            });

            await criarProfissional({
                idProfissional: maiorId + 1,
                nome: nome,
                especialidade: especialidade
            });
        } else {
            const profissionalExistente = listaProfissionaisCompleta.find(function (p) {
                return p.id === idEditando;
            });

            await editarProfissional(idEditando, {
                idProfissional: profissionalExistente.idProfissional,
                nome: nome,
                especialidade: especialidade
            });
        }

        await exibirModalSucesso('Profissional salvo com sucesso!');
        mostrarListagemProfissionais();
        await carregarProfissionais();
    } catch (erro) {
        console.log('Erro ao salvar profissional:', erro);
        exibirErro('Não foi possível salvar', erro.message);
    } finally {
        botaoSalvar.disabled = false;
    }
}

/**
 * Antes de excluir, verifica se o profissional tem agendamentos com
 * status "agendado". Se tiver, bloqueia e explica o motivo.
 */
async function excluirProfissionalDaLista(profissional) {
    try {
        const agendamentos = await listarAgendamentos();

        const possuiAgendamentoAtivo = agendamentos.some(function (agendamento) {
            return agendamento.idProfissional === profissional.idProfissional && agendamento.status === 'agendado';
        });

        if (possuiAgendamentoAtivo) {
            exibirErro('Não é possível excluir', 'Este profissional possui agendamentos marcados. Cancele os agendamentos antes de excluir.');
            return;
        }

        const confirmado = await confirmarAcao(
            'Excluir profissional?',
            'O profissional "' + profissional.nome + '" será removido permanentemente.',
            'Excluir'
        );

        if (confirmado === false) {
            return;
        }

        await excluirProfissional(profissional.id);
        exibirToastSucesso('Profissional excluído com sucesso!');
        await carregarProfissionais();
    } catch (erro) {
        console.log('Erro ao excluir profissional:', erro);
        exibirErro('Não foi possível excluir', erro.message);
    }
}

// --- Eventos -----------------------------------------------------------------

document.getElementById('corpoTabelaProfissionais').addEventListener('click', function (evento) {
    const botaoEditar = evento.target.closest('.botao-icone--editar');
    const botaoExcluir = evento.target.closest('.botao-icone--perigo');

    if (botaoEditar) {
        const idRegistro = botaoEditar.dataset.id;
        const profissional = listaProfissionaisCompleta.find(function (p) { return p.id === idRegistro; });
        mostrarFormularioProfissional(profissional);
    } else if (botaoExcluir) {
        const idRegistro = botaoExcluir.dataset.id;
        const profissional = listaProfissionaisCompleta.find(function (p) { return p.id === idRegistro; });
        excluirProfissionalDaLista(profissional);
    }
});

document.getElementById('botaoNovoProfissional').addEventListener('click', function () {
    mostrarFormularioProfissional(null);
});

document.getElementById('botaoVoltarListagemProfissional').addEventListener('click', mostrarListagemProfissionais);
document.getElementById('botaoCancelarFormularioProfissional').addEventListener('click', mostrarListagemProfissionais);
document.getElementById('formularioProfissional').addEventListener('submit', salvarProfissional);
document.getElementById('botaoRecarregarProfissionais').addEventListener('click', carregarProfissionais);

carregarProfissionais();
