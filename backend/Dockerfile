FROM python:3.12-slim-bookworm

# Copia o binário do uv (gerenciador de pacotes) da imagem oficial
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Define o diretório de trabalho
WORKDIR /app

# Copia arquivos de dependência primeiro (para cache eficiente)
COPY pyproject.toml uv.lock* ./

# Instala as dependências em ambiente isolado
RUN uv sync --locked

# Copia o restante do código da aplicação
COPY . .

# Expõe a porta da aplicação
EXPOSE 8000