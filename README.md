# Portfólio – Carlos Henrique (Data Analyst & Python Developer)

Este repositório contém o código-fonte do meu portfólio profissional, focado em **Análise de Dados** e **Desenvolvimento em Python**, com destaque para projetos de ETL, dashboards em Power BI, APIs e automações.

---

## 🎯 Objetivo do projeto

- Apresentar de forma clara minha trajetória, habilidades técnicas e principais projetos de dados.  
- Servir como cartão de visita online para recrutadores, empresas e parceiros.  
- Centralizar links importantes: GitHub, LinkedIn, WhatsApp, e-mail e CV em PDF.  
- Demonstrar conhecimentos em front-end básico, responsividade, Dark Mode, internacionalização (PT/EN) e boas práticas de UI/UX.

---

## 🧱 Tecnologias utilizadas

- **HTML5** – Estrutura semântica da página (Home, Sobre, Experiência, Projetos, Skills, Certificações e Contato).  
- **Tailwind CSS (via CDN)** – Estilização, layout responsivo, efeitos de vidro (glassmorphism), gradientes e animações.  
- **JavaScript (Vanilla JS)** –  
  - Controle de tema (Dark/Light) com `localStorage`.  
  - Menu mobile e rolagem suave entre seções.  
  - Botão "voltar ao topo".  
  - Internacionalização (PT/EN) via objeto `translations` e atributos `data-i18n`.  
  - Renderização dinâmica de Experiência, Projetos, Skills e Certificações a partir de arrays JS (`experienceData`, `projectsData`, `skillsData`, `certsData`).  
  - Integração com ScrollReveal para animações de entrada.  
- **Font Awesome** – Ícones para navbar, seções e redes sociais.  
- **Google Fonts (Inter)** – Tipografia principal.

---

## 🗂️ Estrutura das seções

### Header / Navbar

- Logo "CH" e nome "Carlos Henrique".  
- Links de navegação: Sobre, Experiência, Projetos, Skills, Contato.  
- Botão de alternância de tema (claro/escuro).  
- Seleção de idioma PT/EN.  
- Menu mobile para dispositivos menores.

### Hero (Home)

- Título com saudação e nome ("Olá, sou o Carlos Henrique").  
- Badge "Data Analyst & Python Developer".  
- Texto de resumo sobre atuação com Python, SQL, Power BI e automação.  
- Métricas rápidas: anos de TI, quantidade de projetos e certificados.  
- Botões para ver projetos, baixar CV e links para LinkedIn, GitHub e WhatsApp.  
- Foto com moldura estilizada e badge "Disponível para Oportunidades".

### Sobre Mim (`#about`)

- Texto sobre transição de infraestrutura/suporte para Análise de Dados.  
- Ênfase em uso de Python, SQL e Power BI para ETL, modelagem de dados e dashboards.  
- Cards com:
  - Formação: Ciência da Computação.  
  - Localização: Rio de Janeiro, RJ.  
- Cards com percentuais de proficiência (Python, SQL & BI, DevOps, Cloud & IA) com barras de progresso.

### Trajetória Profissional (`#experience`)

- Timeline montada dinamicamente a partir de `experienceData`.  
- Cada experiência inclui:
  - Cargo em PT/EN.  
  - Empresa.  
  - Período.  
  - Indicador "Atual/Present" quando for posição em andamento.  
  - Descrição das atividades (Zabbix, Grafana, Python, Power BI, Tasy, GLPI, suporte, manutenção, cursos etc.).

### Projetos em Destaque (`#projects`)

- Cards gerados a partir de `projectsData`.  
- Cada projeto contém:
  - Ícone e título.  
  - Descrição em PT/EN com foco na stack utilizada.  
  - Lista de tags (por exemplo: Python, Pandas, Power BI, Streamlit, FastAPI, PostgreSQL, Docker).  
  - Links para GitHub e, quando disponível, link de deploy (Streamlit, Render etc.).  
- Exemplos de projetos cadastrados:
  - Dashboard de Salários – Data Market (Python + Pandas + Power BI + Streamlit).  
  - API Backend – Gestão de Dados (FastAPI + PostgreSQL + Docker).  
  - Calculadora de IMC com Python (lógica, validação e interação).

### Tech Stack (`#skills`)

- Categorias de skills definidas em `skillsData`:
  - Análise de Dados.  
  - Bancos de Dados.  
  - Infra & DevOps.  
  - Desenvolvimento.  
  - Cloud & IA.  
  - Business Intelligence.  
- Cada card mostra:
  - Ícone e nome da categoria.  
  - Lista de tecnologias com percentual de domínio e barra de progresso animada.

### Certificações & Cursos (`#certifications`)

- Conteúdo carregado a partir de `certsData`.  
- Agrupado em blocos, por exemplo:
  - Análise de Dados & BI.  
  - Infraestrutura & DevOps.  
  - Desenvolvimento & Programação.  
  - Formação Acadêmica.  
- Cada grupo é exibido em componentes do tipo `<details>` com lista de cursos/certificações.

### Contato (`#contact`)

- Título "Vamos trabalhar juntos?".  
- Texto reforçando disponibilidade para gerar valor com análise de dados.  
- Botões para:
  - Enviar e-mail (mailto).  
  - Abrir conversa no WhatsApp.  
  - Acessar LinkedIn.  
- Cards com informações de contato:
  - E-mail.  
  - Telefone.  
  - Localização (Rio de Janeiro, RJ).

### Footer

- Logo "CH", nome e função (Data Analyst & Python Developer).  
- Ícones com links para LinkedIn, GitHub, WhatsApp e e-mail.  
- Ano atualizado dinamicamente via JavaScript.

---

## 🌐 Internacionalização (PT/EN)

- As traduções são centralizadas no objeto `translations` no script principal.  
- Elementos traduzíveis usam o atributo `data-i18n` com a chave correspondente (por exemplo, `data-i18n="hero_desc"`).  
- Uma função percorre todos os elementos com `data-i18n` e substitui o conteúdo pelo texto do idioma atual.  
- O idioma selecionado é salvo em `localStorage` para persistir entre visitas.  
- Botões "PT" e "EN" permitem alternar o idioma a qualquer momento.

---

## 🌓 Tema claro/escuro

- O Tailwind está configurado com `darkMode: 'class'`.  
- O tema é aplicado adicionando/removendo a classe `dark` na tag `<html>`.  
- A preferência (light/dark) é armazenada em `localStorage.theme`.  
- O botão de tema na navbar alterna o ícone de lua/sol conforme o estado atual.

---

## ⚙️ Funcionalidades de UI/UX

- **Menu mobile**: botão hambúrguer para abrir/fechar o menu em telas menores.  
- **Scroll suave**: navegação entre seções via âncoras com rolagem suave.  
- **Botão "voltar ao topo"**: aparece após rolagem e leva o usuário de volta ao início da página.  
- **Animações**:
  - ScrollReveal em títulos, cards e elementos principais.  
  - Animações customizadas via CSS: gradiente animado, efeito de flutuação na imagem, pulsar de fundos.

---

## 📁 Estrutura de arquivos (sugerida)

```text
/
├─ index.html            # Arquivo principal do portfólio
├─ img/
│  └─ foto.jpg           # Foto de perfil utilizada no Hero
├─ CARLOS_HENRIQUE.pdf   # Currículo para download
└─ README.md             # Este arquivo