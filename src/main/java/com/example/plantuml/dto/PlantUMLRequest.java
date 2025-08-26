package com.example.plantuml.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PlantUMLRequest {
    
    @JsonProperty("code")
    private String code;
    
    @JsonProperty("format")
    private String format = "png"; // 默认格式为PNG
    
    public PlantUMLRequest() {}
    
    public PlantUMLRequest(String code, String format) {
        this.code = code;
        this.format = format;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
    
    public String getFormat() {
        return format;
    }
    
    public void setFormat(String format) {
        this.format = format;
    }
}
