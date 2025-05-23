# 💖 LoveLog

O **LoveLog** é um aplicativo web feito para casais que desejam registrar momentos especiais do relacionamento, organizar tarefas em conjunto e manter um mural colaborativo de lembranças. O projeto foi idealizado com o objetivo de fortalecer laços através da organização e memória compartilhada.

---

## ✨ Funcionalidades

- 🔐 Sistema de login seguro com autenticação via código de casal
- 🖼️ Carrossel de fotos para recordar momentos
- 🧠 Mural compartilhado com sistema de desenho e edição visual
- 📋 To-do lists personalizadas para ambos os parceiros

---

## 🛠️ Tecnologias Utilizadas

| Camada     | Tecnologia                    |
|------------|-------------------------------|
| Frontend   | [Next.js](https://nextjs.org/), [TailwindCSS](https://tailwindcss.com/), [TypeScript](https://www.typescriptlang.org/), [Fabric.js](http://fabricjs.com/) |
| Backend    | [Django](https://www.djangoproject.com/), [Django REST Framework](https://www.django-rest-framework.org/) |
| Banco de dados | [PostgreSQL](https://www.postgresql.org/) |
| Reverse Proxy | [NGINX](https://www.nginx.com/) |
| Containerização | [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/) |

---

## 📦 Estrutura de Contêineres

O projeto é totalmente containerizado com Docker Compose e conta com os seguintes serviços:

- `frontend`: Aplicação Next.js servida em desenvolvimento na porta 3000.
- `backend`: API em Django com endpoints REST, servida na porta 8000.
- `db`: Banco de dados PostgreSQL persistente.
- `nginx`: Proxy reverso que expõe os serviços via porta 8080, servindo arquivos estáticos, mídia e redirecionando para frontend/backend.

### 🔗 Mapeamentos de volume

| Volume        | Caminho no container     | Uso                        |
|---------------|--------------------------|-----------------------------|
| `static_volume` | `/app/staticfiles/`      | Arquivos estáticos do Django |
| `media_volume`  | `/app/mediafiles/`       | Uploads de fotos do casal    |

---

## 🚀 Como rodar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/lovelog.git
cd lovelog
``` 

### 2. Configure os arquivos `.env`

Crie os seguintes arquivos com base nos exemplos disponíveis:

- `backend/.env`
```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=lovelog
``` 
- `backend/.env.db`
```bash
SECRET_KEY=sua_chave_secreta
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:8080
CORS_ALLOW_ALL_ORIGINS=True
CSRF_TRUSTED_ORIGINS=http://localhost:8080
DB_NAME=lovelog
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_PASSWORD=admin
DJANGO_SUPERUSER_EMAIL=admin@admin.com
``` 
- `frontend/.env`
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
``` 

### 3. Suba os containers com Docker Compose

```bash
docker compose up --build
``` 

Acesse o site em: http://localhost:8080


## 📌 Futuras Melhorias

- Adição de comentários no mural
- Notificações push para lembretes do casal
- Compartilhamento externo de momentos selecionados

## 👨‍💻 Autor

Feito com ❤️ por João Otávio