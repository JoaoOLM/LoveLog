#!/bin/bash

# LoveLog Environment Setup Script
# This script prepares the development environment for Kubernetes deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 LoveLog Environment Setup${NC}"
echo -e "${BLUE}===========================${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required tools
check_prerequisites() {
    echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
    
    local missing_tools=()
    
    if ! command_exists docker; then
        missing_tools+=("docker")
    fi
    
    if ! command_exists kubectl; then
        missing_tools+=("kubectl")
    fi
    
    if ! command_exists helm; then
        missing_tools+=("helm")
    fi
    
    if ! command_exists minikube; then
        missing_tools+=("minikube")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing required tools: ${missing_tools[*]}${NC}"
        echo -e "${YELLOW}Please install the missing tools and run this script again.${NC}"
        
        echo -e "\n${BLUE}Installation commands (Ubuntu/Debian):${NC}"
        echo "# Docker"
        echo "curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
        echo ""
        echo "# kubectl"
        echo "curl -LO \"https://dl.k8s.io/release/\$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl\""
        echo "sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl"
        echo ""
        echo "# Helm"
        echo "curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash"
        echo ""
        echo "# Minikube"
        echo "curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64"
        echo "sudo install minikube-linux-amd64 /usr/local/bin/minikube"
        
        exit 1
    else
        echo -e "${GREEN}✅ All prerequisites are installed${NC}"
    fi
}

# Check Docker daemon
check_docker() {
    echo -e "${YELLOW}📋 Checking Docker daemon...${NC}"
    if ! docker info >/dev/null 2>&1; then
        echo -e "${RED}❌ Docker daemon is not running${NC}"
        echo -e "${YELLOW}Please start Docker and run this script again.${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ Docker daemon is running${NC}"
    fi
}

# Setup Minikube
setup_minikube() {
    echo -e "${YELLOW}🚀 Setting up Minikube...${NC}"
    
    # Check if minikube is already running
    if minikube status >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Minikube is already running${NC}"
    else
        echo -e "${BLUE}Starting Minikube with Docker driver...${NC}"
        minikube start --driver=docker --memory=3000 --cpus=2
    fi
    
    # Enable required addons
    echo -e "${BLUE}Enabling required addons...${NC}"
    minikube addons enable ingress
    minikube addons enable dashboard
    minikube addons enable metrics-server
    
    echo -e "${GREEN}✅ Minikube setup completed${NC}"
}

# Verify Kubernetes access
verify_k8s_access() {
    echo -e "${YELLOW}📋 Verifying Kubernetes access...${NC}"
    
    if kubectl cluster-info >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Kubernetes cluster is accessible${NC}"
    else
        echo -e "${RED}❌ Cannot access Kubernetes cluster${NC}"
        echo -e "${YELLOW}Please check your kubectl configuration${NC}"
        exit 1
    fi
}

# Create namespace
create_namespace() {
    echo -e "${YELLOW}📋 Creating namespace...${NC}"
    
    if kubectl get namespace lovelog >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Namespace 'lovelog' already exists${NC}"
    else
        kubectl create namespace lovelog
        echo -e "${GREEN}✅ Namespace 'lovelog' created${NC}"
    fi
}

# Show environment info
show_environment_info() {
    echo -e "\n${BLUE}📊 Environment Information${NC}"
    echo -e "${BLUE}=========================${NC}"
    
    echo -e "\n${YELLOW}Minikube:${NC}"
    echo "IP: $(minikube ip)"
    echo "Version: $(minikube version --short 2>/dev/null || echo 'Unknown')"
    
    echo -e "\n${YELLOW}Kubernetes:${NC}"
    kubectl version --client --short 2>/dev/null || echo "Client version: Unknown"
    
    echo -e "\n${YELLOW}Docker:${NC}"
    docker --version
    
    echo -e "\n${YELLOW}Helm:${NC}"
    helm version --short 2>/dev/null || echo "Version: Unknown"
    
    echo -e "\n${YELLOW}Available Storage Classes:${NC}"
    kubectl get storageclass
    
    echo -e "\n${YELLOW}Ingress Controller Status:${NC}"
    kubectl get pods -n ingress-nginx 2>/dev/null || echo "Ingress controller not ready yet"
}

# Main function
main() {
    check_prerequisites
    check_docker
    setup_minikube
    verify_k8s_access
    create_namespace
    show_environment_info
    
    echo -e "\n${GREEN}🎉 Environment setup completed successfully!${NC}"
    echo -e "\n${BLUE}Next steps:${NC}"
    echo -e "1. Run ${YELLOW}./deploy.sh${NC} to deploy the application"
    echo -e "2. Run ${YELLOW}make help${NC} to see available commands"
    echo -e "3. Access the application at ${YELLOW}http://k8s.local${NC} after deployment"
    
    echo -e "\n${BLUE}Useful commands:${NC}"
    echo -e "- ${YELLOW}minikube dashboard${NC} - Open Kubernetes dashboard"
    echo -e "- ${YELLOW}kubectl get all -n lovelog${NC} - View all resources"
    echo -e "- ${YELLOW}make status${NC} - Check deployment status"
}

# Run main function
main
