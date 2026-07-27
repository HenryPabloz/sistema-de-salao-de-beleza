# 💇 Salão Âmbar — Sistema de Gestão de Beleza

Sistema completo e moderno para gestão de salão de beleza. Gerencie clientes, profissionais, serviços e agendamentos com um dashboard intuitivo.

## ✨ Recursos principais

- 🎯 **Dashboard consolidado** — KPIs, faturamento, rankings e taxa de cancelamento em tempo real
- 👥 **CRUD completo** — Clientes (com soft delete), profissionais, serviços e agendamentos
- 🔄 **Detecção automática de conflitos** — Previne agendamentos sobrepostos com buffer de 15 minutos
- 🔐 **Validações robustas** — Máscaras de CPF/telefone, verificação de duplicatas, formatos
- 🎨 **Design luxuoso** — Tema escuro premium com destaque em amarelo âmbar
- 🌙 **Modo claro/escuro** — Com preferência salva em localStorage
- 📱 **Responsivo** — Mobile-first, testado de 320px a 1440px+
- ⚡ **Animações suaves** — GSAP + Lenis para scroll performático
- 💬 **Feedback visual** — SweetAlert2 em todas as ações críticas

## 🛠️ Tecnologias

- **HTML5** e **CSS3** (vanilla)
- **JavaScript** (ES6+, vanilla)
- **json-server** — API REST mock
- **Bootstrap 5.3** — base customizada
- **GSAP** — animações de sequência (cards de KPI, seções, contadores, barra vertical, transição entre páginas — sidebar sempre estática)
- **Anime.js** — animação pontual de entrada das linhas de tabela
- **Lenis** — smooth scroll
- **SweetAlert2** — feedbacks e confirmações
- **Lucide Icons** — ícones semânticos

## 📋 Pré-requisitos

- Node.js 14+
- npm ou yarn

## 🚀 Como instalar e rodar

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/sistema-salao-beleza.git
cd sistema-salao-beleza/src
```

### 2. Instale json-server globalmente
```bash
npm install -g json-server
```

### 3. Inicie o servidor API
```bash
json-server JSONs/dbSalao.json --port 3000
```
Deixe este terminal aberto — o site depende dele.

### 4. Abra o projeto
Use a extensão **Live Server** do VS Code em `src/HTML/index.html`, ou qualquer servidor estático:
```bash
python -m http.server 5500 # Python
# ou
npx http-server # Node.js
```

Acesse: `http://localhost:5500/src/HTML/index.html` (ou a porta que você configurou)

## 📁 Estrutura do projeto

```
src/
├── CSS/
│   ├── layout.css          # Design System, sidebar, componentes
│   ├── dashboard.css       # Dashboard específico
│   ├── clientes.css
│   ├── profissionais.css
│   ├── servicos.css
│   └── agendamentos.css
├── HTML/
│   ├── index.html          # Dashboard (página inicial)
│   ├── clientes.html
│   ├── profissionais.html
│   ├── servicos.html
│   └── agendamentos.html
├── JS/
│   ├── utils.js            # Máscaras, formatação, validação
│   ├── api.js              # Camada HTTP + lógica de negócio
│   ├── navbar.js           # Navegação + tema claro/escuro
│   ├── animacoes.js        # GSAP + Lenis
│   ├── dashboard.js
│   ├── clientes.js
│   ├── profissionais.js
│   ├── servicos.js
│   └── agendamentos.js
└── JSONs/
    └── dbSalao.json        # Base de dados mock
```

## 🎨 Design System

O projeto segue um **Design System luxuoso** com paleta escura e destaque em amarelo âmbar (#F39200). Para detalhes completos sobre cores, tipografia e componentes, veja [prompt.md](./prompt.md).

| Cor | Hex | Uso |
|---|---|---|
| Destaque | `#F39200` | CTA, badges, ícones |
| Texto principal | `#F5F6FA` | Body |
| Fundo principal | `#1F2024` | Página |
| Sucesso | `#10B981` | Realizado, ativo |
| Erro | `#EF4444` | Cancelado, erro |

## 📊 Funcionalidades por página

### Dashboard
- 4 cards de KPI (Agendados, Realizados, Cancelados, Faturamento total)
- Faturamento por profissional
- Serviços mais agendados
- Taxa de cancelamento (com barra vertical)
- Clientes mais frequentes
- Filtros por especialidade e status

### Clientes
- Listagem com busca em tempo real
- Cadastro/edição com máscaras de CPF e telefone
- Campo de email (obrigatório e validado), usado nos lembretes de agendamento por EmailJS
- Soft delete (inativar/reativar em vez de excluir)
- Validação de duplicatas de CPF

### Profissionais
- CRUD com especialidades fixas
- Bloqueio de exclusão se houver agendamentos pendentes
- Listagem com busca

### Serviços
- CRUD com nome, duração e preço
- Bloqueio de exclusão se houver agendamentos pendentes
- Validações de campo numérico

### Agendamentos
- Listagem com paginação (10 registros/página)
- Busca por cliente ou profissional
- Cadastro/edição com detecção automática de conflitos de horário
- Mudança de status: agendado → realizado ou cancelado
- Validação de estoque de agendamentos do cliente ativo

## 🔐 Regras de negócio principais

- **Soft delete**: clientes inativos continuam visíveis, mas não podem ser selecionados em novos agendamentos
- **Conflito de horário**: sistema impede agendamentos sobrepostos; calcula ocupação do profissional incluindo 15 min de buffer
- **Propriedade derivada**: status do produto/agendamento calculado automaticamente, nunca editável manualmente
- **Faturamento**: apenas agendamentos com status "realizado" entram no cálculo

## 🌐 Tema claro/escuro

O botão de tema está no rodapé da sidebar. A preferência é salva em `localStorage` e aplicada automaticamente no carregamento de cada página (antes da primeira pintura, sem flash).

## 📧 Lembretes por Email (EmailJS)

O projeto integra **EmailJS** (envio de email direto do navegador, sem
back-end) à página de Agendamentos para dois disparos automáticos:

1. **Confirmação imediata** — ao salvar um novo agendamento, o cliente
   recebe um email confirmando profissional, serviço, data e hora.
2. **Lembrete 1h antes** — o sistema agenda com `setTimeout` o envio de um
   segundo email exatamente 1 hora antes do horário marcado.

### 🚀 Como configurar

1. Crie uma conta gratuita em [EmailJS](https://www.emailjs.com/).
2. Em **Email Services**, adicione seu provedor (ex.: Gmail) e copie o
   **Service ID** gerado.
3. Em **Email Templates**, crie dois templates (confirmação e lembrete)
   usando estas variáveis no conteúdo/assunto: `{{nomeCliente}}`,
   `{{nomeProfissional}}`, `{{nomeServico}}`, `{{duracao}}`, `{{data}}`,
   `{{hora}}`. No campo **To Email** (aba "Settings" do editor, não é o
   corpo do email), preencha `{{to_email}}` — sem isso o EmailJS não sabe
   pra quem mandar.
   > ⚠️ **Atenção**: o nome que você dá ao template (ex.: "Confirmação de
   > agendamento") é só um rótulo de exibição — **não é** o ID usado pela
   > API. O ID real (algo como `template_w90z3tt`) é gerado
   > automaticamente pelo EmailJS e aparece na URL do editor do template
   > (`dashboard.emailjs.com/admin/templates/<ID>`). É esse ID que vai nas
   > constantes `EMAILJS_TEMPLATE_CONFIRMACAO`/`EMAILJS_TEMPLATE_LEMBRETE`.
4. Em **Account → API**, copie sua **Public Key**.
5. Em `JS/agendamentos.js`, preencha as três constantes no topo do arquivo:
   `EMAILJS_SERVICE_ID`, `EMAILJS_PUBLIC_KEY` e (se você renomear os
   templates) `EMAILJS_TEMPLATE_CONFIRMACAO`/`EMAILJS_TEMPLATE_LEMBRETE`.

> ⚠️ **Por que não existe `emailjs.init()` num `<script>` no HTML**: a CSP do
> projeto (`script-src 'self' https://cdn.jsdelivr.net`) bloqueia scripts
> inline de propósito (é a defesa contra XSS — ver seção "🔐 Segurança"). Por
> isso a Public Key é passada diretamente como 4º argumento de
> `emailjs.send(...)` em `agendamentos.js`, um arquivo externo, em vez de
> depender de `emailjs.init()` num bloco inline (que seria bloqueado
> silenciosamente e faria os emails falharem sem erro visível na tela).

### ⚙️ Como funciona

- Cada cliente agora tem um campo **Email** obrigatório (cadastrado em
  Clientes, validado com a mesma regex de `validaEmailEstrutural()` em
  `utils.js`).
- Ao salvar um agendamento **novo**, o sistema primeiro confere se o
  cliente selecionado tem um email válido — se não tiver, bloqueia com um
  aviso antes de gravar. Em seguida dispara o email de confirmação e
  agenda o lembrete via `agendarLembreteEmail()`.
- Se o agendamento for **cancelado**, o timer do lembrete pendente é
  cancelado (`cancelarLembreteEmail()`), evitando notificar um horário que
  não existe mais.
- Falhas de envio (ex.: EmailJS fora do ar) são só logadas no console — não
  impedem o agendamento de ser salvo.

### ⚠️ Limitações

- **Tier gratuito EmailJS**: 200 emails/mês.
- **Lembretes só funcionam com a aba aberta**: como usam `setTimeout` no
  navegador, recarregar ou fechar a página cancela os lembretes pendentes.
  Em produção, isso exigiria um back-end com cron job.
- A edição de um agendamento existente não reenvia confirmação nem
  reagenda o lembrete (só a criação de um agendamento novo dispara).

### 🐛 Email não chega (mesmo com credenciais corretas)

Como a falha só é logada no console (não trava o agendamento), abra o
DevTools → Console ao testar. Causas comuns:

- **CSP bloqueando script inline** — já corrigido: a Public Key é passada
  direto em `emailjs.send(...)`, não via `emailjs.init()` num `<script>`
  solto no HTML (que a CSP deste projeto bloqueia silenciosamente).
- **Allowlist de domínio no EmailJS** — em Dashboard → Account → Security,
  se a opção de restringir por domínio estiver ativa, o domínio de onde
  você está testando (ex.: `http://127.0.0.1:5500`) precisa estar na lista.
- **Template ID errado** — erro típico: `"The template ID not found"`.
  Copie o ID real do template (visível na URL do editor,
  `dashboard.emailjs.com/admin/templates/<ID>`), não o nome de exibição
  que você deu a ele — são coisas diferentes no EmailJS.
- **Service desconectado** — em Email Services, confirme que o status do
  serviço (Gmail, etc.) está "Connected", não "Disconnected".

## 📱 Responsividade

- **Mobile** (<768px): Sidebar em menu hambúrguer, 1 coluna
- **Tablet** (768–1023px): Sidebar lateral reduzida, 2 colunas
- **Desktop** (1024px+): Sidebar fixa, layout multi-coluna

## 🔐 Segurança

### Proteção contra XSS (Cross-Site Scripting)

Todo dado que vem da API (nome de cliente, profissional, serviço...) é
tratado como não confiável antes de entrar na tela, porque nada impede que
alguém cadastre um nome como `<img src=x onerror="alert(1)">` diretamente
pela API (ex.: via `curl` ou DevTools), pulando o formulário.

- **`escaparHTML(valor)`** (em `utils.js`) — converte `<`, `>`, `&`, `"` e `'`
  nas entidades HTML equivalentes antes de qualquer valor dinâmico entrar em
  um `innerHTML`. Usada em todas as linhas de tabela geradas por JS
  (`dashboard.js`, `clientes.js`, `profissionais.js`, `servicos.js`,
  `agendamentos.js`) nos campos de texto livre (nome, especialidade).
- **Campos que não precisam de escape**: os preenchidos via `.textContent`
  ou `.value` (opções de `<select>`, títulos de formulário, os próprios
  `<input>`) já são seguros por natureza — essas propriedades nunca
  interpretam HTML. CPF e telefone também são seguros mesmo sem escape,
  porque `formataCPF`/`formataTelefone` só deixam dígitos e pontuação fixa
  passarem, nunca o texto original.
- **Mensagens do SweetAlert2** usam a opção `text` (não `html`), que também
  escapa automaticamente — por isso os nomes de cliente/profissional/serviço
  nos textos de confirmação já eram seguros mesmo antes desta revisão.
- **Content Security Policy (CSP)** — presente em todas as páginas, mas
  ajustada para o que o projeto realmente usa (a política genérica mais
  comum bloquearia a aplicação inteira):
  ```
  default-src 'self';
  script-src 'self' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  img-src 'self' data:;
  connect-src 'self' http://localhost:3000 https://api.emailjs.com;
  object-src 'none';
  base-uri 'self';
  ```
  - `font-src`/`style-src` incluem o Google Fonts — sem isso a tipografia
    (League Gothic, Inria Sans, Dancing Script) não carregaria.
  - `connect-src` inclui `http://localhost:3000` — sem isso **nenhuma**
    chamada `fetch` ao json-server funcionaria, e o site inteiro pareceria
    quebrado.
  - `connect-src` também inclui `https://api.emailjs.com`, exclusivamente em
    `agendamentos.html` — é o endpoint que o SDK do EmailJS chama para
    disparar os emails de confirmação e lembrete (ver seção
    "📧 Lembretes por Email" acima).
  - `style-src 'unsafe-inline'` é necessário porque GSAP, Anime.js e as
    barras de progresso do projeto animam estilos inline (`element.style.*`)
    — é assim que essas bibliotecas funcionam. `script-src` **não** tem
    `'unsafe-inline'`, que é a parte que realmente importa contra XSS (é o
    que impediria um `<script>` injetado de rodar).
  - Por causa disso, o script que aplica o tema salvo antes da primeira
    pintura da página (para não piscar o tema errado ao navegar) foi movido
    de um `<script>` inline para o arquivo `JS/tema-inicial.js` — script
    inline é exatamente o que uma CSP sem `'unsafe-inline'` bloqueia.
  - **Efeito colateral no desenvolvimento**: o auto-reload do Live Server
    (que usa um WebSocket) não está liberado no `connect-src`. Isso não
    afeta o funcionamento do site, só significa que às vezes é preciso dar
    um refresh manual depois de salvar um arquivo.

### Por que não bloqueamos `<`, `>`, `&` no formulário

Escapar na hora de **exibir** o dado (o que já fazemos) é a defesa
recomendada contra XSS — bloquear esses caracteres na hora de **digitar**
seria redundante e ainda rejeitaria nomes legítimos (ex.: "Salão & Cia").
Por isso os formulários continuam validando só o que é regra de negócio
(campo obrigatório, sem números no nome, CPF com 11 dígitos...), não
caracteres de marcação.

⚠️ **Nota**: este projeto é educacional e roda 100% no navegador. Em
produção, validação e sanitização no servidor são obrigatórias — o
front-end nunca deve ser a única camada de proteção.

## ✨ Interatividade e animações

GSAP e Anime.js dividem responsabilidades (não animam a mesma propriedade
do mesmo elemento ao mesmo tempo — isso já causou um bug real neste
projeto, documentado mais abaixo):

- **GSAP** — sequências com controle fino, todas escopadas a
  `.conteudo-principal` (a sidebar é sempre estática, nunca anima): cards de
  KPI (fade + cascata), seções do dashboard, contadores numéricos animados,
  preenchimento da barra vertical de cancelamento, e um fade-out rápido do
  conteúdo ao clicar num link da sidebar (cliques com Ctrl/Cmd/Shift/botão do
  meio não são interceptados, para não quebrar "abrir em nova aba").
- **Anime.js** — só a entrada das linhas de tabela (fade + slide da
  esquerda, em cascata), em todas as páginas com listagem.
- **Lenis** — scroll suave em toda a aplicação.
- **Hover dos cards** (`.card-section`, `.card-indicador`) — eleva 5px,
  sombra mais forte e um leve glow amarelo na borda.

Todas as animações checam `prefereReducedMotion()` (em `utils.js`) antes de
rodar — quem ativou "reduzir movimento" no sistema operacional simplesmente
vê o conteúdo já no lugar final, sem nenhuma das transições acima.

**Lição registrada**: os cards de KPI e as seções do dashboard chegaram a
animar com `y` (e o KPI também com `scale`) além do fade. Isolamos com
testes automatizados (Playwright, várias rodadas, com a aba em primeiro
plano para descartar throttling) e confirmamos: sempre que o GSAP anima
`transform` (`y` ou `scale`) em **vários elementos ao mesmo tempo** — com ou
sem `stagger` — alguns elementos ficam com um valor residual que nunca
chega ao destino (o `onComplete` dispara normalmente, só o valor aplicado
fica errado). Resultado visível: cards de alturas/posições diferentes,
parecendo "tortos". Animar **só `autoAlpha`** (opacidade) nesses grupos
resolveu de vez — testamos 5 recargas seguidas sem nenhuma falha. Se um dia
quiser reintroduzir `y`/`scale` em grupos de elementos, teste bastante
antes de confiar.

## 🐛 Troubleshooting

### "Failed to fetch" nos console
- Certifique-se de que json-server está rodando: `json-server JSONs/dbSalao.json --port 3000`
- Verifique se a porta 3000 não está bloqueada

### Menu mobile não abre
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Teste em modo anônimo/privado

### Animações não aparecem
- Verifique se GSAP/Anime.js/Lenis foram carregados (abra DevTools → Console, procure por erros)
- Se tiver ativado "Prefers reduced motion" nas preferências de acessibilidade, as animações serão desligadas intencionalmente

### "Refused to ... because it violates the following Content Security Policy directive"
- Isso aparece no console se você adicionar um novo CDN, fonte ou endpoint
  sem atualizar a meta tag de CSP em `HTML/*.html`. A CSP deste projeto só
  libera `cdn.jsdelivr.net` (scripts/estilos), `fonts.googleapis.com` +
  `fonts.gstatic.com` (fontes) e `http://localhost:3000` (API). Adicionando
  uma biblioteca nova? Inclua a origem dela na diretiva certa (`script-src`,
  `style-src`, `connect-src`...) nas 5 páginas.

## 📝 Dados mock

O projeto vem com dados de teste:
- 6 clientes (mix de ativos/inativos)
- 4 profissionais (cabeleireiro, manicure, esteticista, maquiador)
- 6 serviços
- 10 agendamentos (mix de status)

Todos os dados estão em `src/JSONs/dbSalao.json` e podem ser editados.

## 📖 Documentação

- [prompt.md](./prompt.md) — Especificação completa do projeto (inclui Design System, paleta, tipografia, componentes)
- [enunciado.md](./enunciado.md) — Descrição do exercício original

## 📄 Licença

Este projeto é fornecido como está para fins educacionais.

## 👤 Autor
Pablo Henry

Desenvolvido como exercício de integração de múltiplos endpoints REST com dashboard e CRUD.

---

**Pronto para usar!** Se encontrar problemas, abra uma [issue](https://github.com/seu-usuario/sistema-salao-beleza/issues).
