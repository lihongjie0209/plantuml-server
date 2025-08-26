package com.example.plantuml.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PlantUMLResponse {
    
    @JsonProperty("success")
    private boolean success;
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("format")
    private String format;
    
    @JsonProperty("base64Data")
    private String base64Data;
    
    public PlantUMLResponse() {}
    
    public PlantUMLResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    public PlantUMLResponse(boolean success, String message, String format, String base64Data) {
        this.success = success;
        this.message = message;
        this.format = format;
        this.base64Data = base64Data;
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getFormat() {
        return format;
    }
    
    public void setFormat(String format) {
        this.format = format;
    }
    
    public String getBase64Data() {
        return base64Data;
    }
    
    public void setBase64Data(String base64Data) {
        this.base64Data = base64Data;
    }
}
