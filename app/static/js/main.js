/* Boot, HUD, revelações e a cena de partículas (canvas 2D, sem dependências). */
(() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  let scene = null;

  /* ---------------------------------------------------- boot */
  const boot = $("#boot");
  if (boot) {
    if (reduced) {
      boot.remove();
    } else {
      const count = $("#bootCount");
      const bar = $("#bootBar");
      const term = $("#bootTerminal");
      const lines = [
        "> inicializando uvicorn…",
        "> carregando rotas /api/v1…",
        "> montando tabuleiro…",
        "> pronto.",
      ];
      const started = performance.now();
      const total = 1300;
      let line = 0;
      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        boot.classList.add("is-done");
        window.setTimeout(() => boot.remove(), 500);
      };

      const tick = () => {
        const p = Math.min(1, (performance.now() - started) / total);
        const value = Math.round(p * 100);
        if (count) count.textContent = String(value).padStart(3, "0");
        if (bar) bar.style.width = `${value}%`;
        const wanted = Math.min(lines.length - 1, Math.floor(p * lines.length));
        if (term && wanted !== line) {
          line = wanted;
          term.textContent = lines[line];
        }
        if (p < 1) requestAnimationFrame(tick);
        else window.setTimeout(finish, 180);
      };

      boot.addEventListener("click", finish);
      window.addEventListener("keydown", (event) => {
        if (event.key === "Escape" || event.key === "Enter" || event.key === " ") finish();
      });
      requestAnimationFrame(tick);
    }
  }

  /* ---------------------------------------------------- título letra a letra */
  $$("[data-split]").forEach((el) => {
    if (reduced) return;
    const text = el.textContent.trim();
    const words = text.split(/\s+/);
    el.textContent = "";
    // quebra por palavra: as letras animam, mas a linha só quebra entre palavras
    words.forEach((word, wordIndex) => {
      const wrapper = document.createElement("span");
      wrapper.className = "word";
      [...word].forEach((char, index) => {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = char;
        span.style.animationDelay = `${(wordIndex * 4 + index) * 24}ms`;
        wrapper.append(span);
      });
      el.append(wrapper);
      if (wordIndex < words.length - 1) el.append(document.createTextNode(" "));
    });
  });

  /* ---------------------------------------------------- contadores */
  const counters = $$("[data-count]");
  if (counters.length) {
    const run = (el) => {
      const target = Number(el.dataset.count || 0);
      if (reduced || !target) { el.textContent = String(target); return; }
      const start = performance.now();
      const step = () => {
        const p = Math.min(1, (performance.now() - start) / 900);
        el.textContent = String(Math.round(target * p));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------- HUD */
  const sections = $$("[data-section]");
  const hudSection = $("#hudSection");
  const hudPct = $("#hudPct");
  const hudXY = $("#hudXY");
  const hudClock = $("#hudClock");

  const pad = (n, len = 2) => String(n).padStart(len, "0");
  const clockFmt = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const tickClock = () => { if (hudClock) hudClock.textContent = clockFmt.format(new Date()); };
  tickClock();
  window.setInterval(tickClock, 1000);

  if (hudXY) {
    let raf = 0;
    window.addEventListener("pointermove", (event) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        hudXY.textContent = `x ${pad(event.clientX, 4)} · y ${pad(event.clientY, 4)}`;
        raf = 0;
      });
    }, { passive: true });
  }

  if (sections.length && hudSection) {
    let index = 0;
    const setActive = () => {
      const y = window.scrollY + window.innerHeight * 0.35;
      let current = 0;
      sections.forEach((section, i) => { if (section.offsetTop <= y) current = i; });
      index = current;
      hudSection.textContent = `[${pad(index + 1)}/${pad(sections.length)}] ${sections[index].dataset.section}`;
      scene?.focus(index);
    };

    const setPct = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
      if (hudPct) hudPct.textContent = pad(pct, 3);
    };

    let scrolling = false;
    window.addEventListener("scroll", () => {
      if (scrolling) return;
      scrolling = true;
      requestAnimationFrame(() => { setActive(); setPct(); scrolling = false; });
    }, { passive: true });
    window.addEventListener("resize", () => { setActive(); setPct(); });
    setActive();
    setPct();
  }

  /* ---------------------------------------------------- cena */
  const canvas = $("#scene");

  if (canvas && !reduced) {
    const ctx = canvas.getContext("2d", { alpha: true });
    if (ctx) scene = createScene(canvas, ctx);
  }

  function createScene(canvasEl, ctx) {
    const SHAPES = 5;
    // a cor das partículas vem da paleta ativa (--accent-rgb)
    const rawAccent = getComputedStyle(document.documentElement).getPropertyValue("--accent-rgb").trim();
    const [ar, ag, ab] = (rawAccent || "2 151 222").split(/[\s,]+/).map(Number);
    let width = 0, height = 0, dpr = 1;
    let count = 0;
    let positions, targets, seeds;
    let active = 0;
    let visible = true;
    let raf = 0;
    const start = performance.now();

    const rand = (a, b) => a + Math.random() * (b - a);

    function shapeFor(kind, n) {
      const out = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const t = i / n;
        let x = 0, y = 0, z = 0;
        if (kind === 0) {                       // esfera
          const phi = Math.acos(1 - 2 * (i + 0.5) / n);
          const theta = Math.PI * (1 + Math.sqrt(5)) * i;
          const r = 1.55 + rand(-0.04, 0.04);
          x = Math.sin(phi) * Math.cos(theta) * r;
          y = Math.cos(phi) * r;
          z = Math.sin(phi) * Math.sin(theta) * r;
        } else if (kind === 1) {                // nó toroidal
          const p = t * Math.PI * 2;
          const q = 3 * p;
          const r = 1.05 + 0.34 * Math.cos(q);
          x = r * Math.cos(2 * p);
          y = r * Math.sin(2 * p);
          z = 0.44 * Math.sin(q);
        } else if (kind === 2) {                // cubo em grade
          const face = Math.floor(Math.random() * 6);
          const axis = Math.floor(face / 2);
          const sign = face % 2 ? 1 : -1;
          const u = rand(-1, 1), v = rand(-1, 1);
          const p = [0, 0, 0];
          p[axis] = sign * 1.25;
          p[(axis + 1) % 3] = u * 1.25;
          p[(axis + 2) % 3] = v * 1.25;
          [x, y, z] = p;
        } else if (kind === 3) {                // hélice dupla
          const p = t * Math.PI * 7;
          const strand = i % 2 ? 0 : Math.PI;
          x = Math.cos(p + strand) * 1.15;
          z = Math.sin(p + strand) * 1.15;
          y = (t - 0.5) * 2.6;
        } else {                                // galáxia
          const arms = 4;
          const arm = i % arms;
          const r = Math.pow(Math.random(), 0.6) * 1.9;
          const angle = arm * (Math.PI * 2 / arms) + r * 2.4 + rand(-0.18, 0.18);
          x = Math.cos(angle) * r;
          z = Math.sin(angle) * r;
          y = rand(-0.14, 0.14) * (1.6 - r * 0.5);
        }
        out[i * 3] = x;
        out[i * 3 + 1] = y;
        out[i * 3 + 2] = z;
      }
      return out;
    }

    function buildTargets() {
      targets = [];
      for (let k = 0; k < SHAPES; k++) targets.push(shapeFor(k, count));
    }

    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = canvasEl.clientWidth;
      height = canvasEl.clientHeight;
      canvasEl.width = Math.round(width * dpr);
      canvasEl.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      count = window.innerWidth < 760 ? 700 : 1600;
      positions = new Float32Array(count * 3);
      seeds = new Float32Array(count);
      const base = shapeFor(0, count);
      positions.set(base);
      for (let i = 0; i < count; i++) seeds[i] = Math.random();
      buildTargets();
    }

    function frame() {
      raf = 0;
      if (!visible) return;
      const t = (performance.now() - start) / 1000;
      const target = targets[active];

      ctx.clearRect(0, 0, width, height);

      const focal = Math.min(width, height) * 0.34;
      const cosA = Math.cos(t * 0.12);
      const sinA = Math.sin(t * 0.12);
      // no desktop a cena fica atrás do retrato, longe do texto
      const cx = width > 980 ? width * 0.66 : width * 0.5;
      const cy = height * 0.46;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        // morph suave entre a posição atual e a forma do capítulo ativo
        positions[i3] += (target[i3] - positions[i3]) * 0.045;
        positions[i3 + 1] += (target[i3 + 1] - positions[i3 + 1]) * 0.045;
        positions[i3 + 2] += (target[i3 + 2] - positions[i3 + 2]) * 0.045;

        const x = positions[i3] * cosA - positions[i3 + 2] * sinA;
        const z = positions[i3] * sinA + positions[i3 + 2] * cosA;
        const y = positions[i3 + 1] + Math.sin(t * 0.6 + seeds[i] * 6.28) * 0.03;
        const scale = focal / (3.6 + z);
        const sx = cx + x * scale;
        const sy = cy + y * scale;

        const depth = Math.max(0.06, Math.min(1, (2.2 - z) / 3.4));
        const size = depth > 0.7 ? 1.8 : 1.2;
        ctx.fillStyle = `rgba(${ar}, ${ag}, ${ab}, ${0.08 + depth * 0.5})`;
        ctx.fillRect(sx, sy, size, size);
      }
      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => {
      visible = !document.hidden;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    });
    raf = requestAnimationFrame(frame);

    return {
      focus(index) {
        active = ((index % SHAPES) + SHAPES) % SHAPES;
      },
    };
  }
})();
