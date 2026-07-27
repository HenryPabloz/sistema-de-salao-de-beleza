// ============================================================================
// SERVICOS.JS — listagem e cadastro/edição de serviços.
// ============================================================================

let listaServicosCompleta = [];

/** Busca os serviços na API e guarda em listaServicosCompleta (ordenados por nome). */
async function carregarServicos() {
    const estadoCarregando = document.getElementById('estadoCarregandoServicos');
    const estadoErro = document.getElementById('estadoErroServicos');
    const estadoVazio = document.getElementById('estadoVazioServicos');
    const conteudo = document.getElementById('conteudoListaServicos');

    estadoCarregando.classList.add('ativo');
    estadoErro.classList.remove('ativo');
    estadoVazio.classList.remove('ativo');
    conteudo.classList.add('d-none');

    try {
        const servicos = await listarServicos();

        listaServicosCompleta = servicos.sort(function (a, b) {
            return a.nome.localeCompare(b.nome);
        });

        estadoCarregando.classList.remove('ativo');
        renderizarTabelaServicos();
    } catch (erro) {
        console.log('Erro ao carregar serviços:', erro);
        estadoCarregando.classList.remove('ativo');
        estadoErro.classList.add('ativo');
    }
}

function criarLinhaServico(servico) {
    const linha = document.createElement('tr');
    linha.innerHTML =
        '<td>' + servico.nome + '</td>' +
        '<td>' + servico.duracao + ' min</td>' +
        '<td>' + formataPrecoBRL(servico.preco) + '</td>' +
        '<td><div class="acoes-tabela">' +
            '<button type="button" class="botao-icone botao-icone--editar" data-id="' + servico.id + '" title="Editar serviço">' + ICONE_SVG_EDITAR + '</button>' +
            '<button type="button" class="botao-icone botao-icone--perigo" data-id="' + servico.id + '" title="Excluir serviço">' + ICONE_SVG_LIXEIRA + '</button>' +
        '</div></td>';
    return linha;
}

/** Renderiza as linhas da tabela de serviços. */
function renderizarTabelaServicos() {
    const estadoVazio = document.getElementById('estadoVazioServicos');
    const conteudo = document.getElementById('conteudoListaServicos');
    const corpoTabela = document.getElementById('corpoTabelaServicos');

    if (listaServicosCompleta.length === 0) {
        conteudo.classList.add('d-none');
        estadoVazio.classList.add('ativo');
        return;
    }

    estadoVazio.classList.remove('ativo');
    conteudo.classList.remove('d-none');

    corpoTabela.innerHTML = '';
    listaServicosCompleta.forEach(function (servico) {
        corpoTabela.appendChild(criarLinhaServico(servico));
    });
    animarRevelacaoLista(corpoTabela.querySelectorAll('tr'));
}

function mostrarFormularioServico(servicoParaEditar) {
    const formulario = document.getElementById('formularioServico');
    formulario.reset();

    limparErroCampo(document.getElementById('campoNomeServico'));
    limparErroCampo(document.getElementById('campoDuracaoServico'));
    limparErroCampo(document.getElementById('campoPrecoServico'));

    if (servicoParaEditar) {
        document.getElementById('tituloFormularioServico').textContent = 'Editar serviço';
        document.getElementById('servicoIdEditando').value = servicoParaEditar.id;
        document.getElementById('campoNomeServico').value = servicoParaEditar.nome;
        document.getElementById('campoDuracaoServico').value = servicoParaEditar.duracao;
        document.getElementById('campoPrecoServico').value = formataPrecoParaInput(servicoParaEditar.preco);
    } else {
        document.getElementById('tituloFormularioServico').textContent = 'Novo serviço';
        document.getElementById('servicoIdEditando').value = '';
    }

    document.getElementById('secaoListagemServicos').classList.add('d-none');
    document.getElementById('secaoFormularioServico').classList.remove('d-none');
    animarRevelacaoConteudo(document.getElementById('secaoFormularioServico'));
}

function mostrarListagemServicos() {
    document.getElementById('secaoFormularioServico').classList.add('d-none');
    document.getElementById('secaoListagemServicos').classList.remove('d-none');
}

/** Valida os campos do formulário e exibe as mensagens de erro específicas. */
function validarFormularioServico() {
    let formularioValido = true;

    const campoNome = document.getElementById('campoNomeServico');
    const campoDuracao = document.getElementById('campoDuracaoServico');
    const campoPreco = document.getElementById('campoPrecoServico');

    limparErroCampo(campoNome);
    limparErroCampo(campoDuracao);
    limparErroCampo(campoPreco);

    const nome = campoNome.value.trim();
    const duracao = campoDuracao.value.trim();
    const preco = campoPreco.value.trim();

    if (campoPreenchido(nome) === false) {
        exibirErroCampo(campoNome, 'Nome é obrigatório');
        formularioValido = false;
    }

    if (campoPreenchido(duracao) === false) {
        exibirErroCampo(campoDuracao, 'Duração é obrigatória');
        formularioValido = false;
    } else if (Number.isInteger(Number(duracao)) === false || Number(duracao) <= 0) {
        exibirErroCampo(campoDuracao, 'Duração deve ser um número inteiro maior que zero');
        formularioValido = false;
    }

    if (campoPreenchido(preco) === false) {
        exibirErroCampo(campoPreco, 'Preço é obrigatório');
        formularioValido = false;
    } else if (isNaN(converterTextoParaNumero(preco)) || converterTextoParaNumero(preco) <= 0) {
        exibirErroCampo(campoPreco, 'Preço deve ser um número maior que zero');
        formularioValido = false;
    } else if (temNoMaximoDuasCasasDecimais(preco) === false) {
        exibirErroCampo(campoPreco, 'Preço deve ter no máximo 2 casas decimais');
        formularioValido = false;
    }

    return formularioValido;
}

/** Lê o formulário, chama a API (criar ou editar) e trata sucesso/erro. */
async function salvarServico(evento) {
    evento.preventDefault();

    if (validarFormularioServico() === false) {
        return;
    }

    const idEditando = document.getElementById('servicoIdEditando').value;
    const nome = document.getElementById('campoNomeServico').value.trim();
    const duracao = Number(document.getElementById('campoDuracaoServico').value);
    const preco = converterTextoParaNumero(document.getElementById('campoPrecoServico').value);

    const botaoSalvar = document.getElementById('botaoSalvarServico');
    botaoSalvar.disabled = true;

    try {
        if (idEditando === '') {
            let maiorId = 0;
            listaServicosCompleta.forEach(function (servico) {
                if (servico.idServico > maiorId) {
                    maiorId = servico.idServico;
                }
            });

            await criarServico({
                idServico: maiorId + 1,
                nome: nome,
                duracao: duracao,
                preco: preco
            });
        } else {
            const servicoExistente = listaServicosCompleta.find(function (s) {
                return s.id === idEditando;
            });

            await editarServico(idEditando, {
                idServico: servicoExistente.idServico,
                nome: nome,
                duracao: duracao,
                preco: preco
            });
        }

        await exibirModalSucesso('Serviço salvo com sucesso!');
        mostrarListagemServicos();
        await carregarServicos();
    } catch (erro) {
        console.log('Erro ao salvar serviço:', erro);
        exibirErro('Não foi possível salvar', erro.message);
    } finally {
        botaoSalvar.disabled = false;
    }
}

/**
 * Antes de excluir, verifica se o serviço tem agendamentos com
 * status "agendado". Se tiver, bloqueia e explica o motivo.
 */
async function excluirServicoDaLista(servico) {
    try {
        const agendamentos = await listarAgendamentos();

        const possuiAgendamentoAtivo = agendamentos.some(function (agendamento) {
            return agendamento.idServico === servico.idServico && agendamento.status === 'agendado';
        });

        if (possuiAgendamentoAtivo) {
            exibirErro('Não é possível excluir', 'Este serviço possui agendamentos marcados. Cancele os agendamentos antes de excluir.');
            return;
        }

        const confirmado = await confirmarAcao(
            'Excluir serviço?',
            'O serviço "' + servico.nome + '" será removido permanentemente.',
            'Excluir'
        );

        if (confirmado === false) {
            return;
        }

        await excluirServico(servico.id);
        exibirToastSucesso('Serviço excluído com sucesso!');
        await carregarServicos();
    } catch (erro) {
        console.log('Erro ao excluir serviço:', erro);
        exibirErro('Não foi possível excluir', erro.message);
    }
}

// --- Eventos -----------------------------------------------------------------

document.getElementById('corpoTabelaServicos').addEventListener('click', function (evento) {
    const botaoEditar = evento.target.closest('.botao-icone--editar');
    const botaoExcluir = evento.target.closest('.botao-icone--perigo');

    if (botaoEditar) {
        const idRegistro = botaoEditar.dataset.id;
        const servico = listaServicosCompleta.find(function (s) { return s.id === idRegistro; });
        mostrarFormularioServico(servico);
    } else if (botaoExcluir) {
        const idRegistro = botaoExcluir.dataset.id;
        const servico = listaServicosCompleta.find(function (s) { return s.id === idRegistro; });
        excluirServicoDaLista(servico);
    }
});

document.getElementById('botaoNovoServico').addEventListener('click', function () {
    mostrarFormularioServico(null);
});

document.getElementById('botaoVoltarListagemServico').addEventListener('click', mostrarListagemServicos);
document.getElementById('botaoCancelarFormularioServico').addEventListener('click', mostrarListagemServicos);
document.getElementById('formularioServico').addEventListener('submit', salvarServico);
document.getElementById('botaoRecarregarServicos').addEventListener('click', carregarServicos);

carregarServicos();
