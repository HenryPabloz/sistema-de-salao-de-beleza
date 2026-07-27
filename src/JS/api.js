// ============================================================================
// API.JS — camada de comunicação HTTP com o json-server (http://localhost:3000)
//
// Observação técnica: o json-server sempre roteia /clientes/:id, /profissionais/:id
// etc. usando o campo "id" de cada registro (não "idCliente"/"idProfissional"...).
// Por isso o mock em JSONs/dbSalao.json já vem com um campo "id" legível
// (ex.: "cliente-1") além dos campos de negócio pedidos no enunciado
// (idCliente, idProfissional...). As funções abaixo recebem esse "id" nas
// operações de editar/excluir/alterar status.
// ============================================================================

const URL_BASE_API = 'http://localhost:3000';

/** Wrapper genérico de fetch com tratamento de erro e log do status. */
async function requisitar(caminho, opcoes) {
    let resposta;

    try {
        resposta = await fetch(URL_BASE_API + caminho, opcoes);
    } catch (erroDeRede) {
        console.log('Falha de rede em ' + caminho + ':', erroDeRede);
        throw new Error('Falha ao conectar com o servidor. Tente novamente mais tarde.');
    }

    console.log('Requisição ' + (opcoes && opcoes.method ? opcoes.method : 'GET') + ' ' + caminho + ' -> status ' + resposta.status);

    if (resposta.ok === false) {
        throw new Error('Erro ao processar a solicitação. Código: ' + resposta.status);
    }

    if (resposta.status === 204) {
        return null;
    }

    return await resposta.json();
}

// --- Clientes ----------------------------------------------------------------
async function listarClientes() {
    return await requisitar('/clientes', { method: 'GET' });
}

async function criarCliente(cliente) {
    return await requisitar('/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente)
    });
}

async function editarCliente(idRegistro, cliente) {
    return await requisitar('/clientes/' + idRegistro, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente)
    });
}

async function alternarStatusCliente(idRegistro, novoStatusAtivo) {
    return await requisitar('/clientes/' + idRegistro, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: novoStatusAtivo })
    });
}

// --- Profissionais -------------------------------------------------------------
async function listarProfissionais() {
    return await requisitar('/profissionais', { method: 'GET' });
}

async function criarProfissional(profissional) {
    return await requisitar('/profissionais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profissional)
    });
}

async function editarProfissional(idRegistro, profissional) {
    return await requisitar('/profissionais/' + idRegistro, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profissional)
    });
}

async function excluirProfissional(idRegistro) {
    return await requisitar('/profissionais/' + idRegistro, { method: 'DELETE' });
}

// --- Serviços --------------------------------------------------------------------
async function listarServicos() {
    return await requisitar('/servicos', { method: 'GET' });
}

async function criarServico(servico) {
    return await requisitar('/servicos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(servico)
    });
}

async function editarServico(idRegistro, servico) {
    return await requisitar('/servicos/' + idRegistro, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(servico)
    });
}

async function excluirServico(idRegistro) {
    return await requisitar('/servicos/' + idRegistro, { method: 'DELETE' });
}

// --- Agendamentos ------------------------------------------------------------------
async function listarAgendamentos() {
    return await requisitar('/agendamentos', { method: 'GET' });
}

async function criarAgendamento(agendamento) {
    return await requisitar('/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agendamento)
    });
}

async function editarAgendamento(idRegistro, agendamento) {
    return await requisitar('/agendamentos/' + idRegistro, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agendamento)
    });
}

async function alterarStatusAgendamento(idRegistro, novoStatus) {
    return await requisitar('/agendamentos/' + idRegistro, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
    });
}

/**
 * Verifica se existe conflito de horário para um profissional.
 * Regra: cada agendamento ocupa o profissional de dataHora até
 * dataHora + duracao (do serviço) + 15 minutos de buffer.
 * @param {number} profissionalId - idProfissional (campo de negócio)
 * @param {string} dataHora - ISO string do novo agendamento
 * @param {number} duracao - duração do serviço em minutos
 * @param {number|null} agendamentoIdExcluir - idAgendamento a ignorar (uso na edição)
 * @returns {Promise<object|null>} o agendamento conflitante, ou null se não houver conflito
 */
async function verificaConflito(profissionalId, dataHora, duracao, agendamentoIdExcluir) {
    const BUFFER_MINUTOS = 15;

    const agendamentos = await listarAgendamentos();
    const servicos = await listarServicos();

    const novoInicio = new Date(dataHora).getTime();
    const novoFim = novoInicio + (duracao + BUFFER_MINUTOS) * 60000;

    for (let i = 0; i < agendamentos.length; i++) {
        const agendamentoExistente = agendamentos[i];

        const eDoMesmoProfissional = agendamentoExistente.idProfissional === profissionalId;
        const naoEhOMesmoAgendamento = agendamentoExistente.idAgendamento !== agendamentoIdExcluir;
        const estaAtivo = agendamentoExistente.status === 'agendado' || agendamentoExistente.status === 'realizado';

        if (eDoMesmoProfissional && naoEhOMesmoAgendamento && estaAtivo) {
            const servicoExistente = servicos.find(function (servico) {
                return servico.idServico === agendamentoExistente.idServico;
            });

            if (servicoExistente) {
                const inicioExistente = new Date(agendamentoExistente.dataHora).getTime();
                const fimExistente = inicioExistente + (servicoExistente.duracao + BUFFER_MINUTOS) * 60000;

                const temSobreposicao = novoInicio < fimExistente && novoFim > inicioExistente;

                if (temSobreposicao) {
                    return agendamentoExistente;
                }
            }
        }
    }

    return null;
}
