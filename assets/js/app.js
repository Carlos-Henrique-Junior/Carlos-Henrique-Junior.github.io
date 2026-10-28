// --- ESTADO GLOBAL ---
    let currentLang = localStorage.getItem('lang') || 'pt';

    // --- FUNÇÕES DE RENDERIZAÇÃO ---

    function renderAll() {
        renderTexts();
        renderProjects();
        renderExperience();
        renderSkills();
        renderCerts();
    }

    function renderTexts() {
        const t = translations[currentLang];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) el.innerHTML = t[key];
        });

        document.getElementById('btn-pt').classList.toggle('text-blue-600', currentLang === 'pt');
        document.getElementById('btn-pt').classList.toggle('font-bold', currentLang === 'pt');
        document.getElementById('btn-en').classList.toggle('text-blue-600', currentLang === 'en');
        document.getElementById('btn-en').classList.toggle('font-bold', currentLang === 'en');
    }

    function renderProjects() {
        const container = document.getElementById('projects-container');
        container.innerHTML = projectsData.map(proj => `
            <article class="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover-card flex flex-col h-full relative overflow-hidden">
                <!-- Gradiente de fundo -->
                <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${proj.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-2xl"></div>

                <div class="relative z-10">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${proj.color} flex items-center justify-center text-white shadow-lg">
                            <i class="fa-solid ${proj.icon} text-xl"></i>
                        </div>
                        <h3 class="font-bold text-lg leading-tight flex-1">${proj.title}</h3>
                    </div>

                    <p class="text-sm text-gray-600 dark:text-gray-300 mb-6 flex-grow leading-relaxed">
                        ${proj.desc[currentLang]}
                    </p>

                    <div class="flex flex-wrap gap-2 mb-6">
                        ${proj.tags.map(tag => `<span class="chip">${tag}</span>`).join('')}
                    </div>

                    <div class="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <a href="${proj.links.github}" target="_blank" class="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            <i class="fab fa-github"></i>
                            <span>${translations[currentLang].view_code}</span>
                        </a>
                        ${proj.links.deploy ? `
                        <a href="${proj.links.deploy}" target="_blank" class="flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">
                            <i class="fa-solid fa-rocket"></i>
                            <span>${translations[currentLang].view_deploy}</span>
                        </a>` : ''}
                    </div>
                </div>
            </article>
        `).join('');
    }

    function renderExperience() {
        const container = document.getElementById('experience-container');
        container.innerHTML = experienceData.map((exp, index) => {
            const colorMap = {
                blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 border-blue-200 dark:border-blue-800',
                green: 'bg-green-100 dark:bg-green-900 text-green-600 border-green-200 dark:border-green-800',
                purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 border-purple-200 dark:border-purple-800',
                orange: 'bg-orange-100 dark:bg-orange-900 text-orange-600 border-orange-200 dark:border-orange-800'
            };

            return `
                <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <!-- Ícone Timeline -->
                    <div class="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-gray-900 ${colorMap[exp.color]} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-lg">
                        <i class="fa-solid ${exp.icon}"></i>
                    </div>

                    <!-- Card de Experiência -->
                    <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md hover-card">
                        <div class="flex justify-between items-start mb-3 flex-wrap gap-2">
                            <h3 class="font-bold text-lg pr-4">${exp.role[currentLang]}</h3>
                            ${exp.ongoing ?
                                `<span class="text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full border border-green-200 dark:border-green-800">
                                    <i class="fa-solid fa-circle text-[6px] mr-1 animate-pulse"></i>
                                    ${translations[currentLang].ongoing}
                                </span>` :
                                `<span class="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-gray-600 dark:text-gray-400">${exp.period}</span>`
                            }
                        </div>

                        <div class="text-blue-600 dark:text-blue-400 text-sm font-semibold mb-3 flex items-center gap-2">
                            <i class="fa-solid fa-building text-xs"></i>
                            ${exp.company}
                        </div>

                        <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            ${exp.desc[currentLang]}
                        </p>

                        ${exp.ongoing ? `
                        <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div class="text-xs text-gray-500">
                                <i class="fa-solid fa-clock mr-1"></i>
                                ${exp.period} - ${translations[currentLang].ongoing}
                            </div>
                        </div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderSkills() {
        const container = document.getElementById('skills-container');
        const colorMap = {
            blue: 'from-blue-500 to-cyan-500',
            green: 'from-green-500 to-emerald-500',
            purple: 'from-purple-500 to-pink-500',
            orange: 'from-orange-500 to-red-500',
            cyan: 'from-cyan-500 to-blue-500',
            yellow: 'from-yellow-500 to-orange-500'
        };

        container.innerHTML = skillsData.map(cat => `
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover-card">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-12 h-12 bg-gradient-to-br ${colorMap[cat.color]} rounded-xl flex items-center justify-center text-white shadow-lg">
                        <i class="fa-solid ${cat.icon} text-xl"></i>
                    </div>
                    <h3 class="font-bold text-lg">${cat.category[currentLang]}</h3>
                </div>

                <div class="space-y-4">
                    ${cat.items.map(item => `
                        <div>
                            <div class="flex justify-between text-sm mb-2">
                                <span class="font-medium text-gray-700 dark:text-gray-300">${item.name}</span>
                                <span class="text-gray-500 dark:text-gray-400 font-semibold">${item.level}%</span>
                            </div>
                            <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div class="h-full bg-gradient-to-r ${colorMap[cat.color]} rounded-full transition-all duration-1000 ease-out" style="width: ${item.level}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    function renderCerts() {
        const container = document.getElementById('certs-container');
        const colorMap = {
            blue: 'from-blue-500 to-cyan-500',
            green: 'from-green-500 to-emerald-500',
            purple: 'from-purple-500 to-pink-500',
            orange: 'from-orange-500 to-red-500',
            cyan: 'from-cyan-500 to-blue-500'
        };

        container.innerHTML = certsData.map(cat => {
            const title = typeof cat.title === 'object' ? cat.title[currentLang] : cat.title;
            return `
            <details class="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                <summary class="flex justify-between items-center p-6 cursor-pointer font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-gradient-to-br ${colorMap[cat.color]} rounded-lg flex items-center justify-center text-white">
                            <i class="fa-solid ${cat.icon}"></i>
                        </div>
                        <span class="text-lg">${title}</span>
                    </div>
                    <i class="fa-solid fa-chevron-down transition-transform group-open:rotate-180 text-gray-400"></i>
                </summary>

                <div class="px-6 pb-6 pt-2">
                    <div class="grid gap-3">
                        ${cat.items.map(item => `
                            <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                <i class="fa-solid fa-certificate text-blue-600 dark:text-blue-400 mt-1"></i>
                                <span class="text-sm text-gray-700 dark:text-gray-300">${item}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </details>
            `;
        }).join('');
    }

    // --- CONTROLES ---

    function changeLang(lang) {
        currentLang = lang;
        localStorage.setItem('lang', lang);
        renderAll();
    }

    // Theme Toggle
    const themeBtn = document.getElementById('themeToggle');
    const html = document.documentElement;

    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark');
    }

    themeBtn.addEventListener('click', () => {
        html.classList.toggle('dark');
        localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
    });

    // Mobile Menu
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    function toggleMobileMenu() {
        mobileMenu.classList.toggle('hidden');
    }

    mobileBtn.addEventListener('click', toggleMobileMenu);

    // Scroll to Top Button
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.remove('opacity-0', 'pointer-events-none');
            scrollTopBtn.classList.add('opacity-100');
        } else {
            scrollTopBtn.classList.add('opacity-0', 'pointer-events-none');
            scrollTopBtn.classList.remove('opacity-100');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Smooth Scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Fecha menu mobile se estiver aberto
                if (!mobileMenu.classList.contains('hidden')) {
                    toggleMobileMenu();
                }
            }
        });
    });

    // Ano no Footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Inicialização
    renderAll();

    // ScrollReveal Animations
    if (typeof ScrollReveal !== 'undefined') {
        ScrollReveal().reveal('section h2', {
            delay: 200,
            distance: '30px',
            origin: 'bottom',
            duration: 600
        });

        ScrollReveal().reveal('.hover-card', {
            interval: 150,
            distance: '40px',
            origin: 'bottom',
            duration: 600
        });

        ScrollReveal().reveal('.stat-number', {
            interval: 100,
            distance: '20px',
            origin: 'bottom',
            scale: 0.9
        });
    }

    // Animação das barras de progresso quando visíveis
    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bars = entry.target.querySelectorAll('.skill-bar');
                bars.forEach(bar => {
                    bar.style.width = bar.getAttribute('style').match(/width:\s*(\d+%)/)[1];
                });
            }
        });
    }, observerOptions);

    // Observa a seção de skills
    const skillsSection = document.getElementById('skills');
    if (skillsSection) {
        observer.observe(skillsSection);
    }

    console.log('%c👨‍💻 Portfólio desenvolvido por Carlos Henrique', 'color: #3b82f6; font-size: 16px; font-weight: bold;');
    console.log('%c🐍 Python | 📊 Data Analysis | 🤖 AI/ML | ☁️ Cloud', 'color: #60a5fa; font-size: 12px;');
