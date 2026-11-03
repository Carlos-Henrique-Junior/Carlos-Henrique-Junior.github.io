FROM nginxinc/nginx-unprivileged@sha256:6b8ddaf796bc384916fe9cd0219d69e6d1bd4a3d3a589b4ac34f7bae8223c69a

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY privacidade.html /usr/share/nginx/html/privacidade.html
COPY assets/ /usr/share/nginx/html/assets/
COPY img/ /usr/share/nginx/html/img/
COPY ["Carlos Henrique Jr..pdf", "/usr/share/nginx/html/Carlos Henrique Jr..pdf"]

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD curl -fsS http://127.0.0.1:8080/health >/dev/null || exit 1
