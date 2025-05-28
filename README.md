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

### 2. Suba os containers com Docker Compose

```bash
docker compose up --build
``` 

Acesse o site em: http://localhost:8080

## 🧪 Usando o sistema

## 1. Acessar o painel administrativo (API)
Abra o painel de administração do Django acessando: 

🔗 http://localhost:8080/admin/

Faça login com as credenciais do superusuário criado automaticamente:
```bash
Usuário: admin  
Senha: admin
``` 

## 2. Criar um novo casal
No painel administrativo, vá até a seção Couples e adicione um novo casal com um nome e senha.
Esses dados serão usados para autenticação no frontend.

## 3. Adicionar fotos do casal
Após criar o casal, adicione as fotos na seção Photos, associando-as ao casal criado.
Essas imagens serão exibidas no carrossel da interface principal.

## 4. Acessar o site do casal
Acesse a interface do site em:

🔗 http://localhost:8080/

Faça login com os dados do casal criado e aproveite as funcionalidades como:
- Carrossel de fotos
- Mural compartilhado
- Listas de tarefas


## 📌 Futuras Melhorias

- Adição de comentários no mural
- Notificações push para lembretes do casal
- Compartilhamento externo de momentos selecionados

## 👨‍💻 Autor

Feito com ❤️ por João Otávio
