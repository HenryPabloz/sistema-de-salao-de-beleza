// ============================================================================
// AGENDAMENTOS.JS — listagem, busca, paginação, cadastro/edição e a regra
// central do sistema: detecção de conflito de horário (com buffer de 15min).
// ============================================================================

let listaAgendamentosCompleta = [];
let listaClientesAgendamento = [];
let listaProfissionaisAgendamento = [];
let listaServicosAgendamento = [];
let paginaAtualAgendamentos = 1;
const AGENDAMENTOS_POR_PAGINA = 10;

// Grade de horários disponíveis: salão abre 09:00, fecha 18:00, passos de 30min.
const HORARIO_ABERTURA = 9;
const HORARIO_FECHAMENTO = 18;
const INTERVALO_GRADE_MINUTOS = 30;
const BUFFER_MINUTOS_AGENDA = 15;

function buscarClientePorId(idCliente) {
    return listaClientesAgendamento.find(function (c) { return c.idCliente === idCliente; });
}

function buscarProfissionalPorId(idProfissional) {
    return listaProfissionaisAgendamento.find(function (p) { return p.idProfissional === idProfissional; });
}

function buscarServicoPorId(idServico) {
    return listaServicosAgendamento.find(function (s) { return s.idServico === idServico; });
}

/** Busca clientes, profissionais, serviços e agendamentos (necessários para exibir nomes). */
async function carregarAgendamentos() {
    const estadoCarregando = document.getElementById('estadoCarregandoAgendamentos');
    const estadoErro = document.getElementById('estadoErroAgendamentos');
    const estadoVazio = document.getElementById('estadoVazioAgendamentos');
    const conteudo = document.getElementById('conteudoListaAgendamentos');

    estadoCarregando.classList.add('ativo');
    estadoErro.classList.remove('ativo');
    estadoVazio.classList.remove('ativo');
    conteudo.classList.add('d-none');

    try {
        listaClientesAgendamento = await listarClientes();
        listaProfissionaisAgendamento = await listarProfissionais();
        listaServicosAgendamento = await listarServicos();
        const agendamentos = await listarAgendamentos();

        listaAgendamentosCompleta = agendamentos.sort(function (a, b) {
            return new Date(b.dataHora) - new Date(a.dataHora);
        });

        estadoCarregando.classList.remove('ativo');
        paginaAtualAgendamentos = 1;
        renderizarTabelaAgendamentos();
    } catch (erro) {
        console.log('Erro ao carregar agendamentos:', erro);
        estadoCarregando.classList.remove('ativo');
        estadoErro.classList.add('ativo');
    }
}

function criarLinhaAgendamento(agendamento) {
    const linha = document.createElement('tr');

    const cliente = buscarClientePorId(agendamento.idCliente);
    const profissional = buscarProfissionalPorId(agendamento.idProfissional);
    const servico = buscarServicoPorId(agendamento.idServico);

    let nomeCliente = 'Cliente removido';
    if (cliente) {
        nomeCliente = cliente.nome;
    }

    let nomeProfissional = 'Profissional removido';
    if (profissional) {
        nomeProfissional = profissional.nome + ' (' + capitalizarPrimeiraLetra(profissional.especialidade) + ')';
    }

    let nomeServico = 'Serviço removido';
    if (servico) {
        nomeServico = servico.nome;
    }

    let classeBadge = 'badge-status-agendado';
    let textoBadge = 'Agendado';

    if (agendamento.status === 'realizado') {
        classeBadge = 'badge-status-realizado';
        textoBadge = 'Realizado';
    } else if (agendamento.status === 'cancelado') {
        classeBadge = 'badge-status-cancelado';
        textoBadge = 'Cancelado';
    }

    let botoesAcao = '';
    if (agendamento.status === 'agendado') {
        botoesAcao =
            '<button type="button" class="botao-icone botao-icone--editar" data-id="' + agendamento.id + '" title="Editar agendamento">' + ICONE_SVG_EDITAR + '</button>' +
            '<button type="button" class="botao-icone botao-icone--sucesso" data-id="' + agendamento.id + '" title="Concluir agendamento">' + ICONE_SVG_TESOURA + '</button>' +
            '<button type="button" class="botao-icone botao-icone--perigo" data-id="' + agendamento.id + '" title="Cancelar agendamento">' + ICONE_SVG_TESOURA_TRACEJADA + '</button>';
    }

    linha.innerHTML =
        '<td>' + escaparHTML(nomeCliente) + '</td>' +
        '<td>' + escaparHTML(nomeProfissional) + '</td>' +
        '<td>' + escaparHTML(nomeServico) + '</td>' +
        '<td>' + formataDataHora(agendamento.dataHora) + '</td>' +
        '<td><span class="badge-status ' + classeBadge + '">' + textoBadge + '</span></td>' +
        '<td><div class="acoes-tabela">' + botoesAcao + '</div></td>';

    return linha;
}

/** Renderiza a página atual da tabela, com os botões de ação corretos por status. */
function renderizarTabelaAgendamentos() {
    const estadoVazio = document.getElementById('estadoVazioAgendamentos');
    const conteudo = document.getElementById('conteudoListaAgendamentos');
    const corpoTabela = document.getElementById('corpoTabelaAgendamentos');
    const textoVazio = document.getElementById('textoEstadoVazioAgendamentos');
    const termoBusca = document.getElementById('campoBuscaAgendamento').value.trim().toLowerCase();
    const statusSelecionado = document.getElementById('filtroStatusAgendamentoLista').value;

    let agendamentosFiltrados = listaAgendamentosCompleta;

    if (termoBusca !== '') {
        agendamentosFiltrados = agendamentosFiltrados.filter(function (agendamento) {
            const cliente = buscarClientePorId(agendamento.idCliente);
            const profissional = buscarProfissionalPorId(agendamento.idProfissional);

            let clienteCombina = false;
            if (cliente) {
                clienteCombina = cliente.nome.toLowerCase().includes(termoBusca);
            }

            let profissionalCombina = false;
            if (profissional) {
                profissionalCombina = profissional.nome.toLowerCase().includes(termoBusca);
            }

            return clienteCombina || profissionalCombina;
        });
    }

    if (statusSelecionado !== '') {
        agendamentosFiltrados = agendamentosFiltrados.filter(function (agendamento) {
            return agendamento.status === statusSelecionado;
        });
    }

    if (agendamentosFiltrados.length === 0) {
        conteudo.classList.add('d-none');
        estadoVazio.classList.add('ativo');

        if (listaAgendamentosCompleta.length === 0) {
            textoVazio.textContent = 'Crie o primeiro agendamento para começar a preencher a agenda.';
        } else {
            textoVazio.textContent = 'Nenhum agendamento encontrado para essa busca/filtro.';
        }

        return;
    }

    estadoVazio.classList.remove('ativo');
    conteudo.classList.remove('d-none');

    const totalPaginas = Math.ceil(agendamentosFiltrados.length / AGENDAMENTOS_POR_PAGINA);

    if (paginaAtualAgendamentos > totalPaginas) {
        paginaAtualAgendamentos = totalPaginas;
    }

    const indiceInicial = (paginaAtualAgendamentos - 1) * AGENDAMENTOS_POR_PAGINA;
    const agendamentosDaPagina = agendamentosFiltrados.slice(indiceInicial, indiceInicial + AGENDAMENTOS_POR_PAGINA);

    corpoTabela.innerHTML = '';
    agendamentosDaPagina.forEach(function (agendamento) {
        corpoTabela.appendChild(criarLinhaAgendamento(agendamento));
    });
    animarRevelacaoLista(corpoTabela.querySelectorAll('tr'));

    renderizarPaginacaoAgendamentos(agendamentosFiltrados.length);
}

function renderizarPaginacaoAgendamentos(totalDeRegistros) {
    const paginacao = document.getElementById('paginacaoAgendamentos');
    paginacao.innerHTML = '';

    const totalPaginas = Math.ceil(totalDeRegistros / AGENDAMENTOS_POR_PAGINA);

    if (totalPaginas <= 1) {
        return;
    }

    for (let numeroPagina = 1; numeroPagina <= totalPaginas; numeroPagina++) {
        const botaoPagina = document.createElement('button');
        botaoPagina.type = 'button';
        botaoPagina.textContent = numeroPagina;

        if (numeroPagina === paginaAtualAgendamentos) {
            botaoPagina.classList.add('pagina-ativa');
        }

        botaoPagina.addEventListener('click', function () {
            paginaAtualAgendamentos = numeroPagina;
            renderizarTabelaAgendamentos();
        });

        paginacao.appendChild(botaoPagina);
    }
}

/** Preenche os três selects (cliente ativo, profissional, serviço) do formulário. */
function preencherSelectsFormularioAgendamento() {
    const selectCliente = document.getElementById('campoClienteAgendamento');
    const selectProfissional = document.getElementById('campoProfissionalAgendamento');
    const selectServico = document.getElementById('campoServicoAgendamento');

    selectCliente.innerHTML = '<option value="">Selecione um cliente ativo</option>';
    selectProfissional.innerHTML = '<option value="">Selecione um profissional</option>';
    selectServico.innerHTML = '<option value="">Selecione um serviço</option>';

    const clientesAtivos = listaClientesAgendamento.filter(function (cliente) {
        return cliente.ativo === true;
    });

    clientesAtivos.forEach(function (cliente) {
        const opcao = document.createElement('option');
        opcao.value = cliente.idCliente;
        opcao.textContent = cliente.nome + ' — ' + formataTelefone(cliente.telefone);
        selectCliente.appendChild(opcao);
    });

    listaProfissionaisAgendamento.forEach(function (profissional) {
        const opcao = document.createElement('option');
        opcao.value = profissional.idProfissional;
        opcao.textContent = profissional.nome + ' — ' + capitalizarPrimeiraLetra(profissional.especialidade);
        selectProfissional.appendChild(opcao);
    });

    listaServicosAgendamento.forEach(function (servico) {
        const opcao = document.createElement('option');
        opcao.value = servico.idServico;
        opcao.textContent = servico.nome + ' (' + servico.duracao + ' min) — ' + formataPrecoBRL(servico.preco);
        selectServico.appendChild(opcao);
    });

    const avisoSemClientes = document.getElementById('avisoSemClientes');
    const avisoSemProfissionais = document.getElementById('avisoSemProfissionais');
    const avisoSemServicos = document.getElementById('avisoSemServicos');

    if (clientesAtivos.length === 0) {
        avisoSemClientes.classList.remove('d-none');
        selectCliente.disabled = true;
    } else {
        avisoSemClientes.classList.add('d-none');
        selectCliente.disabled = false;
    }

    if (listaProfissionaisAgendamento.length === 0) {
        avisoSemProfissionais.classList.remove('d-none');
        selectProfissional.disabled = true;
    } else {
        avisoSemProfissionais.classList.add('d-none');
        selectProfissional.disabled = false;
    }

    if (listaServicosAgendamento.length === 0) {
        avisoSemServicos.classList.remove('d-none');
        selectServico.disabled = true;
    } else {
        avisoSemServicos.classList.add('d-none');
        selectServico.disabled = false;
    }
}

/** Se estiver editando um agendamento, devolve o idAgendamento dele (pra não conflitar consigo mesmo). */
function obterIdAgendamentoEmEdicao() {
    const idEditando = document.getElementById('agendamentoIdEditando').value;

    if (idEditando === '') {
        return null;
    }

    const agendamentoExistente = listaAgendamentosCompleta.find(function (a) {
        return a.id === idEditando;
    });

    if (!agendamentoExistente) {
        return null;
    }

    return agendamentoExistente.idAgendamento;
}

/** Lê a data já escolhida no campo de data/hora do formulário, ou usa hoje como padrão. */
function obterDataBaseDoFormulario() {
    const campoDataHora = document.getElementById('campoDataHoraAgendamento');

    if (campoDataHora.value) {
        return campoDataHora.value.slice(0, 10);
    }

    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return ano + '-' + mes + '-' + dia;
}

/**
 * Monta a grade de horários (09:00–18:00, de 30 em 30min) de uma data,
 * marcando cada horário como disponível ou não para o profissional/serviço.
 * Cada agendamento já existente ocupa o profissional do início dele até
 * início + duração do serviço + 15min de buffer (mesma regra do verificaConflito).
 */
function calcularHorariosDoDia(idProfissional, idServico, dataBase) {
    const servico = buscarServicoPorId(idServico);

    if (!servico) {
        return [];
    }

    const idAgendamentoExcluir = obterIdAgendamentoEmEdicao();

    const agendamentosDoDia = listaAgendamentosCompleta.filter(function (agendamento) {
        const mesmoProfissional = agendamento.idProfissional === idProfissional;
        const mesmoDia = agendamento.dataHora.slice(0, 10) === dataBase;
        const estaAtivo = agendamento.status === 'agendado' || agendamento.status === 'realizado';
        const naoEhOAgendamentoEmEdicao = agendamento.idAgendamento !== idAgendamentoExcluir;

        return mesmoProfissional && mesmoDia && estaAtivo && naoEhOAgendamentoEmEdicao;
    });

    const intervalosOcupados = agendamentosDoDia.map(function (agendamento) {
        const servicoDoAgendamento = buscarServicoPorId(agendamento.idServico);

        let duracaoOcupada = 0;
        if (servicoDoAgendamento) {
            duracaoOcupada = servicoDoAgendamento.duracao;
        }

        const inicio = new Date(agendamento.dataHora);
        const fim = new Date(inicio.getTime() + (duracaoOcupada + BUFFER_MINUTOS_AGENDA) * 60000);
        return { inicio: inicio, fim: fim };
    });

    const horaFechamento = new Date(dataBase + 'T' + String(HORARIO_FECHAMENTO).padStart(2, '0') + ':00:00');
    const agora = new Date();
    const horarios = [];

    for (let hora = HORARIO_ABERTURA; hora < HORARIO_FECHAMENTO; hora++) {
        for (let minuto = 0; minuto < 60; minuto += INTERVALO_GRADE_MINUTOS) {
            const horarioTexto = String(hora).padStart(2, '0') + ':' + String(minuto).padStart(2, '0');
            const inicioSlot = new Date(dataBase + 'T' + horarioTexto + ':00');
            const fimSlot = new Date(inicioSlot.getTime() + (servico.duracao + BUFFER_MINUTOS_AGENDA) * 60000);

            if (fimSlot > horaFechamento) {
                continue;
            }

            if (inicioSlot < agora) {
                continue;
            }

            const temConflito = intervalosOcupados.some(function (intervalo) {
                return inicioSlot < intervalo.fim && fimSlot > intervalo.inicio;
            });

            horarios.push({ horario: horarioTexto, disponivel: temConflito === false });
        }
    }

    return horarios;
}

/** Redesenha a grade de horários com base no profissional/serviço/data escolhidos no formulário. */
function renderizarGradeHorariosDisponiveis() {
    const grade = document.getElementById('gradeHorariosDisponiveis');
    const mensagem = document.getElementById('mensagemHorariosDisponiveis');
    const idProfissional = document.getElementById('campoProfissionalAgendamento').value;
    const idServico = document.getElementById('campoServicoAgendamento').value;

    grade.innerHTML = '';

    if (idProfissional === '') {
        mensagem.textContent = 'Selecione um profissional para ver os horários disponíveis.';
        mensagem.style.display = 'block';
        return;
    }

    if (idServico === '') {
        mensagem.textContent = 'Selecione um serviço para ver os horários disponíveis.';
        mensagem.style.display = 'block';
        return;
    }

    const dataBase = obterDataBaseDoFormulario();
    const horarios = calcularHorariosDoDia(Number(idProfissional), Number(idServico), dataBase);

    if (horarios.length === 0) {
        mensagem.textContent = 'Nenhum horário disponível para este profissional nesta data.';
        mensagem.style.display = 'block';
        return;
    }

    mensagem.style.display = 'none';

    const valorAtualDoCampo = document.getElementById('campoDataHoraAgendamento').value;

    horarios.forEach(function (item) {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'botao-horario';
        botao.textContent = item.horario;

        const valorCompleto = dataBase + 'T' + item.horario;

        if (item.disponivel === false) {
            botao.disabled = true;
            botao.classList.add('botao-horario--indisponivel');
        } else {
            if (valorAtualDoCampo === valorCompleto) {
                botao.classList.add('selecionado');
            }

            botao.addEventListener('click', function () {
                document.querySelectorAll('#gradeHorariosDisponiveis .botao-horario').forEach(function (b) {
                    b.classList.remove('selecionado');
                });
                botao.classList.add('selecionado');

                const campoDataHora = document.getElementById('campoDataHoraAgendamento');
                campoDataHora.value = valorCompleto;
                limparErroCampo(campoDataHora);
            });
        }

        grade.appendChild(botao);
    });
}

function mostrarFormularioAgendamento(agendamentoParaEditar) {
    const formulario = document.getElementById('formularioAgendamento');
    formulario.reset();

    limparErroCampo(document.getElementById('campoClienteAgendamento'));
    limparErroCampo(document.getElementById('campoProfissionalAgendamento'));
    limparErroCampo(document.getElementById('campoServicoAgendamento'));
    limparErroCampo(document.getElementById('campoDataHoraAgendamento'));

    preencherSelectsFormularioAgendamento();

    const campoDataHora = document.getElementById('campoDataHoraAgendamento');
    campoDataHora.min = converterIsoParaDatetimeLocal(new Date().toISOString());

    if (agendamentoParaEditar) {
        document.getElementById('tituloFormularioAgendamento').textContent = 'Editar agendamento';
        document.getElementById('agendamentoIdEditando').value = agendamentoParaEditar.id;
        document.getElementById('campoClienteAgendamento').value = agendamentoParaEditar.idCliente;
        document.getElementById('campoProfissionalAgendamento').value = agendamentoParaEditar.idProfissional;
        document.getElementById('campoServicoAgendamento').value = agendamentoParaEditar.idServico;
        campoDataHora.value = converterIsoParaDatetimeLocal(agendamentoParaEditar.dataHora);
    } else {
        document.getElementById('tituloFormularioAgendamento').textContent = 'Novo agendamento';
        document.getElementById('agendamentoIdEditando').value = '';
    }

    renderizarGradeHorariosDisponiveis();

    document.getElementById('secaoListagemAgendamentos').classList.add('d-none');
    document.getElementById('secaoFormularioAgendamento').classList.remove('d-none');
    animarRevelacaoConteudo(document.getElementById('secaoFormularioAgendamento'));
}

function mostrarListagemAgendamentos() {
    document.getElementById('secaoFormularioAgendamento').classList.add('d-none');
    document.getElementById('secaoListagemAgendamentos').classList.remove('d-none');
}

/** Valida os campos obrigatórios do formulário. */
function validarFormularioAgendamento() {
    let formularioValido = true;

    const campoCliente = document.getElementById('campoClienteAgendamento');
    const campoProfissional = document.getElementById('campoProfissionalAgendamento');
    const campoServico = document.getElementById('campoServicoAgendamento');
    const campoDataHora = document.getElementById('campoDataHoraAgendamento');

    limparErroCampo(campoCliente);
    limparErroCampo(campoProfissional);
    limparErroCampo(campoServico);
    limparErroCampo(campoDataHora);

    if (campoPreenchido(campoCliente.value) === false) {
        exibirErroCampo(campoCliente, 'Cliente é obrigatório');
        formularioValido = false;
    }

    if (campoPreenchido(campoProfissional.value) === false) {
        exibirErroCampo(campoProfissional, 'Profissional é obrigatório');
        formularioValido = false;
    }

    if (campoPreenchido(campoServico.value) === false) {
        exibirErroCampo(campoServico, 'Serviço é obrigatório');
        formularioValido = false;
    }

    if (campoPreenchido(campoDataHora.value) === false) {
        exibirErroCampo(campoDataHora, 'Data e hora são obrigatórias');
        formularioValido = false;
    }

    return formularioValido;
}

/**
 * Lê o formulário, verifica conflito de horário (via api.js) e só então
 * salva. Em caso de conflito, mostra o modal de erro com o horário ocupado.
 */
async function salvarAgendamento(evento) {
    evento.preventDefault();

    if (validarFormularioAgendamento() === false) {
        return;
    }

    const idEditando = document.getElementById('agendamentoIdEditando').value;
    const idCliente = Number(document.getElementById('campoClienteAgendamento').value);
    const idProfissional = Number(document.getElementById('campoProfissionalAgendamento').value);
    const idServico = Number(document.getElementById('campoServicoAgendamento').value);
    const dataHoraInformada = document.getElementById('campoDataHoraAgendamento').value;

    const servicoEscolhido = buscarServicoPorId(idServico);

    const botaoSalvar = document.getElementById('botaoSalvarAgendamento');
    botaoSalvar.disabled = true;

    try {
        let agendamentoExistente = null;
        let idAgendamentoParaExcluirDoConflito = null;

        if (idEditando !== '') {
            agendamentoExistente = listaAgendamentosCompleta.find(function (a) {
                return a.id === idEditando;
            });
            idAgendamentoParaExcluirDoConflito = agendamentoExistente.idAgendamento;
        }

        const agendamentoConflitante = await verificaConflito(
            idProfissional,
            dataHoraInformada,
            servicoEscolhido.duracao,
            idAgendamentoParaExcluirDoConflito
        );

        if (agendamentoConflitante) {
            const profissionalConflito = buscarProfissionalPorId(idProfissional);
            const servicoConflito = buscarServicoPorId(agendamentoConflitante.idServico);

            const inicioConflito = new Date(agendamentoConflitante.dataHora);
            const fimConflito = new Date(inicioConflito.getTime() + (servicoConflito.duracao + 15) * 60000);

            const horaInicio = String(inicioConflito.getHours()).padStart(2, '0') + ':' + String(inicioConflito.getMinutes()).padStart(2, '0');
            const horaFim = String(fimConflito.getHours()).padStart(2, '0') + ':' + String(fimConflito.getMinutes()).padStart(2, '0');

            exibirErro(
                'Conflito de horário!',
                'O profissional ' + profissionalConflito.nome + ' já possui um agendamento agendado de ' + horaInicio + ' a ' + horaFim + '. Escolha outro horário ou profissional.'
            );
            return;
        }

        if (idEditando === '') {
            let maiorId = 0;
            listaAgendamentosCompleta.forEach(function (agendamento) {
                if (agendamento.idAgendamento > maiorId) {
                    maiorId = agendamento.idAgendamento;
                }
            });

            await criarAgendamento({
                idAgendamento: maiorId + 1,
                idCliente: idCliente,
                idProfissional: idProfissional,
                idServico: idServico,
                dataHora: dataHoraInformada,
                status: 'agendado'
            });
        } else {
            await editarAgendamento(idEditando, {
                idAgendamento: agendamentoExistente.idAgendamento,
                idCliente: idCliente,
                idProfissional: idProfissional,
                idServico: idServico,
                dataHora: dataHoraInformada,
                status: 'agendado'
            });
        }

        await exibirModalSucesso('Agendamento salvo com sucesso!');
        mostrarListagemAgendamentos();
        await carregarAgendamentos();
    } catch (erro) {
        console.log('Erro ao salvar agendamento:', erro);
        exibirErro('Não foi possível salvar', erro.message);
    } finally {
        botaoSalvar.disabled = false;
    }
}

/** Pede confirmação e altera o status do agendamento para "realizado". */
async function concluirAgendamento(agendamento) {
    const confirmado = await confirmarAcao(
        'Concluir agendamento?',
        'O status será alterado para "realizado".',
        'Concluir'
    );

    if (confirmado === false) {
        return;
    }

    try {
        await alterarStatusAgendamento(agendamento.id, 'realizado');
        exibirToastSucesso('Agendamento concluído!');
        await carregarAgendamentos();
    } catch (erro) {
        console.log('Erro ao concluir agendamento:', erro);
        exibirErro('Não foi possível concluir', erro.message);
    }
}

/** Pede confirmação e altera o status do agendamento para "cancelado". */
async function cancelarAgendamento(agendamento) {
    const confirmado = await confirmarAcao(
        'Cancelar agendamento?',
        'O status será alterado para "cancelado".',
        'Cancelar agendamento'
    );

    if (confirmado === false) {
        return;
    }

    try {
        await alterarStatusAgendamento(agendamento.id, 'cancelado');
        exibirToastSucesso('Agendamento cancelado!');
        await carregarAgendamentos();
    } catch (erro) {
        console.log('Erro ao cancelar agendamento:', erro);
        exibirErro('Não foi possível cancelar', erro.message);
    }
}

// --- Eventos -----------------------------------------------------------------

document.getElementById('corpoTabelaAgendamentos').addEventListener('click', function (evento) {
    const botaoEditar = evento.target.closest('.botao-icone--editar');
    const botaoConcluir = evento.target.closest('.botao-icone--sucesso');
    const botaoCancelar = evento.target.closest('.botao-icone--perigo');

    if (botaoEditar) {
        const idRegistro = botaoEditar.dataset.id;
        const agendamento = listaAgendamentosCompleta.find(function (a) { return a.id === idRegistro; });
        mostrarFormularioAgendamento(agendamento);
    } else if (botaoConcluir) {
        const idRegistro = botaoConcluir.dataset.id;
        const agendamento = listaAgendamentosCompleta.find(function (a) { return a.id === idRegistro; });
        concluirAgendamento(agendamento);
    } else if (botaoCancelar) {
        const idRegistro = botaoCancelar.dataset.id;
        const agendamento = listaAgendamentosCompleta.find(function (a) { return a.id === idRegistro; });
        cancelarAgendamento(agendamento);
    }
});

document.getElementById('campoBuscaAgendamento').addEventListener('input', function () {
    paginaAtualAgendamentos = 1;
    renderizarTabelaAgendamentos();
});

document.getElementById('filtroStatusAgendamentoLista').addEventListener('change', function () {
    paginaAtualAgendamentos = 1;
    renderizarTabelaAgendamentos();
});

document.getElementById('botaoNovoAgendamento').addEventListener('click', function () {
    mostrarFormularioAgendamento(null);
});

document.getElementById('botaoVoltarListagemAgendamento').addEventListener('click', mostrarListagemAgendamentos);
document.getElementById('botaoCancelarFormularioAgendamento').addEventListener('click', mostrarListagemAgendamentos);
document.getElementById('formularioAgendamento').addEventListener('submit', salvarAgendamento);
document.getElementById('botaoRecarregarAgendamentos').addEventListener('click', carregarAgendamentos);

document.getElementById('campoProfissionalAgendamento').addEventListener('change', renderizarGradeHorariosDisponiveis);
document.getElementById('campoServicoAgendamento').addEventListener('change', renderizarGradeHorariosDisponiveis);
document.getElementById('campoDataHoraAgendamento').addEventListener('change', renderizarGradeHorariosDisponiveis);

carregarAgendamentos();
