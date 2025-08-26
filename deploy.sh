#!/bin/bash

# PlantUML Server + MCP Server Deployment Script
# This script provides easy deployment options for different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check if Docker Compose is available
check_compose() {
    if ! command -v docker-compose > /dev/null 2>&1 && ! docker compose version > /dev/null 2>&1; then
        print_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi
}

# Function to get Docker Compose command
get_compose_cmd() {
    if docker compose version > /dev/null 2>&1; then
        echo "docker compose"
    else
        echo "docker-compose"
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND] [ENVIRONMENT]"
    echo ""
    echo "Commands:"
    echo "  start     Start the services"
    echo "  stop      Stop the services"
    echo "  restart   Restart the services"
    echo "  build     Build the images"
    echo "  logs      Show service logs"
    echo "  status    Show service status"
    echo "  clean     Remove containers and volumes"
    echo "  help      Show this help message"
    echo ""
    echo "Environments:"
    echo "  dev       Development environment (default)"
    echo "  prod      Production environment"
    echo ""
    echo "Examples:"
    echo "  $0 start dev      # Start development environment"
    echo "  $0 start prod     # Start production environment"
    echo "  $0 logs           # Show logs for development environment"
    echo "  $0 build prod     # Build production images"
}

# Parse command line arguments
COMMAND=${1:-help}
ENVIRONMENT=${2:-dev}

# Validate environment
if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "prod" ]]; then
    print_error "Invalid environment: $ENVIRONMENT. Use 'dev' or 'prod'."
    show_usage
    exit 1
fi

# Set compose files based on environment
if [[ "$ENVIRONMENT" == "prod" ]]; then
    COMPOSE_FILES="-f docker-compose.yml -f docker-compose.prod.yml"
    ENV_NAME="Production"
else
    COMPOSE_FILES="-f docker-compose.yml"
    ENV_NAME="Development"
fi

# Get Docker Compose command
COMPOSE_CMD=$(get_compose_cmd)

# Main script logic
case $COMMAND in
    start)
        print_status "Starting PlantUML Server + MCP Server ($ENV_NAME)"
        check_docker
        check_compose
        
        if [[ "$ENVIRONMENT" == "dev" ]]; then
            print_status "Building MCP server for development..."
            cd mcp && npm install && npm run build && cd ..
        fi
        
        $COMPOSE_CMD $COMPOSE_FILES up -d
        print_success "Services started successfully!"
        print_status "PlantUML Server: http://localhost:9090"
        print_status "Health Check: http://localhost:9090/api/plantuml/health"
        ;;
        
    stop)
        print_status "Stopping PlantUML Server + MCP Server ($ENV_NAME)"
        check_docker
        check_compose
        $COMPOSE_CMD $COMPOSE_FILES down
        print_success "Services stopped successfully!"
        ;;
        
    restart)
        print_status "Restarting PlantUML Server + MCP Server ($ENV_NAME)"
        check_docker
        check_compose
        $COMPOSE_CMD $COMPOSE_FILES restart
        print_success "Services restarted successfully!"
        ;;
        
    build)
        print_status "Building images for $ENV_NAME environment"
        check_docker
        check_compose
        
        if [[ "$ENVIRONMENT" == "dev" ]]; then
            print_status "Building PlantUML Server..."
            docker build -t plantuml-server:dev .
            print_status "Building MCP Server..."
            cd mcp && npm install && npm run build && cd ..
            docker build -t plantuml-mcp-server:dev ./mcp
        fi
        
        $COMPOSE_CMD $COMPOSE_FILES build
        print_success "Images built successfully!"
        ;;
        
    logs)
        print_status "Showing logs for $ENV_NAME environment"
        check_docker
        check_compose
        $COMPOSE_CMD $COMPOSE_FILES logs -f
        ;;
        
    status)
        print_status "Service status for $ENV_NAME environment"
        check_docker
        check_compose
        $COMPOSE_CMD $COMPOSE_FILES ps
        ;;
        
    clean)
        print_warning "This will remove all containers, networks, and volumes!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Cleaning up $ENV_NAME environment"
            check_docker
            check_compose
            $COMPOSE_CMD $COMPOSE_FILES down -v --remove-orphans
            docker system prune -f
            print_success "Cleanup completed!"
        else
            print_status "Cleanup cancelled."
        fi
        ;;
        
    help)
        show_usage
        ;;
        
    *)
        print_error "Unknown command: $COMMAND"
        show_usage
        exit 1
        ;;
esac
