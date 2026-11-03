# Portfólio pessoal — Carlos Henrique

Site estático de apresentação profissional para a área de dados, com conteúdo em português/inglês, tema claro/escuro e layout responsivo.

## Conteúdo

- Perfil e disponibilidade profissional;
- experiências descritas com base no currículo atual;
- projetos de dashboard salarial, monitoramento CFTC e API de voluntários;
- competências, formação e contatos;
- preferências de idioma/tema guardadas apenas no navegador.

O site também publica `privacidade.html`, que descreve as preferências locais, ausência de analytics/formulários e o papel dos registros técnicos do provedor de hospedagem. A retenção e a região dos logs dependem do provedor e devem ser confirmadas antes de tratar essa página como uma análise jurídica completa.

## Executar localmente

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Abra `http://127.0.0.1:8000/`.

## Testes estáticos

Sem instalar pacotes Python:

```bash
python3.12 -m unittest discover -s tests -v
```

## Container EasyPanel

A imagem usa NGINX não privilegiado, fixado por digest, atende HTTP na porta `8080` e disponibiliza `/health` para verificação.

```bash
docker build -t portfolio-carlos:local .
docker run --rm -p 127.0.0.1:8080:8080 portfolio-carlos:local
```

O container não recebe segredos. O PDF do currículo é um arquivo público já mantido no repositório e o link de download aponta para o nome real do arquivo.

## Privacidade

O portfólio não coleta formulários nem envia as preferências locais de idioma/tema para um servidor. Contatos e links externos levam aos serviços de terceiros indicados no site. Logs técnicos do provedor de hospedagem são independentes do código da página.
