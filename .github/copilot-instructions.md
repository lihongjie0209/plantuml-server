<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->
# PlantUML Server Project

This is a Quarkus-based web application that provides PlantUML diagram generation APIs.

## Features

- RESTful APIs for PlantUML diagram generation
- Support for multiple output formats (PNG, SVG, PDF, EPS)
- Base64 encoded image responses
- Direct image download endpoints
- Interactive web interface for testing
- Health check endpoint
- Docker containerization support

## Key Components

- **PlantUMLService**: Core service for diagram generation
- **PlantUMLResource**: REST API endpoints
- **Web Interface**: HTML page for testing and demonstration
- **Dockerfile**: Multi-stage Docker build configuration
- **Docker Compose**: Container orchestration setup

## Running the Application

### Development Mode
Use the "Run Quarkus Dev Mode" task or run:
```bash
.\mvnw.cmd compile quarkus:dev
```

### Docker Deployment
```bash
# Build image
docker build -t plantuml-server:latest .

# Run container
docker run -p 9090:9090 plantuml-server:latest

# Or use Docker Compose
docker-compose up -d
```

The application will be available at: http://localhost:9090

## Docker Information

- **Image Size**: ~292MB (optimized with multi-stage build)
- **Base Image**: OpenJDK 11 JRE Slim
- **Exposed Port**: 9090
- **Health Check**: Built-in health monitoring
- **Security**: Non-root user (appuser)

## API Endpoints

- `POST /api/plantuml/generate` - Generate diagram with Base64 response
- `POST /api/plantuml/image/{format}` - Generate and download diagram
- `GET /api/plantuml/health` - Health check
- `GET /api/plantuml/formats` - List supported formats
	<!--
	Ensure that the previous step has been marked as completed.
	Call project setup tool with projectType parameter.
	Run scaffolding command to create project files and folders.
	Use '.' as the working directory.
	If no appropriate projectType is available, search documentation using available tools.
	Otherwise, create the project structure manually using available file creation tools.
	-->

- [ ] Customize the Project
	<!--
	Verify that all previous steps have been completed successfully and you have marked the step as completed.
	Develop a plan to modify codebase according to user requirements.
	Apply modifications using appropriate tools and user-provided references.
	Skip this step for "Hello World" projects.
	-->

- [ ] Install Required Extensions
	<!-- ONLY install extensions provided mentioned in the get_project_setup_info. Skip this step otherwise and mark as completed. -->

- [ ] Compile the Project
	<!--
	Verify that all previous steps have been completed.
	Install any missing dependencies.
	Run diagnostics and resolve any issues.
	Check for markdown files in project folder for relevant instructions on how to do this.
	-->

- [ ] Create and Run Task
	<!--
	Verify that all previous steps have been completed.
	Check https://code.visualstudio.com/docs/debugtest/tasks to determine if the project needs a task. If so, use the create_and_run_task to create and launch a task based on package.json, README.md, and project structure.
	Skip this step otherwise.
	 -->

- [ ] Launch the Project
	<!--
	Verify that all previous steps have been completed.
	Prompt user for debug mode, launch only if confirmed.
	 -->

- [ ] Ensure Documentation is Complete
	<!--
	Verify that all previous steps have been completed.
	Verify that README.md and the copilot-instructions.md file in the .github directory exists and contains current project information.
	Clean up the copilot-instructions.md file in the .github directory by removing all HTML comments.
	 -->
