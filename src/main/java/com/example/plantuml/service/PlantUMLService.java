package com.example.plantuml.service;

import net.sourceforge.plantuml.FileFormat;
import net.sourceforge.plantuml.FileFormatOption;
import net.sourceforge.plantuml.SourceStringReader;
import jakarta.enterprise.context.ApplicationScoped;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

@ApplicationScoped
public class PlantUMLService {

    public byte[] generateImage(String plantUMLCode, FileFormat format) throws IOException {
        SourceStringReader reader = new SourceStringReader(plantUMLCode);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        
        FileFormatOption formatOption = new FileFormatOption(format);
        reader.outputImage(outputStream, formatOption);
        
        return outputStream.toByteArray();
    }

    public String generateBase64Image(String plantUMLCode, FileFormat format) throws IOException {
        byte[] imageBytes = generateImage(plantUMLCode, format);
        return Base64.getEncoder().encodeToString(imageBytes);
    }

    public String getContentType(FileFormat format) {
        switch (format) {
            case PNG:
                return "image/png";
            case SVG:
                return "image/svg+xml";
            case EPS:
                return "application/postscript";
            case PDF:
                return "application/pdf";
            default:
                return "image/png";
        }
    }
}
