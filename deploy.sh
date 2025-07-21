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
    
    MINIKUBE_IP=$(minikube ip)
    HOSTS_ENTRY="$MINIKUBE_IP k8s.local"
    
    # Check if entry already exists
    if grep -q "k8s.local" /etc/hosts; then
        echo -e "${BLUE}Updating existing k8s.local entry...${NC}"
        sudo sed -i.bak "s/.*k8s.local.*/$HOSTS_ENTRY/" /etc/hosts
    else
        echo -e "${BLUE}Adding new k8s.local entry...${NC}"
        echo "$HOSTS_ENTRY" | sudo tee -a /etc/hosts > /dev/null
    fi
    
    echo -e "${GREEN}✅ k8s.local entry added/updated in /etc/hosts${NC}"
    echo -e "${GREEN}📍 Application will be available at: http://k8s.local${NC}"
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
    show_status
    
    echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${GREEN}🌐 Access your application at: http://k8s.local${NC}"
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
    echo "  deploy, -d    Deploy the application (default)"
    echo "  clean, -c     Clean up the deployment"
    echo "  status, -s    Show deployment status"
    echo "  logs, -l      Show logs from all pods"
    echo "  help, -h      Show this help message"
    echo ""
}

# Function to clean up deployment
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up deployment...${NC}"
    
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
    "clean"|"-c")
        cleanup
        ;;
    "status"|"-s")
        show_status
        ;;
    "logs"|"-l")
        show_logs
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
