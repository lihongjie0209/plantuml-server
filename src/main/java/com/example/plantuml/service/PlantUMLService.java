package com.example.plantuml.service;

import net.sourceforge.plantuml.FileFormat;
import net.sourceforge.plantuml.FileFormatOption;
import net.sourceforge.plantuml.SourceStringReader;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.annotation.PostConstruct;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.Optional;

@ApplicationScoped
public class PlantUMLService {

    @ConfigProperty(name = "plantuml.graphviz.dot")
    Optional<String> graphvizDotPath;

    @ConfigProperty(name = "plantuml.font.path")
    Optional<String> fontPath;

    @ConfigProperty(name = "plantuml.charset", defaultValue = "UTF-8")
    String charset;

    @PostConstruct
    public void init() {
        // 配置 Graphviz 路径
        if (graphvizDotPath.isPresent()) {
            System.setProperty("GRAPHVIZ_DOT", graphvizDotPath.get());
        }

        // 配置字体路径
        if (fontPath.isPresent()) {
            System.setProperty("java.awt.fonts", fontPath.get());
        }

        // 设置字符编码
        System.setProperty("file.encoding", charset);
        System.setProperty("plantuml.include.path", "/app");

        // 启用所有安全特性但允许字体
        System.setProperty("plantuml.security.allownonlocal", "false");
    }

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
