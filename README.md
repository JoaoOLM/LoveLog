# 💖 LoveLog

O **LoveLog** é um aplicativo web feito para casais que desejam registrar momentos especiais do relacionamento, organizar tarefas em conjunto e manter um mural colaborativo de lembranças. O projeto foi idealizado com o objetivo de fortalecer laços através da organização e memória compartilhada.

---

## ✨ Funcionalidades

- 📷 Carrossel de fotos para recordar momentos especiais
- 📋 Sistema de listas de tarefas (To-Do Lists)  
- 🧠 Mural colaborativo para desenhos e anotações
- 🌐 Interface moderna e responsiva

---

## 🛠️ Tecnologias Utilizadas

| Camada     | Tecnologia                    |
|------------|-------------------------------|
| Frontend   | [Next.js](https://nextjs.org/), [TailwindCSS](https://tailwindcss.com/), [TypeScript](https://www.typescriptlang.org/) |
| Backend    | [Django](https://www.djangoproject.com/), [Django REST Framework](https://www.django-rest-framework.org/) |
| Banco de dados | [PostgreSQL](https://www.postgresql.org/) |
| Reverse Proxy | [NGINX](https://www.nginx.com/) |
| Containerização | [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/) |
| Orquestração | [Kubernetes](https://kubernetes.io/), [Helm](https://helm.sh/), [Minikube](https://minikube.sigs.k8s.io/) |

---

## ☸️ Deploy com Kubernetes + Helm

### 🚀 Deploy Automático com Script

O script `deploy.sh` cuida de **todo o processo** de deploy e configuração de acesso local:

```bash
# Deploy completo da aplicação com acesso via k8s.local
./deploy.sh deploy

# Configurar apenas o acesso k8s.local (se já deployado)
./deploy.sh access

# Verificar status
./deploy.sh status

# Visualizar logs
./deploy.sh logs

# Parar serviços de acesso (proxy/túnel)
./deploy.sh stop

# Limpeza completa
./deploy.sh clean

# Ajuda
./deploy.sh help
```

### 📋 O que o script faz automaticamente:

1. ✅ Verifica se Minikube está rodando
2. ✅ Habilita addon nginx-ingress  
3. ✅ Constrói imagens Docker no daemon do Minikube
4. ✅ Atualiza dependências do Helm
5. ✅ Deploy da aplicação via Helm
6. ✅ Configura `/etc/hosts` com `127.0.0.1 k8s.local`
7. ✅ Instala `socat` (se necessário)
8. ✅ Cria túnel do ingress-nginx
9. ✅ Configura proxy local na porta 80
10. ✅ Testa conectividade automaticamente

### 🌐 Acesso após Deploy

- **Aplicação Principal**: http://k8s.local ✨ (acesso direto!)
- **API Backend**: http://k8s.local/api/

> **💡 Nota**: O script automaticamente configura proxy/túnel para que `k8s.local` funcione em qualquer ambiente Linux. Se a porta 80 estiver em uso, o script sugere alternativas como `kubectl port-forward`.

### 📊 Recursos Kubernetes Implementados

| Recurso | Quantidade | Descrição |
|---------|------------|-----------|
| **Deployments** | 4 | Backend, Frontend, Nginx, PostgreSQL |
| **Services** | 4 | ClusterIP para comunicação interna |
| **PVC** | 3 | Persistência para DB, static files e media |
| **Secret** | 1 | Credenciais do banco de dados |
| **ConfigMap** | 1 | Configuração do Nginx |
| **Ingress** | 1 | Exposição via k8s.local |

### 🔍 Comandos Úteis Kubernetes

```bash
# Ver todos os recursos
kubectl get all -n lovelog

# Logs do backend
kubectl logs -f deployment/backend -n lovelog

# Executar comando no pod
kubectl exec -it deployment/backend -n lovelog -- python manage.py shell

# Port forward para debug
kubectl port-forward service/backend 8000:8000 -n lovelog
```

---

## 🐳 Deploy com Docker Compose

### 📦 Estrutura de Contêineres

O projeto é totalmente containerizado com Docker Compose e conta com os seguintes serviços:

- `frontend`: Aplicação Next.js servida em desenvolvimento na porta 3000.
- `backend`: API em Django com endpoints REST, servida na porta 8000.
- `db`: Banco de dados PostgreSQL persistente.
- `nginx`: Proxy reverso que expõe os serviços via porta 8080, servindo arquivos estáticos, mídia e redirecionando para frontend/backend.

### 🔗 Mapeamentos de volume

| Volume        | Caminho no container     | Uso                        |
|---------------|--------------------------|-----------------------------|
| `static_volume` | `/app/staticfiles/`      | Arquivos estáticos do Django |
| `media_volume`  | `/app/media/`            | Uploads de fotos             |

### 🚀 Como rodar localmente

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

## 1. Crie um super usuário para acessar o painel administrativo (API)
Rode o seguinte comando no terminal
```bash
docker compose exec backend uv run python manage.py createsuperuser --noinput
``` 

## 2. Acessar o painel administrativo (API)
Abra o painel de administração do Django acessando: 

🔗 http://localhost:8080/admin/

Faça login com as credenciais do superusuário criado automaticamente:
```bash
Usuário: admin  
Senha: admin
``` 

## 3. Criar um novo casal
No painel administrativo, vá até a seção Couples e adicione um novo casal com um nome e senha.
Esses dados serão usados para autenticação no frontend.

## 4. Acessar a aplicação
Acesse a interface da aplicação em:

🔗 http://localhost:8080/

A aplicação agora funciona sem autenticação e permite:
- Visualizar e adicionar fotos no carrossel
- Gerenciar listas de tarefas
- Usar o mural colaborativo

---


## 📌 Funcionalidades Implementadas

✅ Sistema de fotos com upload e exclusão  
✅ Listas de tarefas (To-Do Lists)  
✅ Mural colaborativo para desenhos  
✅ Containerização completa  
✅ Deploy automatizado no Kubernetes  
✅ Proxy reverso com Nginx  
✅ Armazenamento persistente  

## 👨‍💻 Autor

Feito com ❤️ por João Otávio

---

### 🔧 Solução de Problemas

#### Problema: Porta 80 já está em uso
```bash
# O script detecta automaticamente e sugere alternativas:
# 1. Parar o serviço que usa a porta 80
sudo systemctl stop apache2  # ou nginx, etc.
./deploy.sh access

# 2. Usar port-forward como alternativa
kubectl port-forward -n lovelog svc/lovelog-nginx 8080:80
# Então acessar: http://localhost:8080
```

#### Problema: Tunnel não estabelece conexão
```bash
# Reiniciar os serviços
./deploy.sh stop
./deploy.sh access

# Verificar status do ingress
kubectl get pods -n ingress-nginx
minikube addons enable ingress
```

#### Problema: Deploy trava em "Deployment is not ready"
```bash
# Interrompa (Ctrl+C) e execute novamente
./deploy.sh deploy

# Ou force a recriação
./deploy.sh clean
./deploy.sh deploy
```
