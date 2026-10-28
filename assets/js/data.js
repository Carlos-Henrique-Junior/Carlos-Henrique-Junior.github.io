
    // ==========================================
    // PORTFÓLIO CARLOS HENRIQUE - JavaScript
    // ==========================================

    // --- TRADUÇÕES ---
    const translations = {
        pt: {
            nav_about: "Sobre",
            nav_experience: "Experiência",
            nav_projects: "Projetos",
            nav_skills: "Skills",
            nav_contact: "Contato",
            hero_badge: "Data Analyst & Python Developer",
            hero_greeting: "Olá, sou o",
            hero_desc: "Transformo dados brutos em insights estratégicos. Especialista em Python, SQL e Power BI, com forte base em infraestrutura, automação e pós-graduando em IA e Machine Learning.",
            hero_cta_projects: "Ver Projetos",
            hero_cta_cv: "Download CV",
            stat_years: "Anos TI",
            stat_projects: "Projetos",
            stat_postgrad: "Pós-Grad.",
            badge_available: "Disponível para",
            badge_opportunities: "Oportunidades",
            about_title: "Sobre Mim",
            about_text: "Com uma base sólida em infraestrutura e suporte técnico, direcionei minha carreira para a <strong>Análise de Dados</strong>. Minha paixão é utilizar a tecnologia para resolver problemas de negócio.<br><br>Hoje, utilizo <strong>Python, SQL e Power BI</strong> para automatizar processos de ETL, modelar bancos de dados e criar dashboards que eliminam o 'achismo' e trazem certeza para a tomada de decisão. Em paralelo, curso <strong>duas pós-graduações em Inteligência Artificial e Machine Learning</strong>, ampliando meu repertório técnico.",
            fact_education_title: "Formação",
            fact_education_value: "Ciência da Computação + Pós em IA/ML",
            fact_location_title: "Localização",
            fact_languages_title: "Idiomas",
            fact_languages_value: "PT (nativo) • EN intermediário • ES básico",
            fact_current_title: "Último Cargo",
            fact_current_value: "Técnico N2 – Montreal Informática",
            exp_title: "Trajetória Profissional",
            projects_title: "Projetos em Destaque",
            projects_subtitle: "Foco em extração de dados, automação e análise para tomada de decisão.",
            skills_title: "Tech Stack",
            certs_title: "Certificações & Cursos",
            contact_title: "Vamos trabalhar juntos?",
            contact_text: "Estou pronto para aplicar minhas habilidades de análise de dados para gerar valor para sua empresa.",
            contact_phone: "Telefone",
            contact_location: "Localização",
            btn_email: "Enviar E-mail",
            btn_whatsapp: "WhatsApp",
            view_code: "Ver Código",
            view_deploy: "Ver Deploy",
            ongoing: "Atual",
            footer_made: "Desenvolvido com <i class='fa-solid fa-heart text-red-500'></i> e Python"
        },
        en: {
            nav_about: "About",
            nav_experience: "Experience",
            nav_projects: "Projects",
            nav_skills: "Skills",
            nav_contact: "Contact",
            hero_badge: "Data Analyst & Python Developer",
            hero_greeting: "Hi, I am",
            hero_desc: "Transforming raw data into strategic insights. Specialist in Python, SQL, and Power BI with a strong background in infrastructure, automation, and currently pursuing two postgraduate degrees in AI and Machine Learning.",
            hero_cta_projects: "View Projects",
            hero_cta_cv: "Download CV",
            stat_years: "IT Years",
            stat_projects: "Projects",
            stat_postgrad: "Postgrad.",
            badge_available: "Available for",
            badge_opportunities: "Opportunities",
            about_title: "About Me",
            about_text: "With a solid foundation in infrastructure and technical support, I pivoted my career towards <strong>Data Analysis</strong>. My passion is using technology to solve business problems.<br><br>Today, I use <strong>Python, SQL, and Power BI</strong> to automate ETL processes, model databases, and create dashboards that remove guesswork and bring certainty to decision-making. In parallel, I'm pursuing <strong>two postgraduate degrees in Artificial Intelligence and Machine Learning</strong>, expanding my technical repertoire.",
            fact_education_title: "Education",
            fact_education_value: "Computer Science + Postgrad in AI/ML",
            fact_location_title: "Location",
            fact_languages_title: "Languages",
            fact_languages_value: "PT (native) • EN intermediate • ES basic",
            fact_current_title: "Latest Role",
            fact_current_value: "N2 Technician – Montreal Informática",
            exp_title: "Professional Journey",
            projects_title: "Featured Projects",
            projects_subtitle: "Focus on data extraction, automation, and decision-making analysis.",
            skills_title: "Tech Stack",
            certs_title: "Certifications & Courses",
            contact_title: "Let's work together?",
            contact_text: "I'm ready to apply my data analysis skills to generate value for your company.",
            contact_phone: "Phone",
            contact_location: "Location",
            btn_email: "Send E-mail",
            btn_whatsapp: "WhatsApp",
            view_code: "View Code",
            view_deploy: "Live Demo",
            ongoing: "Present",
            footer_made: "Made with <i class='fa-solid fa-heart text-red-500'></i> and Python"
        }
    };

    // --- DADOS DOS PROJETOS ---
    const projectsData = [
        {
            title: "Dashboard de Salários - Data Market",
            desc: {
                pt: "Ferramenta de inteligência de mercado desenvolvida para eliminar a assimetria de informações salariais. Utilizei <strong>Python (Pandas)</strong> para ETL e <strong>Power BI</strong> para revelar tendências de remuneração.",
                en: "Market intelligence tool designed to eliminate salary information asymmetry. Used <strong>Python (Pandas)</strong> for ETL and <strong>Power BI</strong> to reveal compensation trends."
            },
            tags: ["Python", "Pandas", "Power BI", "Streamlit", "ETL"],
            links: {
                github: "https://github.com/Carlos-Henrique-Junior/Dashboard_de_Salarios_Area_de_Dados",
                deploy: "https://dashboarddesalariosareadedado.streamlit.app"
            },
            icon: "fa-chart-line",
            color: "from-blue-500 to-cyan-500"
        },
        {
            title: "API Backend - Gestão de Dados",
            desc: {
                pt: "Arquitetura Backend focada em integridade de dados. Estrutura de BD que suporta relações complexas, facilitando extrações analíticas via <strong>SQL</strong>.",
                en: "Backend architecture focused on data integrity. Database structure supporting complex relationships, facilitating analytical extractions via <strong>SQL</strong>."
            },
            tags: ["Python", "FastAPI", "PostgreSQL", "Docker", "API REST"],
            links: {
                github: "https://github.com/Carlos-Henrique-Junior/desafio-backend-voluntarios",
                deploy: "https://desafio-backend-voluntarios.onrender.com/docs"
            },
            icon: "fa-database",
            color: "from-purple-500 to-pink-500"
        },
        {
            title: "Monitoramento de Mercado - CFTC",
            desc: {
                pt: "Dashboard interativo para análise dos relatórios Commitment of Traders (CFTC). Utiliza <strong>Python</strong> e <strong>Streamlit</strong> para visualizar o posicionamento de grandes players no mercado financeiro global.",
                en: "Interactive dashboard for analyzing Commitment of Traders (CFTC) reports. Uses <strong>Python</strong> and <strong>Streamlit</strong> to visualize the positioning of major players in the global financial market."
            },
            tags: ["Python", "Streamlit", "Pandas", "Finance", "Data Viz"],
            links: {
                github: "https://github.com/Carlos-Henrique-Junior/monitoramento-cftc",
                deploy: "https://dashboard-mercado-cftc.streamlit.app/"
            },
            icon: "fa-arrow-trend-up",
            color: "from-orange-500 to-amber-500"
        }
    ];

    // --- DADOS DA EXPERIÊNCIA ---
    const experienceData = [
        {
            role: { pt: "Técnico de Suporte N2", en: "N2 Support Technician" },
            company: "Montreal Informática",
            period: "03/2026 - 07/2026",
            ongoing: false,
            desc: {
                pt: "Atuei no atendimento de <strong>suporte técnico nível 2</strong>, resolvendo incidentes escalados com diagnóstico aprofundado em hardware, software, sistemas operacionais e redes corporativas. Documento procedimentos, atuo em conjunto com times N1 e N3 e aplico conhecimentos de <strong>automação</strong> e <strong>scripts</strong> para otimizar tarefas repetitivas.",
                en: "Worked in <strong>Level 2 technical support</strong>, resolving escalated incidents with in-depth diagnostics in hardware, software, operating systems, and corporate networks. I document procedures, collaborate with N1 and N3 teams, and apply <strong>automation</strong> and <strong>scripting</strong> knowledge to optimize repetitive tasks."
            },
            icon: "fa-headset",
            color: "blue"
        },
        {
            role: { pt: "Estagiário de TI (Dados/BI)", en: "IT Intern (Data/BI)" },
            company: "PGE-RJ – Procuradoria Geral do Estado",
            period: "03/2024 - 03/2026",
            ongoing: false,
            desc: {
                pt: "Implementei, configurei e administrei o <strong>Zabbix</strong> para monitoramento de servidores. Desenvolvi dashboards no <strong>Grafana</strong> e automatizei processos com <strong>Python</strong>, <strong>Bash</strong> e <strong>MySQL</strong>. Construí painéis interativos no <strong>Power BI</strong> para análise estratégica e desenvolvi scripts de <strong>ETL</strong>.",
                en: "Implemented, configured and administered <strong>Zabbix</strong> for server monitoring. Developed <strong>Grafana</strong> dashboards and automated processes with <strong>Python</strong>, <strong>Bash</strong>, and <strong>MySQL</strong>. Built interactive <strong>Power BI</strong> panels for strategic analysis and developed <strong>ETL</strong> scripts."
            },
            icon: "fa-briefcase",
            color: "purple"
        },
        {
            role: { pt: "Técnico de Suporte Júnior", en: "Junior Support Tech" },
            company: "CREB – Centro de Reumatologia",
            period: "12/2021 - 12/2023",
            ongoing: false,
            desc: {
                pt: "Prestei suporte técnico em TI, atuando com hardware, software e redes. Resolvi incidentes e prestei suporte aos sistemas <strong>Tasy</strong> e <strong>GLPI</strong>. Atendi clínicas no Rio de Janeiro presencialmente e remotamente em São Paulo, implementando melhorias em processos de suporte.",
                en: "Provided technical IT support, working with hardware, software, and networks. Resolved incidents and supported <strong>Tasy</strong> and <strong>GLPI</strong> systems. Served clinics in Rio de Janeiro on-site and remotely in São Paulo, implementing improvements in support processes."
            },
            icon: "fa-hospital",
            color: "green"
        },
        {
            role: { pt: "Estagiário de TI - Informática", en: "IT Intern - Computer Area" },
            company: "Ciob – Centro de Integração Objetivo",
            period: "01/2020 - 12/2020",
            ongoing: false,
            desc: {
                pt: "Realizei manutenção preventiva e corretiva de computadores. Ministrei cursos de <strong>Pacote Office</strong> (Word, Excel, PowerPoint). Configurei redes e cabeamento, e treinei alunos em ferramentas digitais.",
                en: "Performed preventive and corrective computer maintenance. Taught <strong>Office Suite</strong> courses (Word, Excel, PowerPoint). Configured networks and cabling, and trained students in digital tools."
            },
            icon: "fa-graduation-cap",
            color: "orange"
        }
    ];

    // --- DADOS DAS SKILLS ---
    const skillsData = [
        {
            category: { pt: "Análise de Dados", en: "Data Analysis" },
            icon: "fa-chart-pie",
            color: "blue",
            items: [
                { name: "Python (Pandas/NumPy)", level: 90 },
                { name: "Power BI (DAX)", level: 85 },
                { name: "SQL Avançado", level: 85 },
                { name: "ETL & Data Pipeline", level: 80 },
                { name: "Excel Avançado", level: 80 }
            ]
        },
        {
            category: { pt: "Bancos de Dados", en: "Databases" },
            icon: "fa-database",
            color: "green",
            items: [
                { name: "MySQL", level: 85 },
                { name: "PostgreSQL", level: 80 },
                { name: "MongoDB", level: 70 },
                { name: "SQLite", level: 75 }
            ]
        },
        {
            category: { pt: "Infra & DevOps", en: "Infra & DevOps" },
            icon: "fa-server",
            color: "purple",
            items: [
                { name: "Shell Script", level: 80 },
                { name: "Docker", level: 75 },
                { name: "Zabbix & Grafana", level: 85 },
                { name: "Linux", level: 80 },
                { name: "Git/GitHub", level: 85 }
            ]
        },
        {
            category: { pt: "Desenvolvimento", en: "Development" },
            icon: "fa-code",
            color: "orange",
            items: [
                { name: "Python (FastAPI/Django)", level: 85 },
                { name: "JavaScript", level: 70 },
                { name: "HTML/CSS", level: 75 },
                { name: "API REST", level: 80 }
            ]
        },
        {
            category: { pt: "Cloud & IA/ML", en: "Cloud & AI/ML" },
            icon: "fa-brain",
            color: "cyan",
            items: [
                { name: "AWS (Estudos)", level: 70 },
                { name: "Azure (Estudos)", level: 70 },
                { name: "Machine Learning (Pós)", level: 70 },
                { name: "TensorFlow / Scikit-learn", level: 65 },
                { name: "Inteligência Artificial (Pós)", level: 70 }
            ]
        },
        {
            category: { pt: "Business Intelligence", en: "Business Intelligence" },
            icon: "fa-chart-line",
            color: "yellow",
            items: [
                { name: "Power BI", level: 90 },
                { name: "Dashboards", level: 85 },
                { name: "Storytelling com Dados", level: 80 },
                { name: "KPIs & Métricas", level: 85 }
            ]
        }
    ];

    // --- CERTIFICAÇÕES ---
    const certsData = [
        {
            title: { pt: "Pós-Graduações (Em Andamento)", en: "Postgraduate Studies (Ongoing)" },
            icon: "fa-brain",
            color: "cyan",
            items: [
                "🤖 Pós-Graduação em Inteligência Artificial – Faculdade Líbano (2026)",
                "🧠 Pós-Graduação em Machine Learning – Faculdade Líbano (2026)"
            ]
        },
        {
            title: { pt: "Formação Acadêmica", en: "Academic Education" },
            icon: "fa-graduation-cap",
            color: "orange",
            items: [
                "🎓 Bacharel em Ciência da Computação – UNESA (2025)",
                "💻 Técnico em Informática – Ciob (2018)"
            ]
        },
        {
            title: { pt: "Análise de Dados & BI", en: "Data Analysis & BI" },
            icon: "fa-chart-bar",
            color: "blue",
            items: [
                "Formação Power BI Completa – DIO.me",
                "Python para Data Science – Estácio",
                "Imersão de Dados – Alura",
                "Análise de Dados para Tomada de Decisão – Estácio"
            ]
        },
        {
            title: { pt: "Infraestrutura & DevOps", en: "Infrastructure & DevOps" },
            icon: "fa-server",
            color: "green",
            items: [
                "Zabbix do Básico ao Avançado – Udemy",
                "Docker Essentials – DIO.me",
                "Fundamentos de Redes – DIO.me",
                "Sistemas Operacionais Linux – DIO.me"
            ]
        },
        {
            title: { pt: "Desenvolvimento & Programação", en: "Development & Programming" },
            icon: "fa-code",
            color: "purple",
            items: [
                "Python: Ambiente e Primeiros Passos – DIO.me",
                "Engenharia de Dados com Python – DIO.me",
                "Desenvolvimento Web Django – DIO.me",
                "Fundamentos de Lógica de Programação – DIO.me"
            ]
        }
    ];
