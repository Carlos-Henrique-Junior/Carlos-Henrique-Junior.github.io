import re

from app import content, engine


# ---------------------------------------------------------------- páginas
def test_home_renders_portuguese(client):
    response = client.get("/")
    assert response.status_code == 200
    html = response.text
    assert "Carlos Henrique" in html
    assert 'lang="pt-BR"' in html
    assert "/projetos/dashboard-salarios" in html
    assert html.count('class="card"') == len(content.PROJECTS)
    assert 'action="/contato?lang=pt"' in html


def test_home_english_variant(client):
    response = client.get("/?lang=en")
    assert response.status_code == 200
    assert 'lang="en"' in response.text
    assert "Software Engineer" in response.text
    assert client.cookies.get("lang") == "en"


def test_project_pages_have_own_url_and_canonical(client):
    for project in content.PROJECTS:
        response = client.get(f"/projetos/{project['slug']}")
        assert response.status_code == 200
        assert project["title"]["pt"] in response.text
        assert f'rel="canonical" href="http://testserver/projetos/{project["slug"]}"' in response.text


def test_unknown_project_returns_html_404(client):
    response = client.get("/projetos/nao-existe")
    assert response.status_code == 404
    assert "text/html" in response.headers["content-type"]
    assert "não encontrada" in response.text


def test_unknown_route_returns_html_404(client):
    response = client.get("/qualquer-coisa")
    assert response.status_code == 404
    assert "text/html" in response.headers["content-type"]


def test_privacy_page_mentions_retention(client):
    response = client.get("/privacidade")
    assert response.status_code == 200
    assert "365 dias" in response.text
    assert content.PROFILE["email"] in response.text


# ---------------------------------------------------------------- API
def test_profile_api(client):
    body = client.get("/api/v1/carlos").json()
    assert body["nome"] == content.PROFILE["nome_completo"]
    assert body["links"]["github"] == content.PROFILE["github"]
    assert body["disponivel"] is True


def test_skills_projects_experience(client):
    skills = client.get("/api/v1/carlos/skills").json()
    assert "Desenvolvimento" in skills and "Python · FastAPI" in skills["Desenvolvimento"]

    projects = client.get("/api/v1/carlos/projetos").json()
    assert len(projects) == len(content.PROJECTS)
    assert projects[0]["url"].endswith("/projetos/dashboard-salarios")

    jobs = client.get("/api/v1/carlos/experiencia").json()
    assert len(jobs) == len(content.EXPERIENCE)
    assert jobs[1]["empresa"].startswith("PGE-RJ")


def test_openapi_is_served(client):
    spec = client.get("/api/openapi.json").json()
    assert spec["info"]["title"].startswith("API do portfólio")
    assert "/api/v1/carlos" in spec["paths"]
    assert "/api/v1/xadrez/jogada" in spec["paths"]
    assert client.get("/api/docs").status_code == 200


def test_playground_metadata_exposes_real_handler_source(client):
    body = client.get("/api/v1/_playground").json()
    assert len(body) == 6
    perfil = next(item for item in body if item["path"] == "/api/v1/carlos")
    assert "def perfil()" in perfil["codigo"]
    assert "@app.get" not in perfil["codigo"]
    lance = next(item for item in body if item["path"] == "/api/v1/xadrez/lance")
    assert lance["corpo"]["profundidade"] == 3


# ---------------------------------------------------------------- xadrez
def test_chess_new_game(client):
    body = client.get("/api/v1/xadrez/nova").json()
    assert body["fen"] == engine.START_FEN
    assert body["estado"]["legais"] == 20


def test_chess_legal_moves(client):
    body = client.get("/api/v1/xadrez/legais", params={"fen": engine.START_FEN}).json()
    assert "e2e4" in body["lances"]
    assert len(body["lances"]) == 20


def test_chess_player_move_and_server_reply(client):
    body = client.post(
        "/api/v1/xadrez/jogada",
        json={"fen": engine.START_FEN, "uci": "e2e4", "profundidade": 2},
    ).json()
    assert body["jogador"]["san"] == "e4"
    assert body["servidor"] is not None
    assert body["estado"]["turno"] == "brancas"


def test_chess_illegal_move_is_refused(client):
    response = client.post(
        "/api/v1/xadrez/jogada",
        json={"fen": engine.START_FEN, "uci": "e2e5", "profundidade": 1},
    )
    assert response.status_code == 409
    assert response.json()["detail"] == "lance ilegal"


def test_chess_checkmate_is_detected(client):
    mate_in_one = "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1"
    body = client.post(
        "/api/v1/xadrez/jogada",
        json={"fen": mate_in_one, "uci": "a1a8", "profundidade": 1},
    ).json()
    assert body["servidor"] is None
    assert body["estado"]["mate"] is True


def test_chess_rejects_bad_fen(client):
    response = client.post("/api/v1/xadrez/lance", json={"fen": "x" * 30, "profundidade": 3})
    assert response.status_code in {409, 422}


# ---------------------------------------------------------------- contato
FORM = {
    "nome": "Recrutadora Teste",
    "email": "teste@exemplo.com",
    "assunto": "oportunidade",
    "mensagem": "Gostaria de conversar sobre uma vaga de engenharia.",
    "consentimento": "1",
}


def test_contact_saves_and_redirects(client, app):
    response = client.post("/contato", data=FORM, follow_redirects=False)
    assert response.status_code == 303
    assert re.search(r"/\?lang=pt&ok=CH-[0-9A-F]{6}#contato", response.headers["location"])
    assert app.state.store.total() == 1


def test_contact_without_consent_is_refused(client, app):
    data = {**FORM, "consentimento": ""}
    response = client.post("/contato", data=data)
    assert response.status_code == 400
    assert "autorizar o uso dos dados" in response.text
    assert app.state.store.total() == 0


def test_contact_invalid_email_is_refused(client, app):
    data = {**FORM, "email": "nao-e-email"}
    response = client.post("/contato", data=data)
    assert response.status_code == 400
    assert "e-mail válido" in response.text
    assert app.state.store.total() == 0


def test_contact_honeypot_is_silently_dropped(client, app):
    data = {**FORM, "site": "http://spam.example"}
    response = client.post("/contato", data=data, follow_redirects=False)
    assert response.status_code == 303
    assert "CH-BOT" in response.headers["location"]
    assert app.state.store.total() == 0


def test_contact_rate_limit(client, app):
    for index in range(3):
        response = client.post(
            "/contato", data={**FORM, "mensagem": f"mensagem numero {index}"},
            follow_redirects=False,
        )
        assert response.status_code == 303
    blocked = client.post("/contato", data={**FORM, "mensagem": "mensagem numero 4"})
    assert blocked.status_code == 429
    assert app.state.store.total() == 3


def test_retention_purges_old_rows(app):
    app.state.store.salvar(nome="Antigo", email="a@b.com", assunto="x", mensagem="mensagem antiga")
    assert app.state.store.expurgar(0) == 1
    assert app.state.store.total() == 0


# ---------------------------------------------------------------- infra
def test_security_headers(client):
    headers = client.get("/").headers
    assert "script-src 'self'" in headers["content-security-policy"]
    assert headers["x-frame-options"] == "DENY"
    assert headers["referrer-policy"] == "strict-origin-when-cross-origin"
    assert headers["x-content-type-options"] == "nosniff"


def test_static_assets_are_immutable_and_versioned(client):
    html = client.get("/").text
    match = re.search(r'/static/css/style\.css\?v=([0-9a-f]{10})', html)
    assert match, "o CSS deveria ser referenciado com hash de versão"
    response = client.get(f"/static/css/style.css?v={match.group(1)}")
    assert response.status_code == 200
    assert "immutable" in response.headers["cache-control"]


def test_sitemap_lists_projects(client):
    body = client.get("/sitemap.xml").text
    for project in content.PROJECTS:
        assert f"http://testserver/projetos/{project['slug']}" in body
    assert "http://testserver/privacidade" in body


def test_robots_disallows_api(client):
    body = client.get("/robots.txt").text
    assert "Disallow: /api/" in body
    assert "Sitemap: http://testserver/sitemap.xml" in body


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_palette_can_be_selected_and_is_remembered(client):
    default = client.get("/").text
    assert 'data-paleta="2"' in default

    first = client.get("/?paleta=1")
    assert 'data-paleta="1"' in first.text
    assert client.cookies.get("paleta") == "1"

    # sem query string, o cookie mantém a escolha
    assert 'data-paleta="1"' in client.get("/").text


def test_unknown_palette_falls_back_to_default(client):
    assert 'data-paleta="2"' in client.get("/?paleta=9").text
