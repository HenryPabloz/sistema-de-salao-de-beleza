// ============================================================================
// DASHBOARD.JS — indicadores, rankings e filtros da página inicial.
// ============================================================================

let clientesDashboard = [];
let profissionaisDashboard = [];
let servicosDashboard = [];
let agendamentosDashboard = [];

/** Busca clientes, profissionais, serviços e agendamentos. */
async function carregarDadosDashboard() {
    const estadoCarregando = document.getElementById('estadoCarregandoDashboard');
    const estadoErro = document.getElementById('estadoErroDashboard');
    const conteudo = document.getElementById('conteudoDashboard');

    estadoCarregando.classList.add('ativo');
    estadoErro.classList.remove('ativo');
    conteudo.classList.add('d-none');

    try {
        clientesDashboard = await listarClientes();
        profissionaisDashboard = await listarProfissionais();
        servicosDashboard = await listarServicos();
        agendamentosDashboard = await listarAgendamentos();

        estadoCarregando.classList.remove('ativo');
        conteudo.classList.remove('d-none');
        animarRevelacaoLista(document.querySelectorAll('#conteudoDashboard .anima-entrada'));

        aplicarFiltrosDashboard();
    } catch (erro) {
        console.log('Erro ao carregar dashboard:', erro);
        estadoCarregando.classList.remove('ativo');
        estadoErro.classList.add('ativo');
    }
}

/** Calcula e escreve os 4 cards de indicadores. */
function atualizarCardsIndicadores(agendamentos) {
    let totalAgendados = 0;
    let totalRealizados = 0;
    let totalCancelados = 0;
    let faturamentoTotal = 0;

    agendamentos.forEach(function (agendamento) {
        if (agendamento.status === 'agendado') {
            totalAgendados++;
        } else if (agendamento.status === 'realizado') {
            totalRealizados++;

            const servico = servicosDashboard.find(function (s) {
                return s.idServico === agendamento.idServico;
            });

            if (servico) {
                faturamentoTotal += servico.preco;
            }
        } else if (agendamento.status === 'cancelado') {
            totalCancelados++;
        }
    });

    animarContador(document.getElementById('valorTotalAgendados'), totalAgendados);
    animarContador(document.getElementById('valorTotalRealizados'), totalRealizados);
    animarContador(document.getElementById('valorTotalCancelados'), totalCancelados);
    animarContador(document.getElementById('valorFaturamentoTotal'), faturamentoTotal, formataPrecoBRL);
}

/** Monta a tabela de faturamento por profissional (apenas agendamentos realizados). */
function atualizarFaturamentoPorProfissional(agendamentos, profissionais) {
    const corpoTabela = document.getElementById('corpoTabelaFaturamentoProfissional');
    const mensagemVazia = document.getElementById('mensagemVaziaFaturamento');
    corpoTabela.innerHTML = '';

    const linhasComFaturamento = [];

    profissionais.forEach(function (profissional) {
        let faturamentoProfissional = 0;

        agendamentos.forEach(function (agendamento) {
            const mesmoProfissional = agendamento.idProfissional === profissional.idProfissional;
            const foiRealizado = agendamento.status === 'realizado';

            if (mesmoProfissional && foiRealizado) {
                const servico = servicosDashboard.find(function (s) {
                    return s.idServico === agendamento.idServico;
                });

                if (servico) {
                    faturamentoProfissional += servico.preco;
                }
            }
        });

        if (faturamentoProfissional > 0) {
            linhasComFaturamento.push({ profissional: profissional, faturamento: faturamentoProfissional });
        }
    });

    if (linhasComFaturamento.length === 0) {
        mensagemVazia.style.display = 'block';
        return;
    }

    mensagemVazia.style.display = 'none';

    linhasComFaturamento.sort(function (a, b) {
        return b.faturamento - a.faturamento;
    });

    linhasComFaturamento.forEach(function (item) {
        const linha = document.createElement('tr');
        linha.innerHTML =
            '<td>' + item.profissional.nome + '</td>' +
            '<td>' + capitalizarPrimeiraLetra(item.profissional.especialidade) + '</td>' +
            '<td>' + formataPrecoBRL(item.faturamento) + '</td>';
        corpoTabela.appendChild(linha);
    });
}

/** Monta a tabela de serviços mais agendados (apenas realizados). */
function atualizarRankingServicos(agendamentos, servicos) {
    const corpoTabela = document.getElementById('corpoTabelaRankingServicos');
    const mensagemVazia = document.getElementById('mensagemVaziaRankingServicos');
    corpoTabela.innerHTML = '';

    const contagemPorServico = [];

    servicos.forEach(function (servico) {
        let quantidade = 0;

        agendamentos.forEach(function (agendamento) {
            const mesmoServico = agendamento.idServico === servico.idServico;
            const foiRealizado = agendamento.status === 'realizado';

            if (mesmoServico && foiRealizado) {
                quantidade++;
            }
        });

        if (quantidade > 0) {
            contagemPorServico.push({ servico: servico, quantidade: quantidade });
        }
    });

    if (contagemPorServico.length === 0) {
        mensagemVazia.style.display = 'block';
        return;
    }

    mensagemVazia.style.display = 'none';

    contagemPorServico.sort(function (a, b) {
        return b.quantidade - a.quantidade;
    });

    contagemPorServico.forEach(function (item) {
        const linha = document.createElement('tr');
        linha.innerHTML =
            '<td>' + item.servico.nome + '</td>' +
            '<td>' + item.quantidade + '</td>';
        corpoTabela.appendChild(linha);
    });
}

/** Monta a tabela de clientes mais frequentes (apenas clientes ativos, realizados). */
function atualizarClientesFrequentes(agendamentos, clientes) {
    const corpoTabela = document.getElementById('corpoTabelaClientesFrequentes');
    const mensagemVazia = document.getElementById('mensagemVaziaClientesFrequentes');
    corpoTabela.innerHTML = '';

    const clientesAtivos = clientes.filter(function (cliente) {
        return cliente.ativo === true;
    });

    const linhasComFrequencia = [];

    clientesAtivos.forEach(function (cliente) {
        let quantidade = 0;

        agendamentos.forEach(function (agendamento) {
            const mesmoCliente = agendamento.idCliente === cliente.idCliente;
            const foiRealizado = agendamento.status === 'realizado';

            if (mesmoCliente && foiRealizado) {
                quantidade++;
            }
        });

        if (quantidade > 0) {
            linhasComFrequencia.push({ cliente: cliente, quantidade: quantidade });
        }
    });

    if (linhasComFrequencia.length === 0) {
        mensagemVazia.style.display = 'block';
        return;
    }

    mensagemVazia.style.display = 'none';

    linhasComFrequencia.sort(function (a, b) {
        return b.quantidade - a.quantidade;
    });

    linhasComFrequencia.forEach(function (item) {
        const linha = document.createElement('tr');
        linha.innerHTML =
            '<td>' + item.cliente.nome + '</td>' +
            '<td>' + formataTelefone(item.cliente.telefone) + '</td>' +
            '<td>' + item.quantidade + '</td>';
        corpoTabela.appendChild(linha);
    });
}

/** Calcula a taxa de cancelamento e atualiza número + barra de progresso. */
function atualizarTaxaCancelamento(agendamentos) {
    const valorTaxa = document.getElementById('valorTaxaCancelamento');
    const barra = document.getElementById('barraTaxaCancelamento');
    const textoContagem = document.getElementById('textoContagemCancelamento');

    if (agendamentos.length === 0) {
        valorTaxa.textContent = '0%';
        barra.style.height = '0%';
        textoContagem.textContent = 'Cancelados: 0 / Total: 0';
        return;
    }

    let totalCancelados = 0;

    agendamentos.forEach(function (agendamento) {
        if (agendamento.status === 'cancelado') {
            totalCancelados++;
        }
    });

    const taxa = (totalCancelados / agendamentos.length) * 100;
    const taxaArredondada = Math.round(taxa * 10) / 10;

    valorTaxa.textContent = taxaArredondada + '%';
    barra.style.height = taxa + '%';
    textoContagem.textContent = 'Cancelados: ' + totalCancelados + ' / Total: ' + agendamentos.length;
}

/** Reaplica todos os cálculos considerando os filtros de especialidade/status ativos. */
function aplicarFiltrosDashboard() {
    const especialidadeSelecionada = document.getElementById('filtroEspecialidade').value;
    const statusSelecionado = document.getElementById('filtroStatusAgendamento').value;

    const idsProfissionaisFiltrados = [];

    profissionaisDashboard.forEach(function (profissional) {
        if (especialidadeSelecionada === '' || profissional.especialidade === especialidadeSelecionada) {
            idsProfissionaisFiltrados.push(profissional.idProfissional);
        }
    });

    const profissionaisFiltrados = profissionaisDashboard.filter(function (profissional) {
        return idsProfissionaisFiltrados.includes(profissional.idProfissional);
    });

    let agendamentosFiltrados = agendamentosDashboard.filter(function (agendamento) {
        return idsProfissionaisFiltrados.includes(agendamento.idProfissional);
    });

    if (statusSelecionado !== '') {
        agendamentosFiltrados = agendamentosFiltrados.filter(function (agendamento) {
            return agendamento.status === statusSelecionado;
        });
    }

    atualizarCardsIndicadores(agendamentosFiltrados);
    atualizarFaturamentoPorProfissional(agendamentosFiltrados, profissionaisFiltrados);
    atualizarRankingServicos(agendamentosFiltrados, servicosDashboard);
    atualizarClientesFrequentes(agendamentosFiltrados, clientesDashboard);
    atualizarTaxaCancelamento(agendamentosFiltrados);
}

document.getElementById('filtroEspecialidade').addEventListener('change', aplicarFiltrosDashboard);
document.getElementById('filtroStatusAgendamento').addEventListener('change', aplicarFiltrosDashboard);
document.getElementById('botaoRecarregarDashboard').addEventListener('click', carregarDadosDashboard);

carregarDadosDashboard();
