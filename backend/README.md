# LoveLog - Backend

LoveLog é uma aplicação para casais com funcionalidades de listas compartilhadas, mural, e fotos. Este repositório contém a API backend que serve os dados da aplicação.

## 🚀 Tecnologias

- Python 3.13
- Django 5.2
- Django Rest Framework 3.16
- PostgreSQL
- Docker + Docker Compose
- uv (gerenciador de pacotes e execução)

## ⚙️ Como rodar o projeto

### Pré-requisitos 

- Docker
- Docker Compose
- Python 3.13 ou superior

### Rodando o Backend

#### Ambiente de Desenvolvimento (Hot Reload)

1. **Clone o repositório**
    ```bash
    git clone https://github.com/seu-usuario/lovelog.git
    cd lovelog/backend
    ```

2. **Crie o arquivo .env dentro da pasta backend/:**
    ```bash 
    # Backend env
    SECRET_KEY=sua-chave-secreta
    DEBUG=True
    ALLOWED_HOSTS=*
    DB_NAME=lovelog
    DB_USER=postgres
    DB_PASSWORD=postgres
    DB_HOST=db
    DB_PORT=5432

    # DB env
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=postgres
    POSTGRES_DB=lovelog
    ```

3. **Construir e iniciar os containers Docker**:
   Para rodar o projeto em ambiente de desenvolvimento com hot reload, execute o comando:

   ```bash
   docker-compose up --build
   ```

4. **Acessando a API: A API estará disponível em http://localhost:8000/.**

5. **Administração Django: Você pode acessar a interface de administração do Django em http://localhost:8000/admin/.**

## 📚 Funcionalidades disponíveis

- **Couples**: Login (Autenticação)
- **Lists**: Criar e listar listas
- **Items**: Criar e listar itens de listas
- **Board**: Postar mensagens e excluir
- **Photos**: Upload e exclusão de fotos

## 🧹 Melhorias futuras

- Adicionar autenticação via JWT
- Proteção de uploads de fotos
- Testes automatizados (Pytest/Django Test)
- Deploy em ambiente de produção
