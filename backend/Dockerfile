FROM python:3.12-slim-bookworm
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Configure the working directory
WORKDIR /app

# Copia só o pyproject.toml e uv.lock (depois melhora para uv.lock fixo)
COPY pyproject.toml uv.lock* ./

# Sync the project into a new environment, asserting the lockfile is up to date
RUN uv sync --locked

# Expõe a porta que o Django vai rodar
EXPOSE 8000

# Comando padrão para iniciar o server
CMD ["uv", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]