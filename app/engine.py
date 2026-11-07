"""Xadrez server-side: regras completas (python-chess) + negamax alfa-beta.

O tabuleiro do visitante nunca decide se um lance é legal: quem valida é esta
camada, que também gera a resposta do "oponente".
"""

from __future__ import annotations

import chess

PIECE_VALUE = {
    chess.PAWN: 100,
    chess.KNIGHT: 320,
    chess.BISHOP: 330,
    chess.ROOK: 500,
    chess.QUEEN: 900,
    chess.KING: 0,
}

CENTER = (chess.D4, chess.E4, chess.D5, chess.E5)
START_FEN = chess.STARTING_FEN
MAX_DEPTH = 4


def _center_bonus(square: chess.Square, piece_type: int) -> int:
    if piece_type in (chess.KING, chess.PAWN):
        return 0
    return (4 - min(chess.square_distance(square, c) for c in CENTER)) * 6


def evaluate(board: chess.Board) -> int:
    """Score do ponto de vista de quem tem o lance."""
    if board.is_checkmate():
        return -100_000
    if board.is_game_over():
        return 0
    white = black = 0
    for square, piece in board.piece_map().items():
        value = PIECE_VALUE[piece.piece_type] + _center_bonus(square, piece.piece_type)
        if piece.color == chess.WHITE:
            white += value
        else:
            black += value
    score = white - black
    return score if board.turn == chess.WHITE else -score


def _negamax(board: chess.Board, depth: int, alpha: int, beta: int) -> int:
    if depth == 0 or board.is_game_over():
        return evaluate(board)
    best = -10**9
    for move in board.legal_moves:
        board.push(move)
        value = -_negamax(board, depth - 1, -beta, -alpha)
        board.pop()
        if value > best:
            best = value
        if value > alpha:
            alpha = value
        if alpha >= beta:
            break
    return best


def _pick(board: chess.Board, depth: int) -> tuple[chess.Move, int]:
    def order(move: chess.Move) -> int:
        target = board.piece_at(move.to_square)
        return PIECE_VALUE.get(target.piece_type, 0) if target else 0

    best_value = -10**9
    chosen: chess.Move | None = None
    for move in sorted(board.legal_moves, key=order, reverse=True):
        board.push(move)
        value = -_negamax(board, depth - 1, -10**9, -best_value)
        board.pop()
        if value > best_value:
            best_value = value
            chosen = move
    assert chosen is not None
    return chosen, best_value


def _status(board: chess.Board) -> dict:
    return {
        "xeque": board.is_check(),
        "mate": board.is_checkmate(),
        "afogamento": board.is_stalemate(),
        "empate": board.is_insufficient_material() or board.is_seventyfive_moves(),
        "fim": board.is_game_over(),
        "turno": "brancas" if board.turn == chess.WHITE else "pretas",
        "legais": board.legal_moves.count(),
    }


def nova() -> dict:
    return {"fen": START_FEN, "estado": _status(chess.Board(START_FEN))}


def legais(fen: str) -> list[str]:
    """Lances legais da posição — o tabuleiro usa isto para destacar destinos."""
    board = chess.Board(fen)
    return [move.uci() for move in board.legal_moves]


def novo_lance(fen: str, depth: int = 3) -> dict:
    """Só o lance do servidor, sem lance do visitante (usado pelo playground)."""
    if depth < 1 or depth > MAX_DEPTH:
        raise ValueError(f"profundidade deve estar entre 1 e {MAX_DEPTH}")
    board = chess.Board(fen)
    if board.is_game_over():
        raise ValueError("a partida já terminou nesta posição")
    move, value = _pick(board, depth)
    san = board.san(move)
    board.push(move)
    return {
        "fen": board.fen(),
        "jogador": None,
        "servidor": {"uci": move.uci(), "san": san, "avaliacao": value},
        "estado": _status(board),
        "profundidade": depth,
    }


def jogada(fen: str, uci: str, depth: int = 3) -> dict:
    """Aplica o lance do visitante (validado) e responde com o lance do servidor."""
    if depth < 1 or depth > MAX_DEPTH:
        raise ValueError(f"profundidade deve estar entre 1 e {MAX_DEPTH}")
    board = chess.Board(fen)
    if board.is_game_over():
        raise ValueError("a partida já terminou nesta posição")

    move = chess.Move.from_uci(uci.strip().lower())
    # promoção: o tabuleiro manda "e7e8"; o servidor completa para dama
    if move not in board.legal_moves:
        promoted = chess.Move.from_uci(move.uci() + "q")
        if promoted not in board.legal_moves:
            raise ValueError("lance ilegal")
        move = promoted

    san_player = board.san(move)
    board.push(move)
    player = {"uci": move.uci(), "san": san_player}

    reply = None
    if not board.is_game_over():
        ai_move, value = _pick(board, depth)
        reply = {"uci": ai_move.uci(), "san": board.san(ai_move), "avaliacao": value}
        board.push(ai_move)

    return {
        "fen": board.fen(),
        "jogador": player,
        "servidor": reply,
        "estado": _status(board),
        "profundidade": depth,
    }
