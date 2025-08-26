# PlantUML Server + MCP Server Deployment Script for Windows
# This script provides easy deployment options for different environments

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "restart", "build", "logs", "status", "clean", "help")]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [ValidateSet("dev", "prod")]
    [string]$Environment = "dev"
)

# Colors for output
$Red = [System.ConsoleColor]::Red
$Green = [System.ConsoleColor]::Green
$Yellow = [System.ConsoleColor]::Yellow
$Blue = [System.ConsoleColor]::Blue
$White = [System.ConsoleColor]::White

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error-Message {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Function to check if Docker is running
function Test-Docker {
    try {
        docker info | Out-Null
        return $true
    }
    catch {
        Write-Error-Message "Docker is not running. Please start Docker and try again."
        return $false
    }
}

# Function to check if Docker Compose is available
function Test-DockerCompose {
    try {
        docker compose version | Out-Null
        return "docker compose"
    }
    catch {
        try {
            docker-compose version | Out-Null
            return "docker-compose"
        }
        catch {
            Write-Error-Message "Docker Compose is not available. Please install Docker Compose."
            return $null
        }
    }
}

# Function to show usage
function Show-Usage {
    Write-Host "Usage: .\deploy.ps1 [COMMAND] [ENVIRONMENT]" -ForegroundColor $White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor $White
    Write-Host "  start     Start the services"
    Write-Host "  stop      Stop the services"
    Write-Host "  restart   Restart the services"
    Write-Host "  build     Build the images"
    Write-Host "  logs      Show service logs"
    Write-Host "  status    Show service status"
    Write-Host "  clean     Remove containers and volumes"
    Write-Host "  help      Show this help message"
    Write-Host ""
    Write-Host "Environments:" -ForegroundColor $White
    Write-Host "  dev       Development environment (default)"
    Write-Host "  prod      Production environment"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor $White
    Write-Host "  .\deploy.ps1 start dev    # Start development environment"
    Write-Host "  .\deploy.ps1 start prod   # Start production environment"
    Write-Host "  .\deploy.ps1 logs         # Show logs for development environment"
    Write-Host "  .\deploy.ps1 build prod   # Build production images"
}

# Set compose files based on environment
if ($Environment -eq "prod") {
    $ComposeFiles = "-f docker-compose.yml -f docker-compose.prod.yml"
    $EnvName = "Production"
} else {
    $ComposeFiles = "-f docker-compose.yml"
    $EnvName = "Development"
}

# Main script logic
switch ($Command) {
    "start" {
        Write-Status "Starting PlantUML Server + MCP Server ($EnvName)"
        
        if (-not (Test-Docker)) { exit 1 }
        
        $ComposeCmd = Test-DockerCompose
        if (-not $ComposeCmd) { exit 1 }
        
        if ($Environment -eq "dev") {
            Write-Status "Building MCP server for development..."
            Push-Location mcp
            try {
                npm install
                npm run build
            }
            finally {
                Pop-Location
            }
        }
        
        $cmd = "$ComposeCmd $ComposeFiles up -d"
        Invoke-Expression $cmd
        
        Write-Success "Services started successfully!"
        Write-Status "PlantUML Server: http://localhost:9090"
        Write-Status "Health Check: http://localhost:9090/api/plantuml/health"
    }
    
    "stop" {
        Write-Status "Stopping PlantUML Server + MCP Server ($EnvName)"
        
        if (-not (Test-Docker)) { exit 1 }
        
        $ComposeCmd = Test-DockerCompose
        if (-not $ComposeCmd) { exit 1 }
        
        $cmd = "$ComposeCmd $ComposeFiles down"
        Invoke-Expression $cmd
        
        Write-Success "Services stopped successfully!"
    }
    
    "restart" {
        Write-Status "Restarting PlantUML Server + MCP Server ($EnvName)"
        
        if (-not (Test-Docker)) { exit 1 }
        
        $ComposeCmd = Test-DockerCompose
        if (-not $ComposeCmd) { exit 1 }
        
        $cmd = "$ComposeCmd $ComposeFiles restart"
        Invoke-Expression $cmd
        
        Write-Success "Services restarted successfully!"
    }
    
    "build" {
        Write-Status "Building images for $EnvName environment"
        
        if (-not (Test-Docker)) { exit 1 }
        
        $ComposeCmd = Test-DockerCompose
        if (-not $ComposeCmd) { exit 1 }
        
        if ($Environment -eq "dev") {
            Write-Status "Building PlantUML Server..."
            docker build -t plantuml-server:dev .
            
            Write-Status "Building MCP Server..."
            Push-Location mcp
            try {
                npm install
                npm run build
            }
            finally {
                Pop-Location
            }
            docker build -t plantuml-mcp-server:dev ./mcp
        }
        
        $cmd = "$ComposeCmd $ComposeFiles build"
        Invoke-Expression $cmd
        
        Write-Success "Images built successfully!"
    }
    
    "logs" {
        Write-Status "Showing logs for $EnvName environment"
        
        if (-not (Test-Docker)) { exit 1 }
        
        $ComposeCmd = Test-DockerCompose
        if (-not $ComposeCmd) { exit 1 }
        
        $cmd = "$ComposeCmd $ComposeFiles logs -f"
        Invoke-Expression $cmd
    }
    
    "status" {
        Write-Status "Service status for $EnvName environment"
        
        if (-not (Test-Docker)) { exit 1 }
        
        $ComposeCmd = Test-DockerCompose
        if (-not $ComposeCmd) { exit 1 }
        
        $cmd = "$ComposeCmd $ComposeFiles ps"
        Invoke-Expression $cmd
    }
    
    "clean" {
        Write-Warning "This will remove all containers, networks, and volumes!"
        $response = Read-Host "Are you sure? (y/N)"
        
        if ($response -match "^[Yy]$") {
            Write-Status "Cleaning up $EnvName environment"
            
            if (-not (Test-Docker)) { exit 1 }
            
            $ComposeCmd = Test-DockerCompose
            if (-not $ComposeCmd) { exit 1 }
            
            $cmd = "$ComposeCmd $ComposeFiles down -v --remove-orphans"
            Invoke-Expression $cmd
            
            docker system prune -f
            
            Write-Success "Cleanup completed!"
        } else {
            Write-Status "Cleanup cancelled."
        }
    }
    
    "help" {
        Show-Usage
    }
    
    default {
        Write-Error-Message "Unknown command: $Command"
        Show-Usage
        exit 1
    }
}
