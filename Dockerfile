FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    DATA_DIR=/data \
    PORT=8080 \
    SITE_URL=https://portfolio.lemostech.dev.br

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY CV_Carlos_Henrique_AI_Engineer.pdf ./CV_Carlos_Henrique_AI_Engineer.pdf

RUN useradd --create-home --uid 10001 appuser \
    && mkdir -p /data \
    && chown -R appuser:appuser /data /app
USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8080/health', timeout=3).status == 200 else 1)"

# um worker: SQLite e o limitador de contato vivem no processo
CMD ["sh", "-c", "uvicorn app.main:create_app --factory --host 0.0.0.0 --port ${PORT} --workers 1"]
