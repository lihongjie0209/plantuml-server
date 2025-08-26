# PlantUML Server Release Notes

## Version 1.0.0 (August 27, 2025)

### 🎉 First Stable Release

This is the first stable release of PlantUML Server, combining both the Quarkus-based web server and the Model Context Protocol (MCP) server for AI integration.

### 📦 What's Included

#### PlantUML Web Server (v1.0.0)
- **Quarkus-based** high-performance web application
- **REST API** for PlantUML diagram generation
- **Multiple output formats**: PNG, SVG, PDF, EPS
- **Base64 encoded** image responses
- **Direct image download** endpoints
- **Interactive web interface** for testing
- **Health check** endpoint
- **Docker containerization** support
- **Production-ready** with optimized performance
- **Graphviz integration** for complex diagram support
- **Chinese font support** with customizable font directory
- **UTF-8 encoding** for international character support

#### PlantUML MCP Server (v0.3.2)
- **Model Context Protocol** server for AI client integration
- **3 optimized tools**:
  - `plantuml-generate`: Generate diagrams with optional file saving
  - `plantuml-formats`: List supported output formats
  - `plantuml-health`: Health check endpoint
- **Dual parameter support**: Both camelCase and snake_case naming
- **File saving capability** with automatic directory creation
- **Remote PlantUML server** support (cloud-ready)
- **Enhanced tool descriptions** for better AI compatibility
- **Bandwidth optimization**: File saving mode excludes Base64 data

### 🌟 Key Features

- **Unified deployment**: Both servers can run together or separately
- **Cloud-ready**: Supports remote PlantUML server instances
- **AI-friendly**: Comprehensive MCP integration for AI assistants
- **Production-grade**: Docker containerization and health monitoring
- **Developer-friendly**: Rich documentation and examples
- **Multi-format support**: PNG, SVG, PDF, EPS output formats
- **High performance**: Optimized for speed and resource usage
- **Graphviz integration**: Full support for complex diagrams
- **Chinese font support**: Built-in Chinese character rendering
- **Font customization**: Custom font directory for additional fonts

### 🚀 Quick Start

#### Running the Web Server
```bash
# Development mode
./mvnw.cmd compile quarkus:dev

# Docker deployment
docker build -t plantuml-server:1.0.0 .
docker run -p 9090:9090 plantuml-server:1.0.0
```

#### Running the MCP Server
```bash
cd mcp
npm install
npm run build
node dist/index.js
```

#### Font Installation for Chinese Support
```bash
# Linux (Ubuntu/Debian)
sudo ./install-fonts.sh

# Windows (check fonts)
./install-fonts.ps1

# Custom fonts
# Copy font files to fonts/ directory and rebuild
cp your-fonts.ttf fonts/
docker build -t plantuml-server:1.0.0 .
```

### 📊 Technical Specifications

- **Base Image**: OpenJDK 11 JRE Slim
- **Container Size**: ~292MB (optimized multi-stage build)
- **Default Port**: 9090
- **Health Monitoring**: Built-in health checks
- **Security**: Non-root user execution
- **Node.js**: 18+ required for MCP server
- **MCP SDK**: v0.4.0 with JSON Schema validation

### 🔧 API Endpoints

#### Web Server
- `POST /api/plantuml/generate` - Generate diagram with Base64 response
- `POST /api/plantuml/image/{format}` - Generate and download diagram
- `GET /api/plantuml/health` - Health check
- `GET /api/plantuml/formats` - List supported formats

#### MCP Server
- `plantuml-generate` - Generate diagrams with optional file saving
- `plantuml-formats` - Get supported output formats
- `plantuml-health` - Server health status

### 📚 Documentation

- **README.md**: Comprehensive setup and usage guide
- **AI-CLIENT-GUIDE.md**: Integration guide for AI clients
- **USAGE-EXAMPLES.md**: Practical usage examples
- **MCP_SETUP.md**: Detailed MCP server setup instructions

### 🔄 Compatibility

- **Java**: 11+
- **Node.js**: 18+
- **Docker**: Latest
- **MCP Protocol**: v0.4.0
- **PlantUML**: Latest (via remote server)

### 🐛 Bug Fixes

- Fixed MCP parameter validation for camelCase/snake_case naming
- Resolved file saving functionality with remote PlantUML servers
- Improved error handling and logging
- Enhanced tool descriptions for better AI client compatibility

### 🚦 Deployment Options

1. **Standalone Web Server**: Traditional REST API deployment
2. **MCP Server Only**: For AI client integration
3. **Combined Deployment**: Both servers in Docker Compose
4. **Cloud Deployment**: Remote PlantUML server support

### 📝 Notes

- This release establishes the foundation for future development
- Both components are production-ready and fully tested
- Comprehensive documentation and examples included
- Active maintenance and support planned

---

For detailed installation and usage instructions, see the project documentation.
