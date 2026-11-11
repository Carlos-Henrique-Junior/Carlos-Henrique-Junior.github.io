# Portfólio pessoal — Carlos Henrique

Site de apresentação profissional **servido por FastAPI**: as páginas são renderizadas
por Jinja2 e a API que o site exibe é a mesma que responde de verdade — não há mock,
JSON embutido no JavaScript nem latência fingida.

- Conteúdo em português e inglês (`?lang=en`, preferência guardada em cookie).
- API pública com OpenAPI em `/api/docs`.
- Playground que mostra o **código do handler em execução** (`inspect.getsource`) e
  devolve a resposta real, com status e tempo medidos no navegador.
- Xadrez jogável contra um motor **negamax com poda alfa-beta** rodando no servidor
  (`python-chess` valida todo lance; o navegador só desenha).
- Formulário de contato com consentimento versionado, honeypot, limite por hora e
  retenção definida — ver `/privacidade`.

## Rodar localmente

```bash
python3.12 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
SITE_URL=http://127.0.0.1:8000 DATA_DIR=./data \
  .venv/bin/python -m uvicorn app.main:create_app --factory --host 127.0.0.1 --port 8000
```

Abra <http://127.0.0.1:8000/>. A documentação da API fica em `/api/docs`.

### Variáveis de ambiente

| Variável | Padrão | Uso |
| --- | --- | --- |
| `SITE_URL` | `http://127.0.0.1:8000` | base de canonical, `sitemap.xml` e CORS |
| `DATA_DIR` | `./data` | onde fica `contatos.db` (SQLite) |
| `CONTACT_LIMIT_PER_HOUR` | `8` | limite de mensagens por IP/hora |
| `CONTACT_RETENTION_DAYS` | `365` | prazo de retenção exibido e usado no expurgo |

## Testes e lint

```bash
.venv/bin/python -m pytest      # 35 testes: páginas, API, xadrez, contato, infra
.venv/bin/ruff check app tests
```

## Rotas

| Rota | O que é |
| --- | --- |
| `/` | página principal (PT; `?lang=en` para inglês) |
| `/projetos/<slug>` | página própria por projeto, com canonical e metadados |
| `/privacidade` | aviso de privacidade (LGPD) |
| `/api/v1/carlos` | perfil em JSON |
| `/api/v1/carlos/skills` \| `/projetos` \| `/experiencia` | competências, projetos, experiência |
| `/api/v1/xadrez/nova` \| `/legais` \| `/jogada` \| `/lance` | xadrez server-side |
| `/api/v1/_playground` | metadados do playground (código do handler + corpo de exemplo) |
| `/api/docs` | Swagger UI gerado pelo FastAPI |
| `/health` | healthcheck |
| `/sitemap.xml`, `/robots.txt` | SEO; `robots` bloqueia `/api/` |

## Estrutura

```
app/
  main.py        rotas, i18n, headers de segurança, sitemap, estáticos versionados
  content.py     conteúdo do site (PT/EN) — fatos do currículo
  engine.py      xadrez: regras (python-chess) + negamax alfa-beta
  store.py       contato em SQLite (SQLAlchemy 2), com expurgo por retenção
  templates/     Jinja2 (base, index, projeto, privacidade, 404)
  static/        CSS, JS, fontes self-hosted, imagem — servidos com hash de conteúdo na URL
tests/           pytest (API, páginas, xadrez, LGPD, cabeçalhos)
```

Decisões que valem registro:

- **Um processo, um worker.** SQLite e o limitador de contato vivem na memória do
  processo; escalar horizontalmente exige mover os dois para fora (Postgres + Redis).
- **Sem CDN.** Nenhuma fonte, script ou ícone de terceiro: CSP `script-src 'self'` e
  o site funciona offline e atrás de firewall.
- **`inspect.getsource` no playground.** O código exibido é o do arquivo que está
  respondendo; não é uma cópia que envelhece.
- **Cache imutável com hash.** `?v=<sha256>` muda quando o arquivo muda, então o
  `immutable` de um ano não serve CSS velho depois do deploy.

## Container

```bash
docker build -t portfolio-carlos:local .
docker run --rm -p 127.0.0.1:8080:8080 -v portfolio-data:/data portfolio-carlos:local
```

Imagem `python:3.12-slim`, usuário não-root, `HEALTHCHECK` em `/health`, dados em
`/data` (monte um volume). Para EasyPanel: serviço do tipo *App*, porta `8080`,
volume em `/data`, `SITE_URL=https://<seu-domínio>`.

> **Atenção ao deploy:** este repositório se chama `Carlos-Henrique-Junior.github.io`,
> então o GitHub Pages publica a branch `main` como site estático. Enquanto o app
> FastAPI estiver aqui, **não faça merge na `main` nem ative Pages** — o Pages
> publicaria `app/templates/*.html` como se fossem páginas. Opções: publicar o app a
> partir de outra branch/repositório no EasyPanel e manter o Pages atual no ar até o
> corte, ou desativar o Pages ao migrar.

## Privacidade (LGPD)

- Coleta apenas o que o formulário pede, com consentimento explícito e versão do aviso
  (`2026-11`) gravada junto ao registro.
- IP não é armazenado: vira resumo efêmero para contar envios por hora.
- Expurgo automático por retenção (`Store.expurgar`), hoje 365 dias.
- Sem analytics, sem cookies de terceiros; só o cookie `lang`.
- Canal para qualquer direito do titular: `chjunior05@gmail.com`.
