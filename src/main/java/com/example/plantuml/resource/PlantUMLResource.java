package com.example.plantuml.resource;

import com.example.plantuml.dto.PlantUMLRequest;
import com.example.plantuml.dto.PlantUMLResponse;
import com.example.plantuml.service.PlantUMLService;
import net.sourceforge.plantuml.FileFormat;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.io.IOException;

@Path("/api/plantuml")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PlantUMLResource {

    @Inject
    PlantUMLService plantUMLService;

    @POST
    @Path("/generate")
    public Response generateImage(PlantUMLRequest request) {
        try {
            if (request.getCode() == null || request.getCode().trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new PlantUMLResponse(false, "PlantUML code is required"))
                    .build();
            }

            FileFormat format = parseFormat(request.getFormat());
            String base64Data = plantUMLService.generateBase64Image(request.getCode(), format);
            
            PlantUMLResponse response = new PlantUMLResponse(
                true, 
                "Image generated successfully", 
                request.getFormat().toLowerCase(),
                base64Data
            );
            
            return Response.ok(response).build();
            
        } catch (IOException e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new PlantUMLResponse(false, "Error generating image: " + e.getMessage()))
                .build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new PlantUMLResponse(false, e.getMessage()))
                .build();
        }
    }

    @POST
    @Path("/image/{format}")
    @Produces({"image/png", "image/svg+xml", "application/pdf"})
    public Response generateImageDirect(@PathParam("format") String formatStr, PlantUMLRequest request) {
        try {
            if (request.getCode() == null || request.getCode().trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity("PlantUML code is required")
                    .build();
            }

            FileFormat format = parseFormat(formatStr);
            byte[] imageBytes = plantUMLService.generateImage(request.getCode(), format);
            String contentType = plantUMLService.getContentType(format);
            
            return Response.ok(imageBytes)
                .header("Content-Type", contentType)
                .header("Content-Disposition", "attachment; filename=\"diagram." + formatStr.toLowerCase() + "\"")
                .build();
                
        } catch (IOException e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error generating image: " + e.getMessage())
                .build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(e.getMessage())
                .build();
        }
    }

    @GET
    @Path("/health")
    public Response health() {
        return Response.ok(new PlantUMLResponse(true, "PlantUML server is running")).build();
    }

    @GET
    @Path("/formats")
    public Response getSupportedFormats() {
        String[] formats = {"png", "svg", "pdf", "eps"};
        return Response.ok(formats).build();
    }

    private FileFormat parseFormat(String formatStr) {
        if (formatStr == null) {
            return FileFormat.PNG;
        }
        
        switch (formatStr.toLowerCase()) {
            case "png":
                return FileFormat.PNG;
            case "svg":
                return FileFormat.SVG;
            case "pdf":
                return FileFormat.PDF;
            case "eps":
                return FileFormat.EPS;
            default:
                throw new IllegalArgumentException("Unsupported format: " + formatStr + ". Supported formats: png, svg, pdf, eps");
        }
    }
}
