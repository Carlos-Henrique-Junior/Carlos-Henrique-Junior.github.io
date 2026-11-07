/* Xadrez: o navegador só desenha. Legalidade e resposta vêm do servidor. */
(() => {
  "use strict";

  const boardEl = document.getElementById("board");
  if (!boardEl) return;

  const statusEl = document.getElementById("chessStatus");
  const logEl = document.getElementById("chessLog");
  const newBtn = document.querySelector('[data-chess="new"]');
  const undoBtn = document.querySelector('[data-chess="undo"]');

  const GLYPH = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
  const NAME = { k: "rei", q: "dama", r: "torre", b: "bispo", n: "cavalo", p: "peão" };
  const FILES = "abcdefgh";

  let fen = "";
  let initial = "";
  let history = [];
  let selected = null;
  let legal = [];
  let lastMove = null;
  let busy = false;
  let over = false;

  const squares = [];

  const say = (text) => { if (statusEl) statusEl.textContent = text; };

  const parse = (value) => {
    const [placement, turn] = value.split(" ");
    const grid = new Array(64).fill(null);
    let index = 0;
    for (const char of placement) {
      if (char === "/") continue;
      if (/\d/.test(char)) { index += Number(char); continue; }
      grid[index] = char;
      index += 1;
    }
    return { grid, turn };
  };

  const squareName = (index) => `${FILES[index % 8]}${8 - Math.floor(index / 8)}`;

  const build = () => {
    boardEl.innerHTML = "";
    squares.length = 0;
    for (let i = 0; i < 64; i++) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `sq ${(Math.floor(i / 8) + (i % 8)) % 2 === 0 ? "sq--light" : "sq--dark"}`;
      button.dataset.i = String(i);
      const coord = document.createElement("span");
      coord.className = "sq__coord";
      coord.textContent = squareName(i);
      button.append(coord);
      button.addEventListener("click", () => onClick(i));
      boardEl.append(button);
      squares.push(button);
    }
  };

  const paint = () => {
    const { grid, turn } = parse(fen);
    squares.forEach((button, i) => {
      const piece = grid[i];
      button.querySelector(".piece")?.remove();
      button.classList.remove("is-sel", "is-last", "is-target");
      if (piece) {
        const span = document.createElement("span");
        span.className = `piece ${piece === piece.toUpperCase() ? "piece--w" : "piece--b"}`;
        span.textContent = GLYPH[piece.toLowerCase()] || "";
        span.setAttribute("aria-hidden", "true");
        button.append(span);
        const color = piece === piece.toUpperCase() ? "branca" : "preta";
        button.setAttribute("aria-label", `${squareName(i)}, ${NAME[piece.toLowerCase()]} ${color}`);
      } else {
        button.setAttribute("aria-label", `${squareName(i)}, vazia`);
      }
    });

    if (selected !== null) squares[selected]?.classList.add("is-sel");
    legal.forEach((uci) => {
      const target = FILES.indexOf(uci.slice(2, 3)) + (8 - Number(uci.slice(3, 4))) * 8;
      squares[target]?.classList.add("is-target");
    });
    if (lastMove) {
      [lastMove.from, lastMove.to].forEach((name) => {
        const idx = FILES.indexOf(name[0]) + (8 - Number(name[1])) * 8;
        squares[idx]?.classList.add("is-last");
      });
    }
    boardEl.setAttribute("aria-busy", String(busy));
    void turn;
  };

  const api = async (path, options) => {
    const response = await fetch(path, options);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.detail || `HTTP ${response.status}`);
    return body;
  };

  const loadLegal = async () => {
    try {
      const data = await api(`/api/v1/xadrez/legais?fen=${encodeURIComponent(fen)}`);
      legal = selected === null ? [] : data.lances.filter((uci) => uci.startsWith(squareName(selected)));
    } catch {
      legal = [];
    }
    paint();
  };

  const onClick = async (index) => {
    if (busy || over) return;
    const { grid, turn } = parse(fen);
    if (turn !== "w") return;
    const piece = grid[index];

    if (selected === null) {
      if (!piece || piece !== piece.toUpperCase()) {
        say("escolha uma peça branca");
        return;
      }
      selected = index;
      await loadLegal();
      return;
    }

    if (index === selected) {
      selected = null;
      legal = [];
      paint();
      return;
    }

    if (piece && piece === piece.toUpperCase()) {
      selected = index;
      await loadLegal();
      return;
    }

    const uci = `${squareName(selected)}${squareName(index)}`;
    if (legal.length && !legal.includes(uci) && !legal.includes(`${uci}q`)) {
      say("lance ilegal para esta peça");
      return;
    }
    await play(uci);
  };

  const stateText = (estado) => {
    if (estado.mate) {
      return estado.turno === "brancas" ? "xeque-mate. o servidor venceu." : "xeque-mate. você venceu!";
    }
    if (estado.afogamento) return "afogamento. empate.";
    if (estado.empate) return "material insuficiente. empate.";
    if (estado.xeque) return `xeque nas ${estado.turno}. sua vez.`;
    return "sua vez.";
  };

  const play = async (uci) => {
    busy = true;
    selected = null;
    legal = [];
    paint();
    say("pensando…");
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    try {
      const data = await api("/api/v1/xadrez/jogada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fen, uci, profundidade: 3 }),
      });
      fen = data.fen;
      lastMove = { from, to };
      history.push(fen);
      if (logEl) {
        const mine = document.createElement("li");
        mine.textContent = `você · ${data.jogador.san}`;
        logEl.prepend(mine);
        if (data.servidor) {
          const theirs = document.createElement("li");
          theirs.textContent = `servidor · ${data.servidor.san}`;
          logEl.prepend(theirs);
        }
      }
      over = data.estado.fim;
      say(stateText(data.estado));
    } catch (error) {
      say(`não foi possível jogar: ${error.message}`);
    } finally {
      busy = false;
      paint();
    }
  };

  const reset = async () => {
    try {
      const data = await api("/api/v1/xadrez/nova");
      fen = data.fen;
      initial = data.fen;
      history = [fen];
      selected = null;
      legal = [];
      lastMove = null;
      over = false;
      if (logEl) logEl.innerHTML = "";
      say("sua vez. você joga de brancas.");
      paint();
    } catch {
      say("não foi possível iniciar a partida");
    }
  };

  const undo = () => {
    if (busy || history.length < 2) return;
    history.pop();
    fen = history[history.length - 1];
    selected = null;
    legal = [];
    lastMove = null;
    over = false;
    if (logEl?.firstElementChild) {
      logEl.firstElementChild.remove();
      logEl.firstElementChild?.remove();
    }
    say("lance desfeito. sua vez.");
    paint();
  };

  build();
  newBtn?.addEventListener("click", reset);
  undoBtn?.addEventListener("click", undo);
  reset();
  void initial;
})();
