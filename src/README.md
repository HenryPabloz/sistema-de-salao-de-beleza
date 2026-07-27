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
- **GSAP** — animações
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

## 📱 Responsividade

- **Mobile** (<768px): Sidebar em menu hambúrguer, 1 coluna
- **Tablet** (768–1023px): Sidebar lateral reduzida, 2 colunas
- **Desktop** (1024px+): Sidebar fixa, layout multi-coluna

## 🐛 Troubleshooting

### "Failed to fetch" nos console
- Certifique-se de que json-server está rodando: `json-server JSONs/dbSalao.json --port 3000`
- Verifique se a porta 3000 não está bloqueada

### Menu mobile não abre
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Teste em modo anônimo/privado

### Animações não aparecem
- Verifique se GSAP foi carregado (abra DevTools → Console, procure por erros)
- Se tiver ativado "Prefers reduced motion" nas preferências de acessibilidade, as animações serão desligadas intencionalmente

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

Desenvolvido como exercício de integração de múltiplos endpoints REST com dashboard e CRUD.

---

**Pronto para usar!** Se encontrar problemas, abra uma [issue](https://github.com/seu-usuario/sistema-salao-beleza/issues).