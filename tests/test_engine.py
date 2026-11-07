import chess
import pytest

from app import engine


def test_start_position_has_twenty_moves():
    assert len(engine.legais(engine.START_FEN)) == 20


def test_engine_finds_the_only_mate():
    position = "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1"
    result = engine.novo_lance(position, 2)
    assert result["servidor"]["san"] == "Ra8#"
    assert result["estado"]["mate"] is True


def test_engine_plays_a_sane_opening_move():
    result = engine.novo_lance(engine.START_FEN, 2)
    assert result["servidor"]["uci"] in {"e2e4", "d2d4", "g1f3", "c2c4"}


def test_promotion_defaults_to_queen():
    position = "8/4P3/8/8/8/8/8/K6k w - - 0 1"
    result = engine.jogada(position, "e7e8", 1)
    assert result["jogador"]["uci"] == "e7e8q"
    assert result["jogador"]["san"] == "e8=Q"


def test_illegal_move_raises():
    with pytest.raises(ValueError, match="ilegal"):
        engine.jogada(engine.START_FEN, "e2e5")


def test_depth_is_bounded():
    with pytest.raises(ValueError, match="profundidade"):
        engine.novo_lance(engine.START_FEN, engine.MAX_DEPTH + 1)


def test_finished_game_is_refused():
    with pytest.raises(ValueError, match="terminou"):
        engine.novo_lance("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1", 2)


def test_insufficient_material_is_a_draw():
    board = chess.Board("7k/8/6K1/8/8/8/8/8 w - - 0 1")
    assert board.is_insufficient_material() is True
    assert engine._status(board)["empate"] is True
