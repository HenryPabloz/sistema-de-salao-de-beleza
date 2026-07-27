// ============================================================================
// UTILS.JS — funções utilitárias reaproveitadas por todas as páginas:
// máscaras, formatação, validação genérica e helpers de feedback visual.
// ============================================================================

/** Aplica a máscara 000.000.000-00 enquanto o usuário digita o CPF. */
function formataCPF(valor) {
    const numeros = valor.replace(/\D/g, '').slice(0, 11);
    let cpfFormatado = '';

    for (let i = 0; i < numeros.length; i++) {
        if (i === 3 || i === 6) {
            cpfFormatado += '.';
        }
        if (i === 9) {
            cpfFormatado += '-';
        }
        cpfFormatado += numeros[i];
    }

    return cpfFormatado;
}

/** Aplica a máscara dinâmica de telefone: (99) 9999-9999 ou (99) 99999-9999. */
function formataTelefone(valor) {
    const numeros = valor.replace(/\D/g, '').slice(0, 11);
    const ehCelular = numeros.length > 10;
    let telefoneFormatado = '';

    for (let i = 0; i < numeros.length; i++) {
        if (i === 0) {
            telefoneFormatado += '(';
        } else if (i === 2) {
            telefoneFormatado += ') ';
        } else if (ehCelular && i === 7) {
            telefoneFormatado += '-';
        } else if (ehCelular === false && i === 6) {
            telefoneFormatado += '-';
        }

        telefoneFormatado += numeros[i];
    }

    return telefoneFormatado;
}

/** Verifica apenas se o CPF tem 11 dígitos (sem validar dígito verificador). */
function validaCPFEstrutural(cpf) {
    const numeros = cpf.replace(/\D/g, '');
    return numeros.length === 11;
}

/** Formata um número como preço brasileiro, ex.: 259.9 -> "R$ 259,90". */
function formataPrecoBRL(valor) {
    const numero = Number(valor);
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Formata um preço para preencher um campo de formulário, ex.: 259.9 -> "259,90". */
function formataPrecoParaInput(valor) {
    return Number(valor).toFixed(2).replace('.', ',');
}

/** Converte um texto com vírgula decimal ("89,90") em número (89.9). */
function converterTextoParaNumero(texto) {
    const textoComPonto = texto.replace(',', '.');
    return Number(textoComPonto);
}

/** Retorna true se o texto tiver no máximo 2 casas decimais. */
function temNoMaximoDuasCasasDecimais(texto) {
    const partes = texto.replace(',', '.').split('.');

    if (partes.length === 1) {
        return true;
    }

    return partes[1].length <= 2;
}

/** Converte uma data ISO em "dd/mm/aaaa hh:mm", ex.: dashboard e agendamentos. */
function formataDataHora(data) {
    const dataObjeto = new Date(data);

    const dia = String(dataObjeto.getDate()).padStart(2, '0');
    const mes = String(dataObjeto.getMonth() + 1).padStart(2, '0');
    const ano = dataObjeto.getFullYear();
    const hora = String(dataObjeto.getHours()).padStart(2, '0');
    const minuto = String(dataObjeto.getMinutes()).padStart(2, '0');

    return dia + '/' + mes + '/' + ano + ' ' + hora + ':' + minuto;
}

/** Converte uma data ISO no formato aceito pelo input datetime-local. */
function converterIsoParaDatetimeLocal(dataIso) {
    const data = new Date(dataIso);

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');

    return ano + '-' + mes + '-' + dia + 'T' + hora + ':' + minuto;
}

/** Deixa a primeira letra maiúscula, ex.: "cabeleireiro" -> "Cabeleireiro". */
function capitalizarPrimeiraLetra(texto) {
    if (!texto) {
        return '';
    }

    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Retorna true se o valor não estiver vazio (depois de remover espaços). */
function campoPreenchido(valor) {
    if (valor === null || valor === undefined) {
        return false;
    }

    return valor.toString().trim().length > 0;
}

/** Retorna true se o texto contiver algum dígito numérico. */
function contemNumero(texto) {
    return /\d/.test(texto);
}

// ----------------------------------------------------------------------------
// Helpers de validação visual de formulário (borda vermelha + mensagem)
// ----------------------------------------------------------------------------

/** Marca o campo com borda vermelha e escreve a mensagem de erro abaixo dele. */
function exibirErroCampo(elementoInput, mensagem) {
    const grupo = elementoInput.closest('.form-group');
    grupo.classList.add('tem-erro');
    elementoInput.classList.add('campo-invalido');

    const spanErro = grupo.querySelector('.mensagem-erro');
    if (spanErro) {
        spanErro.textContent = mensagem;
    }
}

/** Remove a borda vermelha e a mensagem de erro do campo. */
function limparErroCampo(elementoInput) {
    const grupo = elementoInput.closest('.form-group');
    grupo.classList.remove('tem-erro');
    elementoInput.classList.remove('campo-invalido');
}

// ----------------------------------------------------------------------------
// Helpers de feedback com SweetAlert2 (cores do Design System)
// ----------------------------------------------------------------------------

const CORES_SWEETALERT = {
    background: '#2D2E33',
    color: '#F5F6FA',
    confirmButtonColor: '#F39200',
    cancelButtonColor: '#484952'
};

/** Toast rápido de sucesso, no canto superior direito. */
function exibirToastSucesso(mensagem) {
    Swal.fire({
        icon: 'success',
        title: mensagem,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
        background: CORES_SWEETALERT.background,
        color: CORES_SWEETALERT.color
    });
}

/** Modal de sucesso maior, usado após cadastro/edição (com botão OK). */
function exibirModalSucesso(mensagem) {
    return Swal.fire({
        icon: 'success',
        title: mensagem,
        confirmButtonColor: CORES_SWEETALERT.confirmButtonColor,
        background: CORES_SWEETALERT.background,
        color: CORES_SWEETALERT.color
    });
}

/** Modal de erro amigável. */
function exibirErro(titulo, mensagem) {
    Swal.fire({
        icon: 'error',
        title: titulo,
        text: mensagem,
        confirmButtonColor: CORES_SWEETALERT.confirmButtonColor,
        background: CORES_SWEETALERT.background,
        color: CORES_SWEETALERT.color
    });
}

/** Modal de confirmação. Retorna true se o usuário confirmou a ação. */
async function confirmarAcao(titulo, texto, textoBotaoConfirmar) {
    const resultado = await Swal.fire({
        icon: 'question',
        title: titulo,
        text: texto,
        showCancelButton: true,
        confirmButtonText: textoBotaoConfirmar,
        cancelButtonText: 'Cancelar',
        confirmButtonColor: CORES_SWEETALERT.confirmButtonColor,
        cancelButtonColor: CORES_SWEETALERT.cancelButtonColor,
        background: CORES_SWEETALERT.background,
        color: CORES_SWEETALERT.color
    });

    return resultado.isConfirmed;
}

// ----------------------------------------------------------------------------
// Ícones SVG reutilizados nas linhas de tabela geradas via JS
// (mesmo estilo visual dos ícones já usados no HTML estático)
// ----------------------------------------------------------------------------

const ICONE_SVG_EDITAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1-4.2L15.5 5.3a1.5 1.5 0 0 1 2.1 0l1.1 1.1a1.5 1.5 0 0 1 0 2.1L8.2 19 4 20z"/><path d="M14 6.8l3.2 3.2"/></svg>';

const ICONE_SVG_PODER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v8"/><path d="M6.5 6.5a8 8 0 1 0 11 0"/></svg>';

const ICONE_SVG_LIXEIRA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7M6 7l1 13.5A1.5 1.5 0 0 0 8.5 22h7a1.5 1.5 0 0 0 1.5-1.5L18 7"/><path d="M10 11v6M14 11v6"/></svg>';

const ICONE_SVG_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.3 2.3 4.7-4.8"/></svg>';

const ICONE_SVG_CANCELAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/></svg>';
