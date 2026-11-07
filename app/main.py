"""Aplicação que serve o portfólio (HTML) e a API real no mesmo processo."""

from __future__ import annotations

import hashlib
import inspect
import os
import random
import re
import time
from dataclasses import dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from xml.sax.saxutils import escape

from fastapi import FastAPI, Form, Request
from fastapi.responses import (
    FileResponse,
    HTMLResponse,
    JSONResponse,
    PlainTextResponse,
    RedirectResponse,
)
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field
from starlette.exceptions import HTTPException as StarletteHTTPException

from . import content, engine
from .store import Store

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
TEMPLATES_DIR = BASE_DIR / "templates"
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$")


@dataclass
class Settings:
    site_url: str = field(default_factory=lambda: os.getenv("SITE_URL", "http://127.0.0.1:8000").rstrip("/"))
    data_dir: Path = field(default_factory=lambda: Path(os.getenv("DATA_DIR", "data")))
    contact_limit_per_hour: int = int(os.getenv("CONTACT_LIMIT_PER_HOUR", "8"))
    retention_days: int = int(os.getenv("CONTACT_RETENTION_DAYS", "365"))


class LanceIn(BaseModel):
    fen: str = Field(min_length=20, max_length=120)
    profundidade: int = Field(default=3, ge=1, le=engine.MAX_DEPTH)


class JogadaIn(LanceIn):
    uci: str = Field(min_length=4, max_length=5)


class Resposta(BaseModel):
    fen: str
    jogador: dict | None = None
    servidor: dict | None = None
    estado: dict


class _RateLimit:
    """Janela deslizante em memória. Não guarda IP: só o digest efêmero."""

    def __init__(self, limit: int, window: float = 3600.0) -> None:
        self.limit = limit
        self.window = window
        self.hits: dict[str, list[float]] = {}

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        if len(self.hits) > 5000:  # higiene: nunca cresce sem limite
            self.hits = {k: v for k, v in self.hits.items() if v and now - v[-1] < self.window}
        bucket = [t for t in self.hits.get(key, []) if now - t < self.window]
        if len(bucket) >= self.limit:
            self.hits[key] = bucket
            return False
        bucket.append(now)
        self.hits[key] = bucket
        return True


def _asset_version(name: str) -> str:
    """Hash do conteúdo: muda quando o arquivo muda, então a URL nunca serve CSS velho."""
    path = STATIC_DIR / name
    try:
        return hashlib.sha256(path.read_bytes()).hexdigest()[:10]
    except OSError:
        return "0"


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()
    site_url = settings.site_url

    app = FastAPI(
        title="API do portfólio — Carlos Henrique",
        version="1.0.0",
        description=(
            "Currículo consumível: perfil, competências, projetos, experiência e xadrez. "
            "O site é renderizado pelo mesmo processo que responde estes endpoints."
        ),
        docs_url="/api/docs",
        redoc_url=None,
        openapi_url="/api/openapi.json",
    )
    app.state.settings = settings
    app.state.store = Store.open(Path(settings.data_dir))
    app.state.rate = _RateLimit(settings.contact_limit_per_hour)

    def asset(name: str) -> str:
        try:
            digest = _asset_version(name)
        except OSError:
            digest = "0"
        return f"/static/{name}?v={digest}"

    templates = Jinja2Templates(directory=str(TEMPLATES_DIR))
    templates.env.globals.update(
        asset=asset,
        year=datetime.now(UTC).year,
        profile=content.PROFILE,
        projects=content.PROJECTS,
    )

    # ------------------------------------------------------------ helpers
    def lang_of(request: Request) -> str:
        wanted = request.query_params.get("lang")
        if wanted in content.STRINGS:
            return wanted
        cookie = request.cookies.get("lang")
        return cookie if cookie in content.STRINGS else "pt"

    def palette_of(request: Request) -> str:
        """Paleta 1 (#000/#ECD3B5/#E9E9E9) ou 2 (#02070A/#0297DE/#FC734D)."""
        wanted = request.query_params.get("paleta")
        if wanted in {"1", "2"}:
            return wanted
        cookie = request.cookies.get("paleta")
        return cookie if cookie in {"1", "2"} else "2"

    def base_context(request: Request, page: str, title: str, description: str) -> dict:
        lang = lang_of(request)
        other = "en" if lang == "pt" else "pt"
        path = request.url.path
        canonical = f"{site_url}{path}" + ("" if lang == "pt" else "?lang=en")
        alt = f"{site_url}{path}" + ("" if other == "pt" else "?lang=en")
        return {
            "request": request,
            "lang": lang,
            "t": content.STRINGS[lang],
            "canonical": canonical,
            "alt_url": alt,
            "alt_lang": other,
            "title": title,
            "description": description,
            "quote": random.choice(content.QUOTES),
            "page": page,
            "paleta": palette_of(request),
        }

    def render(request: Request, template: str, page: str, title: str, description: str,
               status_code: int = 200, **extra) -> HTMLResponse:
        ctx = base_context(request, page, title, description)
        ctx.update(extra)
        response = templates.TemplateResponse(request, template, ctx, status_code=status_code)
        if request.query_params.get("lang") in content.STRINGS:
            response.set_cookie("lang", ctx["lang"], max_age=31536000, httponly=True, samesite="lax")
        if request.query_params.get("paleta") in {"1", "2"}:
            response.set_cookie("paleta", ctx["paleta"], max_age=31536000, httponly=True, samesite="lax")
        return response

    def page_title(lang: str) -> str:
        role = content.STRINGS[lang]["hero_role"]
        name = content.PROFILE["nome"]
        return f"{name} | {role}" if lang == "pt" else f"{name} | Software Engineer · AI"

    # ------------------------------------------------------------ páginas
    @app.get("/", response_class=HTMLResponse, tags=["site"], include_in_schema=False)
    def home(request: Request):
        lang = lang_of(request)
        ok = request.query_params.get("ok")
        errors = request.query_params.get("erro")
        title = content.STRINGS[lang]["hero_summary"][:150]
        return render(
            request,
            "index.html",
            "inicio",
            page_title(lang),
            title,
            projects=content.PROJECTS,
            experience=content.EXPERIENCE,
            skills=content.SKILLS,
            education=content.EDUCATION,
            protocolo=ok,
            form_errors=errors.split(",") if errors else None,
        )

    @app.get("/projetos/{slug}", response_class=HTMLResponse, tags=["site"], include_in_schema=False)
    def projeto(request: Request, slug: str):
        item = next((p for p in content.PROJECTS if p["slug"] == slug), None)
        if item is None:
            raise StarletteHTTPException(status_code=404)
        lang = lang_of(request)
        return render(
            request,
            "projeto.html",
            "projetos",
            f"{item['title'][lang]} | {content.PROFILE['nome']}",
            item["summary"][lang],
            projeto=item,
        )

    @app.get("/privacidade", response_class=HTMLResponse, tags=["site"], include_in_schema=False)
    def privacidade(request: Request):
        lang = lang_of(request)
        return render(
            request,
            "privacidade.html",
            "privacidade",
            f"{content.STRINGS[lang]['privacy']} | {content.PROFILE['nome']}",
            "Aviso de privacidade: quais dados este site coleta, por quê, por quanto tempo e como pedir remoção.",
            retention_days=settings.retention_days,
        )

    @app.post("/contato", tags=["site"], include_in_schema=False)
    def contato(
        request: Request,
        nome: str = Form(default=""),
        email: str = Form(default=""),
        assunto: str = Form(default=""),
        mensagem: str = Form(default=""),
        consentimento: str = Form(default=""),
        site: str = Form(default=""),
    ):
        lang = lang_of(request)
        values = {"nome": nome, "email": email, "assunto": assunto, "mensagem": mensagem}
        erros: list[str] = []
        nome, email, assunto, mensagem = nome.strip(), email.strip(), assunto.strip(), mensagem.strip()

        if not 2 <= len(nome) <= 80:
            erros.append("nome")
        if not EMAIL_RE.match(email) or len(email) > 160:
            erros.append("email")
        if len(assunto) > 60:
            erros.append("assunto")
        if not 10 <= len(mensagem) <= 2000:
            erros.append("mensagem")
        if consentimento not in {"1", "on", "true"}:
            erros.append("consentimento")

        # honeypot: bot preenche campo oculto; resposta é idêntica para não ensinar o robô
        if site.strip():
            return RedirectResponse(f"/?lang={lang}&ok=CH-BOT#contato", status_code=303)

        if erros:
            return render(
                request, "index.html", "inicio", page_title(lang),
                content.STRINGS[lang]["hero_summary"][:150],
                status_code=400,
                projects=content.PROJECTS, experience=content.EXPERIENCE,
                skills=content.SKILLS, education=content.EDUCATION,
                form_errors=erros, form_values=values, protocolo=None,
            )

        ip = request.client.host if request.client else "desconhecido"
        key = hashlib.sha256(f"{ip}{site_url}".encode()).hexdigest()[:16]
        if not app.state.rate.allow(key):
            return render(
                request, "index.html", "inicio", page_title(lang),
                content.STRINGS[lang]["hero_summary"][:150],
                status_code=429,
                projects=content.PROJECTS, experience=content.EXPERIENCE,
                skills=content.SKILLS, education=content.EDUCATION,
                form_errors=["limite"], form_values=values, protocolo=None,
            )

        protocolo = app.state.store.salvar(
            nome=nome, email=email, assunto=assunto or "oportunidade", mensagem=mensagem
        )
        return RedirectResponse(f"/?lang={lang}&ok={protocolo}#contato", status_code=303)

    # ------------------------------------------------------------ API JSON
    @app.get("/health", tags=["infra"])
    def health() -> dict:
        return {"status": "ok"}

    @app.get("/api/v1/carlos", tags=["perfil"], summary="Perfil público")
    def perfil() -> dict:
        return {
            "nome": content.PROFILE["nome_completo"],
            "cargo": "Engenheiro de Software — IA generativa, Python e dados",
            "localizacao": content.PROFILE["local"]["pt"],
            "modalidades": ["Remoto", "Híbrido"],
            "foco": ["Python", "FastAPI", "LLMs", "RAG", "Dados"],
            "links": {
                "portfolio": site_url,
                "github": content.PROFILE["github"],
                "linkedin": content.PROFILE["linkedin"],
                "email": content.PROFILE["email"],
            },
            "disponivel": True,
        }

    @app.get("/api/v1/carlos/skills", tags=["perfil"], summary="Competências por área")
    def skills() -> dict:
        return {item["title"]["pt"]: item["items"] for item in content.SKILLS}

    @app.get("/api/v1/carlos/projetos", tags=["perfil"], summary="Projetos publicados")
    def projetos() -> list[dict]:
        return [
            {
                "slug": item["slug"],
                "nome": item["title"]["pt"],
                "categoria": item["kind"],
                "ano": item["year"],
                "stack": item["stack"],
                "url": f"{site_url}/projetos/{item['slug']}",
            }
            for item in content.PROJECTS
        ]

    @app.get("/api/v1/carlos/experiencia", tags=["perfil"], summary="Experiência profissional")
    def experiencia() -> list[dict]:
        return [
            {"periodo": item["period"], "cargo": item["role"]["pt"], "empresa": item["company"]}
            for item in content.EXPERIENCE
        ]

    @app.get("/api/v1/xadrez/nova", response_model=Resposta, tags=["xadrez"], summary="Posição inicial")
    def xadrez_nova() -> dict:
        return engine.nova()

    @app.get("/api/v1/xadrez/legais", tags=["xadrez"], summary="Lances legais de uma posição")
    def xadrez_legais(fen: str) -> JSONResponse:
        try:
            return JSONResponse({"fen": fen, "lances": engine.legais(fen)})
        except ValueError:
            return JSONResponse({"detail": "FEN inválida"}, status_code=422)

    @app.post("/api/v1/xadrez/jogada", response_model=Resposta, tags=["xadrez"],
              summary="Lance do visitante + resposta do servidor")
    def xadrez_jogada(payload: JogadaIn) -> JSONResponse:
        try:
            return JSONResponse(engine.jogada(payload.fen, payload.uci, payload.profundidade))
        except ValueError as exc:
            return JSONResponse({"detail": str(exc)}, status_code=409)

    @app.post("/api/v1/xadrez/lance", tags=["xadrez"], summary="Melhor lance para uma posição")
    def xadrez_lance(payload: LanceIn) -> JSONResponse:
        try:
            return JSONResponse(engine.novo_lance(payload.fen, payload.profundidade))
        except ValueError as exc:
            return JSONResponse({"detail": str(exc)}, status_code=409)

    # ------------------------------------------------------------ infra do site
    @app.get("/robots.txt", response_class=PlainTextResponse, include_in_schema=False)
    def robots() -> str:
        return f"User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: {site_url}/sitemap.xml\n"

    @app.get("/sitemap.xml", include_in_schema=False)
    def sitemap() -> PlainTextResponse:
        today = datetime.now(UTC).date().isoformat()
        urls = [("/", "1.0"), ("/privacidade", "0.3")] + [
            (f"/projetos/{p['slug']}", "0.8") for p in content.PROJECTS
        ]
        body = "".join(
            f"  <url><loc>{escape(site_url + path)}</loc>"
            f"<lastmod>{today}</lastmod><priority>{prio}</priority></url>\n"
            for path, prio in urls
        )
        xml = (
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            f"{body}</urlset>\n"
        )
        return PlainTextResponse(xml, media_type="application/xml")

    @app.get("/CV_Carlos_Henrique_AI_Engineer.pdf", include_in_schema=False)
    def curriculo():
        path = BASE_DIR.parent / "CV_Carlos_Henrique_AI_Engineer.pdf"
        if not path.exists():
            raise StarletteHTTPException(status_code=404)
        return FileResponse(path, media_type="application/pdf", filename=path.name)

    # playground: a lista mostra o código do próprio handler que responde
    def handler_source(fn) -> str:
        raw = inspect.getsource(fn)
        lines = [ln for ln in raw.splitlines() if not ln.strip().startswith("@")]
        while lines and not lines[0].strip():
            lines.pop(0)
        return "\n".join(lines).rstrip()

    app.state.endpoints = [
        {"method": "GET", "path": "/api/v1/carlos", "label": "perfil", "fn": perfil},
        {"method": "GET", "path": "/api/v1/carlos/skills", "label": "skills", "fn": skills},
        {"method": "GET", "path": "/api/v1/carlos/projetos", "label": "projetos", "fn": projetos},
        {"method": "GET", "path": "/api/v1/carlos/experiencia", "label": "experiência", "fn": experiencia},
        {"method": "GET", "path": "/api/v1/xadrez/nova", "label": "xadrez/nova", "fn": xadrez_nova},
        {"method": "POST", "path": "/api/v1/xadrez/lance", "label": "xadrez/lance", "fn": xadrez_lance},
    ]

    @app.get("/api/v1/_playground", tags=["infra"], summary="Metadados do playground")
    def playground() -> list[dict]:
        return [
            {
                "method": ep["method"],
                "path": ep["path"],
                "label": ep["label"],
                "codigo": handler_source(ep["fn"]),
                "corpo": {"fen": engine.START_FEN, "profundidade": 3} if ep["method"] == "POST" else None,
            }
            for ep in app.state.endpoints
        ]

    # ------------------------------------------------------------ estáticos e erros
    class _CachedStatic(StaticFiles):
        def file_response(self, *args, **kwargs):  # type: ignore[override]
            response = super().file_response(*args, **kwargs)
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
            return response

    app.mount("/static", _CachedStatic(directory=str(STATIC_DIR)), name="static")

    @app.exception_handler(StarletteHTTPException)
    async def http_error(request: Request, exc: StarletteHTTPException):
        if exc.status_code == 404 and not request.url.path.startswith(("/api/", "/static/")):
            lang = lang_of(request)
            return render(
                request, "404.html", "404",
                f"404 | {content.PROFILE['nome']}",
                content.STRINGS[lang]["notfound_text"],
                status_code=404,
            )
        return JSONResponse({"detail": exc.detail}, status_code=exc.status_code)

    @app.middleware("http")
    async def security_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        response.headers.setdefault(
            "Content-Security-Policy",
            "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; "
            "font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; "
            "base-uri 'none'; object-src 'none'",
        )
        return response

    return app


# a aplicação é criada pela factory: `uvicorn app.main:create_app --factory`
