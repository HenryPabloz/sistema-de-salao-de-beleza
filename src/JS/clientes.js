// ============================================================================
// CLIENTES.JS — listagem, busca, paginação e cadastro/edição de clientes.
// ============================================================================

let listaClientesCompleta = [];
let paginaAtualClientes = 1;
const CLIENTES_POR_PAGINA = 10;

/** Busca os clientes na API e guarda em listaClientesCompleta (ordenados por nome). */
async function carregarClientes() {
    const estadoCarregando = document.getElementById('estadoCarregandoClientes');
    const estadoErro = document.getElementById('estadoErroClientes');
    const estadoVazio = document.getElementById('estadoVazioClientes');
    const conteudo = document.getElementById('conteudoListaClientes');

    estadoCarregando.classList.add('ativo');
    estadoErro.classList.remove('ativo');
    estadoVazio.classList.remove('ativo');
    conteudo.classList.add('d-none');

    try {
        const clientes = await listarClientes();

        listaClientesCompleta = clientes.sort(function (a, b) {
            return a.nome.localeCompare(b.nome);
        });

        estadoCarregando.classList.remove('ativo');
        paginaAtualClientes = 1;
        renderizarTabelaClientes();
    } catch (erro) {
        console.log('Erro ao carregar clientes:', erro);
        estadoCarregando.classList.remove('ativo');
        estadoErro.classList.add('ativo');
    }
}

/** Cria a <tr> de um cliente, com badge de status e botões de ação. */
function criarLinhaCliente(cliente) {
    const linha = document.createElement('tr');

    let classeBadge = 'badge-status-inativo';
    let textoBadge = 'Inativo';
    let classeBotaoStatus = 'botao-icone--sucesso';
    let tituloBotaoStatus = 'Reativar cliente';

    if (cliente.ativo) {
        classeBadge = 'badge-status-ativo';
        textoBadge = 'Ativo';
        classeBotaoStatus = 'botao-icone--perigo';
        tituloBotaoStatus = 'Inativar cliente';
    }

    linha.innerHTML =
        '<td>' + cliente.nome + '</td>' +
        '<td>' + formataCPF(cliente.cpf) + '</td>' +
        '<td>' + formataTelefone(cliente.telefone) + '</td>' +
        '<td><span class="badge-status ' + classeBadge + '">' + textoBadge + '</span></td>' +
        '<td><div class="acoes-tabela">' +
            '<button type="button" class="botao-icone botao-icone--editar" data-id="' + cliente.id + '" title="Editar cliente">' + ICONE_SVG_EDITAR + '</button>' +
            '<button type="button" class="botao-icone ' + classeBotaoStatus + '" data-id="' + cliente.id + '" title="' + tituloBotaoStatus + '">' + ICONE_SVG_PODER + '</button>' +
        '</div></td>';

    return linha;
}

/** Renderiza a página atual da tabela, considerando busca e paginação. */
function renderizarTabelaClientes() {
    const estadoVazio = document.getElementById('estadoVazioClientes');
    const conteudo = document.getElementById('conteudoListaClientes');
    const corpoTabela = document.getElementById('corpoTabelaClientes');
    const textoVazio = document.getElementById('textoEstadoVazioClientes');
    const termoBusca = document.getElementById('campoBuscaCliente').value.trim().toLowerCase();

    let clientesFiltrados = listaClientesCompleta;

    if (termoBusca !== '') {
        clientesFiltrados = listaClientesCompleta.filter(function (cliente) {
            return cliente.nome.toLowerCase().includes(termoBusca);
        });
    }

    if (clientesFiltrados.length === 0) {
        conteudo.classList.add('d-none');
        estadoVazio.classList.add('ativo');

        if (listaClientesCompleta.length === 0) {
            textoVazio.textContent = 'Cadastre o primeiro cliente para começar a organizar seus atendimentos.';
        } else {
            textoVazio.textContent = 'Nenhum cliente encontrado para essa busca.';
        }

        return;
    }

    estadoVazio.classList.remove('ativo');
    conteudo.classList.remove('d-none');

    const totalPaginas = Math.ceil(clientesFiltrados.length / CLIENTES_POR_PAGINA);

    if (paginaAtualClientes > totalPaginas) {
        paginaAtualClientes = totalPaginas;
    }

    const indiceInicial = (paginaAtualClientes - 1) * CLIENTES_POR_PAGINA;
    const clientesDaPagina = clientesFiltrados.slice(indiceInicial, indiceInicial + CLIENTES_POR_PAGINA);

    corpoTabela.innerHTML = '';
    clientesDaPagina.forEach(function (cliente) {
        corpoTabela.appendChild(criarLinhaCliente(cliente));
    });
    animarRevelacaoLista(corpoTabela.querySelectorAll('tr'));

    renderizarPaginacaoClientes(clientesFiltrados.length);
}

/** Cria os botões de paginação de acordo com o total de clientes filtrados. */
function renderizarPaginacaoClientes(totalDeRegistros) {
    const paginacao = document.getElementById('paginacaoClientes');
    paginacao.innerHTML = '';

    const totalPaginas = Math.ceil(totalDeRegistros / CLIENTES_POR_PAGINA);

    if (totalPaginas <= 1) {
        return;
    }

    for (let numeroPagina = 1; numeroPagina <= totalPaginas; numeroPagina++) {
        const botaoPagina = document.createElement('button');
        botaoPagina.type = 'button';
        botaoPagina.textContent = numeroPagina;

        if (numeroPagina === paginaAtualClientes) {
            botaoPagina.classList.add('pagina-ativa');
        }

        botaoPagina.addEventListener('click', function () {
            paginaAtualClientes = numeroPagina;
            renderizarTabelaClientes();
        });

        paginacao.appendChild(botaoPagina);
    }
}

/** Alterna entre a seção de listagem e a de formulário. */
function mostrarFormularioCliente(clienteParaEditar) {
    const formulario = document.getElementById('formularioCliente');
    formulario.reset();

    limparErroCampo(document.getElementById('campoNomeCliente'));
    limparErroCampo(document.getElementById('campoCpfCliente'));
    limparErroCampo(document.getElementById('campoTelefoneCliente'));

    if (clienteParaEditar) {
        document.getElementById('tituloFormularioCliente').textContent = 'Editar cliente';
        document.getElementById('clienteIdEditando').value = clienteParaEditar.id;
        document.getElementById('campoNomeCliente').value = clienteParaEditar.nome;
        document.getElementById('campoCpfCliente').value = formataCPF(clienteParaEditar.cpf);
        document.getElementById('campoTelefoneCliente').value = formataTelefone(clienteParaEditar.telefone);
    } else {
        document.getElementById('tituloFormularioCliente').textContent = 'Novo cliente';
        document.getElementById('clienteIdEditando').value = '';
    }

    document.getElementById('secaoListagemClientes').classList.add('d-none');
    document.getElementById('secaoFormularioCliente').classList.remove('d-none');
    animarRevelacaoConteudo(document.getElementById('secaoFormularioCliente'));
}

function mostrarListagemClientes() {
    document.getElementById('secaoFormularioCliente').classList.add('d-none');
    document.getElementById('secaoListagemClientes').classList.remove('d-none');
}

/** Retorna true se o CPF já pertencer a outro cliente cadastrado. */
function cpfJaCadastrado(cpfDigitado) {
    const idEditando = document.getElementById('clienteIdEditando').value;
    const numerosDigitados = cpfDigitado.replace(/\D/g, '');

    return listaClientesCompleta.some(function (cliente) {
        const mesmoNumero = cliente.cpf === numerosDigitados;
        const ehOutroCliente = cliente.id !== idEditando;
        return mesmoNumero && ehOutroCliente;
    });
}

/** Valida os campos do formulário e exibe as mensagens de erro específicas. */
function validarFormularioCliente() {
    let formularioValido = true;

    const campoNome = document.getElementById('campoNomeCliente');
    const campoCpf = document.getElementById('campoCpfCliente');
    const campoTelefone = document.getElementById('campoTelefoneCliente');

    limparErroCampo(campoNome);
    limparErroCampo(campoCpf);
    limparErroCampo(campoTelefone);

    const nome = campoNome.value.trim();
    const cpf = campoCpf.value;
    const telefone = campoTelefone.value;

    if (campoPreenchido(nome) === false) {
        exibirErroCampo(campoNome, 'Nome é obrigatório');
        formularioValido = false;
    } else if (contemNumero(nome)) {
        exibirErroCampo(campoNome, 'Nome não pode conter números');
        formularioValido = false;
    }

    if (campoPreenchido(cpf) === false) {
        exibirErroCampo(campoCpf, 'CPF é obrigatório');
        formularioValido = false;
    } else if (validaCPFEstrutural(cpf) === false) {
        exibirErroCampo(campoCpf, 'CPF deve conter 11 dígitos');
        formularioValido = false;
    } else if (cpfJaCadastrado(cpf)) {
        exibirErroCampo(campoCpf, 'Este CPF já está cadastrado');
        formularioValido = false;
    }

    if (campoPreenchido(telefone) === false) {
        exibirErroCampo(campoTelefone, 'Telefone é obrigatório');
        formularioValido = false;
    }

    return formularioValido;
}

/** Lê o formulário, chama a API (criar ou editar) e trata sucesso/erro. */
async function salvarCliente(evento) {
    evento.preventDefault();

    if (validarFormularioCliente() === false) {
        return;
    }

    const idEditando = document.getElementById('clienteIdEditando').value;
    const nome = document.getElementById('campoNomeCliente').value.trim();
    const cpf = document.getElementById('campoCpfCliente').value.replace(/\D/g, '');
    const telefone = document.getElementById('campoTelefoneCliente').value.replace(/\D/g, '');

    const botaoSalvar = document.getElementById('botaoSalvarCliente');
    botaoSalvar.disabled = true;

    try {
        if (idEditando === '') {
            let maiorIdCliente = 0;
            listaClientesCompleta.forEach(function (cliente) {
                if (cliente.idCliente > maiorIdCliente) {
                    maiorIdCliente = cliente.idCliente;
                }
            });

            const clienteNovo = {
                idCliente: maiorIdCliente + 1,
                nome: nome,
                cpf: cpf,
                telefone: telefone,
                ativo: true
            };

            await criarCliente(clienteNovo);
        } else {
            const clienteExistente = listaClientesCompleta.find(function (c) {
                return c.id === idEditando;
            });

            const clienteAtualizado = {
                idCliente: clienteExistente.idCliente,
                nome: nome,
                cpf: cpf,
                telefone: telefone,
                ativo: clienteExistente.ativo
            };

            await editarCliente(idEditando, clienteAtualizado);
        }

        await exibirModalSucesso('Cliente salvo com sucesso!');
        mostrarListagemClientes();
        await carregarClientes();
    } catch (erro) {
        console.log('Erro ao salvar cliente:', erro);
        exibirErro('Não foi possível salvar', erro.message);
    } finally {
        botaoSalvar.disabled = false;
    }
}

/** Exibe modal de confirmação e chama a API para inativar/reativar o cliente. */
async function alternarStatusClienteNaLista(cliente) {
    let titulo = 'Inativar cliente?';
    let texto = 'O cliente "' + cliente.nome + '" ficará indisponível para novos agendamentos.';
    let textoBotao = 'Inativar';

    if (cliente.ativo === false) {
        titulo = 'Reativar cliente?';
        texto = 'O cliente "' + cliente.nome + '" voltará a ficar disponível para agendamentos.';
        textoBotao = 'Reativar';
    }

    const confirmado = await confirmarAcao(titulo, texto, textoBotao);

    if (confirmado === false) {
        return;
    }

    try {
        await alternarStatusCliente(cliente.id, !cliente.ativo);
        exibirToastSucesso('Status do cliente atualizado!');
        await carregarClientes();
    } catch (erro) {
        console.log('Erro ao alternar status do cliente:', erro);
        exibirErro('Não foi possível atualizar', erro.message);
    }
}

// --- Eventos -----------------------------------------------------------------

document.getElementById('corpoTabelaClientes').addEventListener('click', function (evento) {
    const botaoEditar = evento.target.closest('.botao-icone--editar');
    const botaoStatus = evento.target.closest('.botao-icone--sucesso, .botao-icone--perigo');

    if (botaoEditar) {
        const idRegistro = botaoEditar.dataset.id;
        const cliente = listaClientesCompleta.find(function (c) { return c.id === idRegistro; });
        mostrarFormularioCliente(cliente);
    } else if (botaoStatus) {
        const idRegistro = botaoStatus.dataset.id;
        const cliente = listaClientesCompleta.find(function (c) { return c.id === idRegistro; });
        alternarStatusClienteNaLista(cliente);
    }
});

document.getElementById('campoBuscaCliente').addEventListener('input', function () {
    paginaAtualClientes = 1;
    renderizarTabelaClientes();
});

document.getElementById('campoCpfCliente').addEventListener('input', function (evento) {
    evento.target.value = formataCPF(evento.target.value);
});

document.getElementById('campoTelefoneCliente').addEventListener('input', function (evento) {
    evento.target.value = formataTelefone(evento.target.value);
});

document.getElementById('botaoNovoCliente').addEventListener('click', function () {
    mostrarFormularioCliente(null);
});

document.getElementById('botaoVoltarListagemCliente').addEventListener('click', mostrarListagemClientes);
document.getElementById('botaoCancelarFormularioCliente').addEventListener('click', mostrarListagemClientes);
document.getElementById('formularioCliente').addEventListener('submit', salvarCliente);
document.getElementById('botaoRecarregarClientes').addEventListener('click', carregarClientes);

carregarClientes();
