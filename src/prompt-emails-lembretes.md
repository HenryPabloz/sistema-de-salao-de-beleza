# Prompt: Implementar EmailJS — Lembretes de Agendamento

## Objetivo

Integrar **EmailJS** ao projeto para enviar dois tipos de email automáticos:

1. **Confirmação imediata** — ao salvar um novo agendamento.
2. **Lembrete 1h antes** — 1 hora antes do agendamento (via cron job/timer).

Ambos com o nome do profissional dinâmico e informações do agendamento.

---

## 📋 Pré-requisitos

### 1. Criar conta EmailJS (gratuita)
- Acesse: https://www.emailjs.com/
- Clique em "Sign Up" (ou "Start for free").
- Registre-se com email/Google/GitHub.
- Confirme o email.

### 2. Configurar credenciais
Na dashboard do EmailJS:

#### Passo 1: Adicionar email de origem
- Dashboard → "Email Services" → "Add Service".
- Escolha "Gmail" (ou outro provedor).
- Autorize acesso (Gmail vai pedir).
- Copie o **Service ID** (ex.: `service_abc123xyz`).

#### Passo 2: Criar template de email
- Dashboard → "Email Templates" → "Create New Template".
- **Template 1 (Confirmação)**:
  - Nome: `template_confirmacao_agendamento`
  - Assunto: `Agendamento Confirmado - {{nomeCliente}}`
  - Conteúdo:
    ```
    Olá {{nomeCliente}},

    Seu agendamento foi confirmado!

    Profissional: {{nomeProfissional}}
    Serviço: {{nomeServico}} ({{duracao}} min)
    Data/Hora: {{data}} às {{hora}}

    Se tiver dúvidas, entre em contato conosco.

    Obrigado,
    Salão Âmbar
    ```

- **Template 2 (Lembrete 1h antes)**:
  - Nome: `template_lembrete_agendamento`
  - Assunto: `Lembrete: Seu agendamento com {{nomeProfissional}} em 1 hora`
  - Conteúdo:
    ```
    Olá {{nomeCliente}},

    Seu agendamento com {{nomeProfissional}} começará em 1 hora!

    Serviço: {{nomeServico}}
    Horário: {{hora}}

    Não se esqueça!

    Salão Âmbar
    ```

#### Passo 3: Obter credenciais
- Dashboard → "Account" → aba "API".
- Copie:
  - **Public Key** (ex.: `abc123_public_key`)
  - **Service ID** (ex.: `service_abc123`)
  - **Template IDs** (dos templates criados acima)

---

## 🛠️ Implementação

### 1. Adicionar EmailJS ao HTML

Em **cada arquivo HTML** (ou melhor, num `<script>` compartilhado):

```html
<!-- Adicionar antes do </body> -->
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/index.min.js"></script>
<script>
  // Inicializar EmailJS com a Public Key
  emailjs.init('abc123_public_key'); // SUBSTITUA PELA SUA PUBLIC KEY
</script>
```

### 2. Função de envio em `JS/utils.js`

Adicione a função que envia emails:

```javascript
/**
 * Envia email de confirmação de agendamento via EmailJS
 * @param {Object} agendamento - Objeto do agendamento
 * @param {Object} cliente - Objeto do cliente
 * @param {Object} profissional - Objeto do profissional
 * @param {Object} servico - Objeto do serviço
 * @param {string} tipoEmail - 'confirmacao' ou 'lembrete'
 */
async function enviarEmailAgendamento(agendamento, cliente, profissional, servico, tipoEmail = 'confirmacao') {
  try {
    // Formatar data e hora
    const dataHora = new Date(agendamento.dataHora);
    const data = dataHora.toLocaleDateString('pt-BR');
    const hora = dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    // Determinar template e dados baseado no tipo
    let templateId, templateData;
    
    if (tipoEmail === 'confirmacao') {
      templateId = 'template_confirmacao_agendamento';
      templateData = {
        nomeCliente: cliente.nome,
        nomeProfissional: profissional.nome,
        nomeServico: servico.nome,
        duracao: servico.duracao,
        data: data,
        hora: hora,
        to_email: cliente.email, // Se o cliente tiver email cadastrado
        to_name: cliente.nome,
      };
    } else if (tipoEmail === 'lembrete') {
      templateId = 'template_lembrete_agendamento';
      templateData = {
        nomeCliente: cliente.nome,
        nomeProfissional: profissional.nome,
        nomeServico: servico.nome,
        hora: hora,
        to_email: cliente.email,
        to_name: cliente.nome,
      };
    }
    
    // Enviar via EmailJS
    const resposta = await emailjs.send(
      'service_abc123', // SUBSTITUA PELO SEU SERVICE ID
      templateId,
      templateData
    );
    
    console.log('✅ Email enviado com sucesso:', resposta);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    // Não quebrar a aplicação se email falhar
    return false;
  }
}
```

### 3. Validação de Email — Função em `JS/utils.js`

Adicione estas funções para validar emails:

```javascript
/**
 * Valida se um email tem formato válido (regex simples)
 * @param {string} email - Email a validar
 * @returns {boolean} - true se válido, false caso contrário
 */
function validarEmail(email) {
  if (!email) return false;
  
  // Regex padrão para validação básica de email
  // Aceita: usuario@dominio.com, user.name@empresa.co.br, etc
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regexEmail.test(email);
}

/**
 * Valida email e exibe erro visual se inválido
 * @param {HTMLElement} inputEmail - Input element do email
 * @returns {boolean} - true se válido, false caso contrário
 */
function validarEmailComFeedback(inputEmail) {
  const email = inputEmail.value.trim();
  
  if (!validarEmail(email)) {
    // Adicionar classe de erro visual
    inputEmail.classList.add('input-erro');
    
    // Exibir mensagem de erro
    let mensagemErro = inputEmail.nextElementSibling;
    if (!mensagemErro || !mensagemErro.classList.contains('mensagem-erro')) {
      mensagemErro = document.createElement('span');
      mensagemErro.className = 'mensagem-erro';
      inputEmail.parentNode.insertBefore(mensagemErro, inputEmail.nextSibling);
    }
    mensagemErro.textContent = 'Email inválido. Use o formato: seu@email.com';
    
    return false;
  } else {
    // Remover classe de erro
    inputEmail.classList.remove('input-erro');
    
    // Remover mensagem de erro
    const mensagemErro = inputEmail.nextElementSibling;
    if (mensagemErro && mensagemErro.classList.contains('mensagem-erro')) {
      mensagemErro.remove();
    }
    
    return true;
  }
}
```

#### Adicionar CSS para input com erro em `CSS/layout.css`

```css
/* Input com erro de validação */
.input-erro {
  border-color: var(--cor-erro) !important; /* #EF4444 */
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

/* Mensagem de erro */
.mensagem-erro {
  display: block;
  color: var(--cor-erro);
  font-family: 'Inria Sans', sans-serif;
  font-size: 12px;
  margin-top: 4px;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Integrar validação em `JS/clientes.js`

Ao salvar um cliente, validar email ANTES de prosseguir:

```javascript
async function salvarCliente(event) {
  event.preventDefault();
  
  const inputEmail = document.getElementById('email');
  
  // Validar email antes de prosseguir
  if (!validarEmailComFeedback(inputEmail)) {
    mostrarErro('Email inválido. Corrija antes de salvar.');
    return;
  }
  
  try {
    const novoCliente = {
      nome: document.getElementById('nome').value,
      cpf: document.getElementById('cpf').value,
      telefone: document.getElementById('telefone').value,
      email: inputEmail.value.trim(), // Já validado
      ativo: true,
    };
    
    // Salvar no json-server
    const resposta = await fetch('http://localhost:3000/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoCliente),
    });
    
    if (!resposta.ok) throw new Error('Erro ao salvar cliente');
    
    mostrarSucesso('Cliente cadastrado com sucesso!');
    voltarParaLista();
  } catch (error) {
    console.error('Erro:', error);
    mostrarErro('Erro ao salvar cliente. Tente novamente.');
  }
}
```

#### Event listener para validação em tempo real

Adicione validação ao sair do campo (blur event):

```javascript
// Em JS/clientes.js, após inicializar
document.addEventListener('DOMContentLoaded', () => {
  const inputEmail = document.getElementById('email');
  if (inputEmail) {
    inputEmail.addEventListener('blur', (e) => {
      validarEmailComFeedback(e.target);
    });
  }
});
```

#### Validar email antes de enviar agendamento

Em `JS/agendamentos.js`, ao salvar agendamento, validar se cliente tem email válido:

```javascript
async function salvarAgendamento(event) {
  event.preventDefault();
  
  try {
    // Buscar cliente selecionado
    const idCliente = document.getElementById('cliente-select').value;
    const cliente = await fetch(`http://localhost:3000/clientes/${idCliente}`).then(r => r.json());
    
    // Validar email do cliente
    if (!validarEmail(cliente.email)) {
      mostrarErro(`Cliente não possui email válido.\n\nEdite o cliente e corrija o email antes de agendar.`);
      return;
    }
    
    // ... resto do código para salvar agendamento
  } catch (error) {
    console.error('Erro:', error);
    mostrarErro('Erro ao salvar agendamento.');
  }
}
```

---

### 4. Adaptar modelo de dados — Adicionar email ao Cliente

**Observação importante**: o modelo atual de `Cliente` não possui um campo `email`. Você precisa:

#### Opção A: Adicionar campo email no formulário de cliente
Em `HTML/clientes.html`, adicionar input de email:

```html
<div class="form-group">
  <label for="email">Email</label>
  <input type="email" id="email" name="email" required placeholder="seu@email.com">
</div>
```

Em `JS/clientes.js`, ao salvar cliente:

```javascript
const novoCliente = {
  nome: document.getElementById('nome').value,
  cpf: document.getElementById('cpf').value,
  telefone: document.getElementById('telefone').value,
  email: document.getElementById('email').value, // NOVO CAMPO
  ativo: true,
};
```

#### Opção B: Usar telefone como fallback (não recomendado, mas possível)
Se o cliente não tiver email, poderia usar Twilio para SMS. Por enquanto, vamos exigir email.

### 5. Integrar envio de email em `JS/agendamentos.js`

Ao **salvar um novo agendamento**:

```javascript
async function salvarAgendamento(event) {
  event.preventDefault();
  
  try {
    // 1. Validar conflito de horário (já existe)
    const temConflito = await verificaConflito(...);
    if (temConflito) {
      mostrarErro('Conflito de horário!');
      return;
    }
    
    // 2. Preparar dados do agendamento
    const novoAgendamento = {
      idCliente: document.getElementById('cliente-select').value,
      idProfissional: document.getElementById('profissional-select').value,
      idServico: document.getElementById('servico-select').value,
      dataHora: document.getElementById('data-hora').value,
      status: 'agendado',
    };
    
    // 3. Salvar no json-server
    const respostaAPI = await fetch('http://localhost:3000/agendamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoAgendamento),
    });
    
    if (!respostaAPI.ok) throw new Error('Erro ao salvar agendamento');
    
    const agendamentoSalvo = await respostaAPI.json();
    
    // 4. Buscar dados completos para enviar email
    const cliente = await fetch(`http://localhost:3000/clientes/${novoAgendamento.idCliente}`).then(r => r.json());
    const profissional = await fetch(`http://localhost:3000/profissionais/${novoAgendamento.idProfissional}`).then(r => r.json());
    const servico = await fetch(`http://localhost:3000/servicos/${novoAgendamento.idServico}`).then(r => r.json());
    
    // 5. Enviar email de confirmação
    await enviarEmailAgendamento(agendamentoSalvo, cliente, profissional, servico, 'confirmacao');
    
    // 6. Agendar lembrete 1h antes
    agendarLembreteAgendamento(agendamentoSalvo, cliente, profissional, servico);
    
    // 7. Sucesso
    mostrarSucesso('Agendamento criado! Email de confirmação enviado.');
    voltarParaListagem();
    
  } catch (error) {
    console.error('Erro ao salvar agendamento:', error);
    mostrarErro('Erro ao salvar agendamento. Tente novamente.');
  }
}
```

### 6. Sistema de lembretes em `JS/agendamentos.js`

```javascript
/**
 * Armazena timer para lembretes (em memória - será perdido ao recarregar página)
 * Para produção, usar backend com cron job
 */
const timersLembretes = new Map();

/**
 * Agenda lembrete 1h antes do agendamento
 */
function agendarLembreteAgendamento(agendamento, cliente, profissional, servico) {
  try {
    const agora = new Date();
    const horarioAgendamento = new Date(agendamento.dataHora);
    const horarioLembrete = new Date(horarioAgendamento.getTime() - 60 * 60 * 1000); // 1h antes
    
    const tempoAte = horarioLembrete.getTime() - agora.getTime();
    
    // Se o lembrete é para depois (agendamento está no futuro)
    if (tempoAte > 0) {
      const timerId = setTimeout(async () => {
        console.log('⏰ Enviando lembrete para:', cliente.nome);
        await enviarEmailAgendamento(agendamento, cliente, profissional, servico, 'lembrete');
        timersLembretes.delete(agendamento.idAgendamento);
      }, tempoAte);
      
      // Armazenar timer para poder cancelar depois se necessário
      timersLembretes.set(agendamento.idAgendamento, timerId);
      
      console.log(`⏰ Lembrete agendado para ${horarioLembrete.toLocaleString()}`);
    } else {
      console.log('⏭️ Agendamento está muito próximo, lembrete não foi agendado');
    }
  } catch (error) {
    console.error('Erro ao agendar lembrete:', error);
  }
}

/**
 * Ao cancelar um agendamento, também cancelar o lembrete
 */
function cancelarAgendamento(idAgendamento) {
  // Limpar timer se existir
  if (timersLembretes.has(idAgendamento)) {
    clearTimeout(timersLembretes.get(idAgendamento));
    timersLembretes.delete(idAgendamento);
    console.log('❌ Lembrete cancelado');
  }
  
  // ... resto da lógica de cancelar agendamento
}
```

### 7. Atualizar `dbSalao.json` com campo email

Adicionar email aos clientes mock:

```json
{
  "clientes": [
    {
      "idCliente": 1,
      "nome": "Marina Souza Lima",
      "cpf": "123.456.789-00",
      "telefone": "(11) 98765-4321",
      "email": "marina@email.com",
      "ativo": true
    }
    // ... outros clientes
  ]
}
```

---

## 📖 Documentação para README.md

Adicione esta seção:

```markdown
## 📧 Lembretes por Email

O projeto integra **EmailJS** para enviar lembretes automáticos sobre agendamentos:

### Tipos de lembretes

1. **Confirmação imediata** — ao salvar um novo agendamento
   - Envia email confirmando data, hora, profissional e serviço
   
2. **Lembrete 1h antes** — 1 hora antes do agendamento agendado
   - Notifica o cliente para não esquecer

### Setup

Para ativar lembretes por email:

1. Crie uma conta gratuita em [EmailJS](https://www.emailjs.com/).
2. Obtenha sua **Public Key** e **Service ID**.
3. Crie dois templates de email (nomes: `template_confirmacao_agendamento`, `template_lembrete_agendamento`).
4. Adicione as credenciais em `JS/utils.js`:
   ```javascript
   emailjs.init('SEU_PUBLIC_KEY'); // No HTML
   // Substitua 'service_abc123' pela sua Service ID em utils.js
   ```
5. Certifique-se de que cada cliente tenha um **email** cadastrado.
6. Pronto! Emails serão enviados automaticamente.

### ⚠️ Limitações

- **Tier gratuito EmailJS**: 200 emails/mês.
- **Lembretes**: funcionam apenas enquanto a página está aberta (usar backend/cron job em produção).
- **Emails errados**: se o cliente tiver um email inválido, o EmailJS não consegue enviar (validar no formulário).

### Troubleshooting

- **"Invalid template"**: verifique que o template ID está correto.
- **"Invalid service"**: verifique que o Service ID está correto.
- **Email não enviado**: verifique no console (DevTools) o erro exato.
- **Public Key inválida**: copie novamente da dashboard do EmailJS.

```

---

## 🔐 Segurança

⚠️ **Aviso**: sua **Public Key** ficará visível no código JavaScript. Isso é esperado com EmailJS (é pública mesmo). A **Service ID** também fica visível, mas é necessária para enviar emails.

Para produção com sensibilidade maior:
- Use um backend (Node.js/Express) que mantém a chave privada segura.
- Integre com SendGrid, Brevo ou Mailgun (requerem backend).

---

## 📝 Checklist

- ✅ Criar conta EmailJS e obter credenciais.
- ✅ Criar 2 templates de email (confirmação + lembrete).
- ✅ Adicionar script EmailJS no HTML (em CADA página HTML, ou num arquivo compartilhado).
- ✅ Função `enviarEmailAgendamento()` em `utils.js`.
- ✅ **Funções de validação de email** em `utils.js` (`validarEmail()` + `validarEmailComFeedback()`).
- ✅ **CSS de erro de validação** em `CSS/layout.css` (`.input-erro`, `.mensagem-erro`, `@keyframes slideDown`).
- ✅ Integrar validação de email em `JS/clientes.js` ao salvar cliente.
- ✅ Integrar validação de email em `JS/agendamentos.js` ao salvar agendamento.
- ✅ Event listener para validação em tempo real (blur event) em `JS/clientes.js`.
- ✅ Integrar envio de email ao salvar agendamento (agendamentos.js).
- ✅ Sistema de lembretes com `setTimeout` (agendamentos.js).
- ✅ Adicionar campo `email` ao modelo de Cliente (HTML + JS).
- ✅ Atualizar `dbSalao.json` com emails dos clientes.
- ✅ Adicionar form input de email em `HTML/clientes.html`.
- ✅ Atualizar `JS/clientes.js` para salvar email.
- ✅ Testar confirmação imediata (salvar agendamento, checar email).
- ✅ Testar lembrete 1h antes (criar agendamento com horário ~1h adiante).
- ✅ Testar validação de email (tentar salvar cliente com email inválido → deve mostrar erro).
- ✅ **🔴 ATUALIZAR README.md com a seção "📧 Lembretes por Email"** (ver seção "Documentação para README.md" acima).
- ✅ Documentar credenciais (template IDs, Service ID) em comentário no código.

---

## 🔴 IMPORTANTE: Atualizar README.md

**Antes de terminar, VOCÊ DEVE atualizar o arquivo `README.md` do projeto adicionando a seção abaixo:**

Localize a seção `## 🔐 Segurança` (ou adicione após `## 🌐 Tema claro/escuro`) e **insira a seguinte seção**:

```markdown
## 📧 Lembretes por Email (EmailJS)

O projeto integra **EmailJS** para enviar lembretes automáticos sobre agendamentos:

### ✉️ Tipos de lembretes

1. **Confirmação imediata** — ao salvar um novo agendamento
   - Email confirmando data, hora, profissional e serviço
   
2. **Lembrete 1h antes** — 1 hora antes do agendamento
   - Notificação lembrando o cliente do compromisso

### 🚀 Como configurar

Para ativar lembretes por email, siga estos passos:

1. **Crie uma conta gratuita** em [EmailJS](https://www.emailjs.com/).
2. **Obtenha suas credenciais** na dashboard do EmailJS:
   - **Public Key** (em Account → API)
   - **Service ID** (em Email Services)
3. **Crie dois templates de email** (Email Templates → Create New Template):
   - Nome: `template_confirmacao_agendamento` — Assunto: `Agendamento Confirmado - {{nomeCliente}}`
   - Nome: `template_lembrete_agendamento` — Assunto: `Lembrete: Seu agendamento com {{nomeProfissional}} em 1 hora`
4. **Atualize as credenciais** no código:
   - Em qualquer arquivo `.html` do projeto, procure por `emailjs.init('abc123_public_key')` e substitua pela sua **Public Key**.
   - Em `JS/utils.js`, procure por `emailjs.send('service_abc123', ...)` e substitua `service_abc123` pela sua **Service ID**.
5. **Certifique-se de que cada cliente tem um email cadastrado** (campo adicionado no formulário de clientes).
6. **Pronto!** Emails serão enviados automaticamente.

### ⚙️ Como funciona

- Ao **criar um novo agendamento**: email de confirmação é enviado imediatamente.
- **1 hora antes** do agendamento: email de lembrete é enviado automaticamente (enquanto a página estiver aberta).

### ⚠️ Limitações

- **Tier gratuito EmailJS**: 200 emails/mês (mais que suficiente para testes).
- **Lembretes**: funcionam apenas enquanto a página estiver aberta no navegador.
  - Para produção, implementar backend com cron job ou usar serviço de agendamento (Brevo, SendGrid, etc.).
- **Email inválido**: o sistema valida emails com regex simples (formato básico). Para validação mais rigorosa (confirmar que o email existe), seria necessário usar API externa.
  - ✅ Validação implementada: cliente não pode salvar com email em formato inválido.
  - ✅ Validação também ocorre ao criar agendamento: sistema verifica se o cliente possui email válido antes de permitir.

### 🧪 Testando

#### Teste 1: Validação de Email (Clientes)
1. Navegue até a página de **Clientes**.
2. Clique em "Novo Cliente".
3. Preencha nome, CPF, telefone.
4. **Teste inválido**: Digite um email inválido (ex.: `teste@`, `usuario`, `@dominio.com`).
5. Saia do campo de email (blur) ou tente salvar.
6. **Esperado**: Campo fica com borda vermelha e mensagem "Email inválido. Use o formato: seu@email.com".
7. **Teste válido**: Corrija para um email válido (ex.: `usuario@email.com`).
8. **Esperado**: Borda e mensagem de erro desaparecem, cliente pode ser salvo.

#### Teste 2: Validação de Email (Agendamentos)
1. Navegue até a página de **Agendamentos**.
2. Crie um agendamento, selecionando um cliente que tenha email inválido.
3. Clique em "Salvar".
4. **Esperado**: Sistema bloqueia com mensagem "Cliente não possui email válido. Edite o cliente e corrija o email antes de agendar."
5. Volte, edite o cliente, corrija o email.
6. Tente criar o agendamento novamente.
7. **Esperado**: Email de confirmação é enviado com sucesso.

#### Teste 3: Email de Confirmação
1. Crie um novo agendamento com um cliente que possua um **email válido**.
2. Clique em "Salvar" e confira a **inbox do email do cliente**.
3. **Esperado**: Você deve receber o email de confirmação em poucos segundos.

#### Teste 4: Lembrete 1h antes
1. Crie um agendamento que comece em ~1 hora (ex.: daqui 65 minutos).
2. Deixe a página aberta.
3. **Esperado**: 1 hora depois, o cliente recebe email de lembrete automaticamente.

### 🐛 Troubleshooting

| Problema | Solução |
|---|---|
| "Invalid template" | Verifique que os nomes dos templates estão corretos: `template_confirmacao_agendamento` e `template_lembrete_agendamento`. |
| "Invalid service" | Verifique que o **Service ID** está correto em `JS/utils.js`. |
| Email não chega | Verifique o **console do navegador** (DevTools → Console) para erros. Pode estar com Public Key inválida. |
| Public Key inválida | Copie novamente da dashboard EmailJS (Account → API). |
| Email não envia (silenciosamente) | Pode ser um email inválido do cliente. Valide emails no formulário de cadastro. |

---
```

**Cole essa seção no README.md após revisar se ele já tem uma estrutura similar. Se já houver lembretes documentados, apenas complementar.**

---

## ✅ Final: Confirmar com o usuário

Após terminar a implementação, copie e cole este texto no chat comigo:

```
✅ Implementação de EmailJS concluída!

Credenciais adicionadas:
- Public Key: [AQUI]
- Service ID: [AQUI]
- Template Confirmação: template_confirmacao_agendamento
- Template Lembrete: template_lembrete_agendamento

README.md atualizado com seção "📧 Lembretes por Email".

Agora posso testar os emails? (Qual email devo usar?)
```

Isso garante que nada foi esquecido!

---

## 🧪 Teste rápido

1. Acesse a página de Agendamentos.
2. Cadastre um novo agendamento (com um cliente que tenha email válido).
3. Clique "Salvar".
4. Verifique a inbox do email do cliente — você deve receber o email de confirmação em segundos.
5. Teste o lembrete 1h antes criando um agendamento que comece em ~1h.
6. Aguarde (ou ajuste o código para 1 minuto antes para testar mais rápido).

---

## Estrutura final

```
src/
├── HTML/
│   ├── agendamentos.html       # NOVO: campo de email no cliente
│   └── clientes.html            # NOVO: campo de email
├── JS/
│   ├── utils.js                 # NOVO: enviarEmailAgendamento()
│   ├── agendamentos.js          # ATUALIZADO: chamar envio de email
│   └── clientes.js              # ATUALIZADO: salvar email
├── JSONs/
│   └── dbSalao.json             # ATUALIZADO: adicionar email aos clientes
└── README.md                     # NOVO: seção de lembretes por email
```

---

## Resultado esperado

✅ Usuário cria agendamento → recebe email de confirmação em segundos  
✅ 1h antes do agendamento → recebe email de lembrete  
✅ Sem cancelamento via email (como solicitado)  
✅ Nome do profissional dinâmico (puxado do banco de dados)  
✅ Informações formatadas profissionalmente  
```

Pronto para o Claude Code! 🚀
