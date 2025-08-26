# PlantUML MCP Server

A Model Context Protocol (MCP) server that provides PlantUML diagram generation capabilities to AI agents.

## Quick Start

1. **Install dependencies:**
   ```bash
   cd mcp
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Start the MCP server:**
   ```bash
   npm start
   ```

## Configuration

### Environment Variables

- `PLANTUML_SERVER_URL`: URL of the PlantUML server (default: `http://localhost:9090`)

### MCP Client Setup

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "plantuml": {
      "command": "node",
      "args": ["./mcp/dist/index.js"],
      "env": {
        "PLANTUML_SERVER_URL": "http://localhost:9090"
      }
    }
  }
}
```

## Available Tools

- `generate_plantuml_diagram`: Generate diagrams in various formats
- `validate_plantuml_code`: Validate PlantUML syntax
- `get_supported_formats`: List supported output formats
- `plantuml_health_check`: Check server health

## Example Usage

```json
{
  "tool": "generate_plantuml_diagram",
  "arguments": {
    "code": "@startuml\nAlice -> Bob: Hello\n@enduml",
    "format": "png"
  }
}
```

For detailed documentation, see [README.md](./README.md).
