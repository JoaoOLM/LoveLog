#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="lovelog"
RELEASE_NAME="lovelog"
CHART_PATH="./deploy"

echo -e "${BLUE}🚀 LoveLog Kubernetes Deployment Script${NC}"
echo -e "${BLUE}======================================${NC}"

# Function to check if minikube is running
check_minikube() {
    echo -e "${YELLOW}📋 Checking Minikube status...${NC}"
    if ! minikube status >/dev/null 2>&1; then
        echo -e "${RED}❌ Minikube is not running. Starting Minikube...${NC}"
        minikube start --driver=docker
    else
        echo -e "${GREEN}✅ Minikube is running${NC}"
    fi
}

# Function to enable ingress addon
enable_ingress() {
    echo -e "${YELLOW}📋 Enabling Ingress addon...${NC}"
    minikube addons enable ingress
    echo -e "${GREEN}✅ Ingress addon enabled${NC}"
}

# Function to build Docker images
build_images() {
    echo -e "${YELLOW}🔨 Building Docker images...${NC}"
    
    # Configure Docker to use Minikube's Docker daemon
    eval $(minikube docker-env)
    
    # Build backend image
    echo -e "${BLUE}Building backend image...${NC}"
    docker build -t backend:latest ./backend/
    
    # Build frontend image
    echo -e "${BLUE}Building frontend image...${NC}"
    docker build -t frontend:latest ./frontend/
    
    echo -e "${GREEN}✅ All images built successfully${NC}"
}

# Function to create namespace
create_namespace() {
    echo -e "${YELLOW}📋 Creating namespace...${NC}"
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    echo -e "${GREEN}✅ Namespace '$NAMESPACE' created/updated${NC}"
}

# Function to update helm dependencies
update_helm_deps() {
    echo -e "${YELLOW}📋 Updating Helm dependencies...${NC}"
    cd $CHART_PATH
    helm dependency update
    cd ..
    echo -e "${GREEN}✅ Helm dependencies updated${NC}"
}

# Function to deploy with Helm
deploy_helm() {
    echo -e "${YELLOW}🚀 Deploying with Helm...${NC}"
    helm upgrade --install $RELEASE_NAME $CHART_PATH \
        --namespace $NAMESPACE \
        --create-namespace \
        --wait \
        --timeout=15m \
        --debug
    echo -e "${GREEN}✅ Application deployed successfully${NC}"
}

# Function to add k8s.local to hosts file
add_hosts_entry() {
    echo -e "${YELLOW}📋 Adding k8s.local to /etc/hosts...${NC}"
    
    # Remove existing k8s.local entries
    sudo sed -i.bak '/k8s.local/d' /etc/hosts
    
    # Add localhost entry for k8s.local (will be used with proxy)
    echo "127.0.0.1 k8s.local" | sudo tee -a /etc/hosts > /dev/null
    
    echo -e "${GREEN}✅ k8s.local entry added to /etc/hosts${NC}"
}

# Function to detect package manager
detect_package_manager() {
    if command -v pacman &> /dev/null; then
        echo "pacman"
    elif command -v apt &> /dev/null; then
        echo "apt"
    elif command -v yum &> /dev/null; then
        echo "yum"
    elif command -v dnf &> /dev/null; then
        echo "dnf"
    else
        echo "unknown"
    fi
}

# Function to install socat if needed
install_socat() {
    if command -v socat &> /dev/null; then
        return 0
    fi
    
    echo -e "${YELLOW}📦 Installing socat for proxy functionality...${NC}"
    PACKAGE_MANAGER=$(detect_package_manager)
    
    case $PACKAGE_MANAGER in
        "pacman")
            sudo pacman -S --noconfirm socat
            ;;
        "apt")
            sudo apt update && sudo apt install -y socat
            ;;
        "yum"|"dnf")
            sudo $PACKAGE_MANAGER install -y socat
            ;;
        *)
            echo -e "${RED}❌ Package manager not supported. Please install socat manually.${NC}"
            echo -e "${YELLOW}💡 You can still access the app via: minikube service lovelog-nginx -n $NAMESPACE${NC}"
            return 1
            ;;
    esac
    
    echo -e "${GREEN}✅ socat installed successfully${NC}"
}

# Function to setup k8s.local access with tunnel and proxy
setup_k8s_access() {
    echo -e "${YELLOW}🌐 Setting up k8s.local access...${NC}"
    
    # Stop any existing proxies
    echo -e "${BLUE}🧹 Cleaning up existing processes...${NC}"
    sudo pkill -f "socat.*TCP-LISTEN:80" 2>/dev/null || true
    pkill -f "minikube service.*ingress-nginx-controller" 2>/dev/null || true
    
    # Check if port 80 is in use by other processes
    if netstat -tlnp 2>/dev/null | grep -q ":80 "; then
        local port80_process=$(netstat -tlnp 2>/dev/null | grep ":80 " | head -1)
        echo -e "${YELLOW}⚠️  Port 80 is currently in use:${NC}"
        echo -e "${YELLOW}   $port80_process${NC}"
        echo -e "${YELLOW}💡 You can:${NC}"
        echo -e "${YELLOW}   1. Stop the service using port 80 and run '$0 access' again${NC}"
        echo -e "${YELLOW}   2. Use port-forward: kubectl port-forward -n $NAMESPACE svc/lovelog-nginx 8080:80${NC}"
        echo -e "${YELLOW}      Then access: http://localhost:8080${NC}"
        return 1
    fi
    
    # Install socat if needed
    if ! install_socat; then
        return 1
    fi
    
    # Wait for ingress controller to be ready
    echo -e "${BLUE}⏳ Checking if ingress controller is ready...${NC}"
    if ! kubectl get pods -n ingress-nginx -l app.kubernetes.io/component=controller &>/dev/null; then
        echo -e "${YELLOW}⚠️  Ingress controller not found, you may need to enable it first:${NC}"
        echo -e "${YELLOW}   minikube addons enable ingress${NC}"
        return 1
    fi
    
    # Quick check if already ready, otherwise wait briefly
    if ! kubectl get pods -n ingress-nginx -l app.kubernetes.io/component=controller -o jsonpath='{.items[0].status.phase}' 2>/dev/null | grep -q "Running"; then
        echo -e "${BLUE}⏳ Waiting briefly for ingress controller...${NC}"
        kubectl wait --for=condition=ready pod -l app.kubernetes.io/component=controller -n ingress-nginx --timeout=30s || echo -e "${YELLOW}⚠️  Continuing anyway...${NC}"
    fi
    
    # Start minikube tunnel for ingress controller
    echo -e "${BLUE}📡 Starting ingress tunnel...${NC}"
    minikube service ingress-nginx-controller -n ingress-nginx > /tmp/minikube-tunnel.log 2>&1 &
    TUNNEL_PID=$!
    
    # Wait for tunnel to establish
    echo -e "${BLUE}⏳ Waiting for tunnel to establish...${NC}"
    sleep 15
    
    # Discover tunnel port
    TUNNEL_PORT=""
    for i in {1..10}; do
        TUNNEL_PORT=$(netstat -tlnp 2>/dev/null | grep "127.0.0.1:" | grep -v ":80 " | awk '{print $4}' | cut -d: -f2 | head -1)
        if [ -n "$TUNNEL_PORT" ]; then
            break
        fi
        sleep 3
    done
    
    if [ -z "$TUNNEL_PORT" ]; then
        echo -e "${YELLOW}⚠️  Could not detect tunnel port automatically, using fallback method...${NC}"
        # Try to get port from tunnel log
        sleep 5
        TUNNEL_PORT=$(grep -o "127\.0\.0\.1:[0-9]*" /tmp/minikube-tunnel.log | head -1 | cut -d: -f2)
        
        if [ -z "$TUNNEL_PORT" ]; then
            echo -e "${RED}❌ Failed to establish tunnel. You can still access via port-forward:${NC}"
            echo -e "${YELLOW}kubectl port-forward -n $NAMESPACE svc/lovelog-nginx 8080:80${NC}"
            echo -e "${YELLOW}Then access: http://localhost:8080${NC}"
            return 1
        fi
    fi
    
    echo -e "${GREEN}📡 Tunnel established on port: $TUNNEL_PORT${NC}"
    
    # Create proxy from port 80 to tunnel port
    echo -e "${BLUE}🔗 Creating proxy: 80 -> 127.0.0.1:$TUNNEL_PORT${NC}"
    sudo socat TCP-LISTEN:80,fork,reuseaddr TCP:127.0.0.1:$TUNNEL_PORT &
    PROXY_PID=$!
    
    # Wait a moment for proxy to start
    sleep 3
    
    # Test connectivity
    echo -e "${BLUE}🧪 Testing connectivity...${NC}"
    if timeout 10 curl -s http://k8s.local | grep -q "LoveLog"; then
        echo -e "${GREEN}🎉 Success! LoveLog is accessible at: http://k8s.local${NC}"
        echo -e "${GREEN}📋 Background processes:${NC}"
        echo -e "${GREEN}   - Tunnel PID: $TUNNEL_PID${NC}"
        echo -e "${GREEN}   - Proxy PID: $PROXY_PID${NC}"
        echo -e "${YELLOW}� To stop services: sudo pkill -f socat; pkill -f 'minikube service'${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Basic connectivity test failed, but tunnel is running.${NC}"
        echo -e "${YELLOW}💡 Try accessing: http://k8s.local${NC}"
        echo -e "${YELLOW}💡 Alternative: http://127.0.0.1:$TUNNEL_PORT${NC}"
        return 1
    fi
}

# Function to show deployment status
show_status() {
    echo -e "${BLUE}📊 Deployment Status${NC}"
    echo -e "${BLUE}==================${NC}"
    
    echo -e "${YELLOW}Pods:${NC}"
    kubectl get pods -n $NAMESPACE
    
    echo -e "\n${YELLOW}Services:${NC}"
    kubectl get services -n $NAMESPACE
    
    echo -e "\n${YELLOW}Ingress:${NC}"
    kubectl get ingress -n $NAMESPACE
    
    echo -e "\n${YELLOW}PVC:${NC}"
    kubectl get pvc -n $NAMESPACE
}

# Function to wait for pods to be ready
wait_for_pods() {
    echo -e "${YELLOW}⏳ Waiting for pods to be ready...${NC}"
    kubectl wait --for=condition=ready pod --all -n $NAMESPACE --timeout=300s
    echo -e "${GREEN}✅ All pods are ready${NC}"
}

# Main execution flow
main() {
    echo -e "${BLUE}Starting deployment process...${NC}"
    
    check_minikube
    enable_ingress
    build_images
    create_namespace
    update_helm_deps
    deploy_helm
    wait_for_pods
    add_hosts_entry
    
    # Setup k8s.local access automatically
    echo -e "${BLUE}🌐 Setting up k8s.local access...${NC}"
    if setup_k8s_access; then
        ACCESS_URL="http://k8s.local"
    else
        ACCESS_URL="kubectl port-forward -n $NAMESPACE svc/lovelog-nginx 8080:80 (then http://localhost:8080)"
    fi
    
    show_status
    
    echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${GREEN}🌐 Access your application at: $ACCESS_URL${NC}"
    echo -e "${YELLOW}📝 To check logs: kubectl logs -f deployment/<pod-name> -n $NAMESPACE${NC}"
    echo -e "${YELLOW}🔧 To debug: kubectl describe pod <pod-name> -n $NAMESPACE${NC}"
}

# Function to show help
show_help() {
    echo -e "${BLUE}LoveLog Kubernetes Deployment Script${NC}"
    echo -e "${BLUE}====================================${NC}"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  deploy, -d     Deploy the application with k8s.local access (default)"
    echo "  access, -a     Setup k8s.local access for existing deployment"
    echo "  clean, -c      Clean up the deployment"
    echo "  status, -s     Show deployment status"
    echo "  logs, -l       Show logs from all pods"
    echo "  stop, -stop    Stop k8s.local access services (proxy/tunnel)"
    echo "  help, -h       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy      # Full deployment with automatic k8s.local setup"
    echo "  $0 access      # Setup k8s.local access after deployment"
    echo "  $0 stop        # Stop proxy and tunnel services"
    echo ""
}

# Function to stop k8s.local access services
stop_access() {
    echo -e "${YELLOW}🛑 Stopping k8s.local access services...${NC}"
    
    # Stop proxy
    echo -e "${BLUE}Stopping proxy...${NC}"
    sudo pkill -f "socat.*TCP-LISTEN:80" 2>/dev/null && echo -e "${GREEN}✅ Proxy stopped${NC}" || echo -e "${YELLOW}No proxy running${NC}"
    
    # Stop tunnel
    echo -e "${BLUE}Stopping tunnel...${NC}"
    pkill -f "minikube service.*ingress-nginx-controller" 2>/dev/null && echo -e "${GREEN}✅ Tunnel stopped${NC}" || echo -e "${YELLOW}No tunnel running${NC}"
    
    echo -e "${GREEN}✅ Access services stopped${NC}"
}

# Function to clean up deployment
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up deployment...${NC}"
    
    # Stop access services first
    stop_access
    
    # Delete Helm release
    helm uninstall $RELEASE_NAME -n $NAMESPACE || true
    
    # Delete namespace
    kubectl delete namespace $NAMESPACE --ignore-not-found=true
    
    # Remove hosts entry
    sudo sed -i.bak '/k8s.local/d' /etc/hosts
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Function to show logs
show_logs() {
    echo -e "${YELLOW}📋 Showing logs from all pods...${NC}"
    kubectl logs -l app.kubernetes.io/instance=$RELEASE_NAME -n $NAMESPACE --tail=100
}

# Parse command line arguments
case "${1:-deploy}" in
    "deploy"|"-d"|"")
        main
        ;;
    "access"|"-a")
        echo -e "${BLUE}🌐 Setting up k8s.local access only...${NC}"
        add_hosts_entry
        setup_k8s_access
        ;;
    "clean"|"-c")
        cleanup
        ;;
    "status"|"-s")
        show_status
        ;;
    "logs"|"-l")
        show_logs
        ;;
    "stop"|"-stop")
        stop_access
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown option: $1${NC}"
        show_help
        exit 1
        ;;
esac
