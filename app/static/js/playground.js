/* Playground: consome a API real deste servidor e mostra o handler que responde. */
(() => {
  "use strict";

  const root = document.getElementById("console");
  if (!root) return;

  const listEl = document.getElementById("endpoints");
  const outEl = document.querySelector("#consoleOut code");
  const statusEl = document.getElementById("resStatus");
  const methodEl = document.getElementById("reqMethod");
  const pathEl = document.getElementById("reqPath");
  const sendBtn = document.getElementById("sendBtn");
  const tabs = [...root.querySelectorAll(".console__tab")];

  let endpoints = [];
  let current = 0;
  let tab = "code";
  let inFlight = false;
  let lastResponse = null;
  let visible = false;

  const escape = (text) => text.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

  const colorJson = (value) => {
    const text = escape(JSON.stringify(value, null, 2));
    return text
      .replace(/("(?:[^"\\]|\\.)*")(\s*:)/g, '<span class="tok-key">$1</span>$2')
      .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span class="tok-str">$1</span>')
      .replace(/\b(true|false|null)\b/g, '<span class="tok-kw">$1</span>')
      .replace(/:\s*(-?\d+(?:\.\d+)?)/g, ': <span class="tok-num">$1</span>');
  };

  const render = () => {
    const ep = endpoints[current];
    if (!ep) return;
    sendBtn.classList.toggle("is-pulse", !inFlight && !(lastResponse && lastResponse.path === ep.path));

    if (tab === "code") {
      statusEl.textContent = "python · fastapi";
      outEl.innerHTML = escape(ep.codigo)
        .split("\n")
        .map((line) => (line.trim().startsWith("#")
          ? `<span class="tok-com">${line}</span>`
          : line))
        .join("\n");
      return;
    }
    if (inFlight) {
      statusEl.textContent = "enviando…";
      outEl.innerHTML = `<span class="tok-com">// ${ep.method} ${ep.path}</span>`;
      return;
    }
    if (lastResponse && lastResponse.path === ep.path) {
      statusEl.innerHTML = `<b>${lastResponse.status}</b> · ${lastResponse.ms}ms · application/json`;
      outEl.innerHTML = colorJson(lastResponse.body);
      return;
    }
    statusEl.textContent = "";
    outEl.textContent = "> nenhuma requisição enviada ainda. Escolha um endpoint e clique em request.";
  };

  const setTab = (name) => {
    tab = name;
    tabs.forEach((el) => {
      const on = el.dataset.tab === name;
      el.classList.toggle("is-on", on);
      el.setAttribute("aria-selected", String(on));
    });
    render();
  };

  const select = (index) => {
    current = index;
    const ep = endpoints[current];
    methodEl.textContent = ep.method;
    methodEl.classList.toggle("is-post", ep.method === "POST");
    pathEl.textContent = ep.path;
    [...listEl.querySelectorAll(".ep")].forEach((el, i) => {
      const on = i === index;
      el.classList.toggle("is-on", on);
      el.setAttribute("aria-selected", String(on));
    });
    lastResponse = null;
    setTab("code");
  };

  const send = async () => {
    const ep = endpoints[current];
    if (!ep || inFlight) return;
    inFlight = true;
    setTab("response");
    const started = performance.now();
    try {
      const init = { method: ep.method, headers: { Accept: "application/json" } };
      if (ep.method === "POST") {
        init.headers["Content-Type"] = "application/json";
        init.body = JSON.stringify(ep.corpo || {});
      }
      const response = await fetch(ep.path, init);
      const ms = Math.round(performance.now() - started);
      const text = await response.text();
      let body;
      try { body = JSON.parse(text); } catch { body = { raw: text.slice(0, 2000) }; }
      lastResponse = { path: ep.path, status: response.status, ms, body };
    } catch (error) {
      lastResponse = {
        path: ep.path, status: 0, ms: Math.round(performance.now() - started),
        body: { erro: String(error) },
      };
    } finally {
      inFlight = false;
      render();
    }
  };

  const boot = async () => {
    try {
      const response = await fetch("/api/v1/_playground");
      endpoints = await response.json();
    } catch {
      return;
    }
    listEl.innerHTML = "";
    endpoints.forEach((ep, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `ep${ep.method === "POST" ? " ep--post" : ""}`;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", "false");
      button.innerHTML = `<b>${ep.method}</b><span>${ep.path.replace("/api/v1", "")}</span>`;
      button.addEventListener("click", () => select(index));
      listEl.append(button);
    });
    select(0);
  };

  sendBtn.addEventListener("click", send);
  tabs.forEach((el) => el.addEventListener("click", () => setTab(el.dataset.tab)));

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? false;
    }, { threshold: 0.2 }).observe(root);
  }

  window.addEventListener("keydown", (event) => {
    if (visible && event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      send();
    }
  });

  boot();
})();
