# PlantUML 图片返回流程详解

## 📊 图片返回的两种方式

PlantUML 服务器提供了两种不同的图片返回方式，满足不同的使用场景：

### 🔄 方式一：Base64 编码返回 (JSON API)

**端点**: `POST /api/plantuml/generate`

```
客户端请求 → PlantUML服务器 → PlantUML引擎 → 生成图片 → Base64编码 → JSON响应
```

**流程详解**:

1. **客户端发送请求**:
   ```json
   POST /api/plantuml/generate
   {
     "code": "@startuml\\nAlice -> Bob: Hello\\n@enduml",
     "format": "png"
   }
   ```

2. **服务器处理** (`PlantUMLResource.generateImage()`):
   ```java
   // 1. 验证输入
   if (request.getCode() == null || request.getCode().trim().isEmpty()) {
       return Response.status(Response.Status.BAD_REQUEST)...
   }
   
   // 2. 解析格式
   FileFormat format = parseFormat(request.getFormat());
   
   // 3. 生成Base64图片
   String base64Data = plantUMLService.generateBase64Image(request.getCode(), format);
   ```

3. **PlantUML 引擎生成** (`PlantUMLService.generateBase64Image()`):
   ```java
   // 1. 创建PlantUML阅读器
   SourceStringReader reader = new SourceStringReader(plantUMLCode);
   
   // 2. 生成二进制图片数据
   ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
   FileFormatOption formatOption = new FileFormatOption(format);
   reader.outputImage(outputStream, formatOption);
   
   // 3. Base64编码
   byte[] imageBytes = outputStream.toByteArray();
   return Base64.getEncoder().encodeToString(imageBytes);
   ```

4. **JSON 响应返回**:
   ```json
   {
     "success": true,
     "message": "Image generated successfully",
     "format": "png",
     "base64Data": "iVBORw0KGgoAAAANSUhEUgAAAB4..."
   }
   ```

5. **客户端处理** (MCP 或其他客户端):
   ```typescript
   // MCP 客户端接收并可能进一步处理
   const response = await axios.post('/api/plantuml/generate', request);
   const base64Data = response.data.base64Data;
   
   // 如果需要保存为文件，需要解码：
   const buffer = Buffer.from(base64Data, 'base64');
   fs.writeFileSync('diagram.png', buffer);
   ```

### 📁 方式二：直接文件下载 (Binary API)

**端点**: `POST /api/plantuml/image/{format}`

```
客户端请求 → PlantUML服务器 → PlantUML引擎 → 生成图片 → 直接二进制响应
```

**流程详解**:

1. **客户端发送请求**:
   ```http
   POST /api/plantuml/image/png
   Content-Type: application/json
   
   {
     "code": "@startuml\\nAlice -> Bob: Hello\\n@enduml"
   }
   ```

2. **服务器处理** (`PlantUMLResource.generateImageDirect()`):
   ```java
   // 1. 解析格式参数
   FileFormat format = parseFormat(formatStr);
   
   // 2. 生成二进制图片数据
   byte[] imageBytes = plantUMLService.generateImage(request.getCode(), format);
   
   // 3. 设置正确的内容类型
   String contentType = plantUMLService.getContentType(format);
   
   // 4. 直接返回二进制数据
   return Response.ok(imageBytes)
       .header("Content-Type", contentType)
       .header("Content-Disposition", "attachment; filename=\\"diagram." + formatStr + "\\"")
       .build();
   ```

3. **内容类型映射** (`PlantUMLService.getContentType()`):
   ```java
   switch (format) {
       case PNG: return "image/png";
       case SVG: return "image/svg+xml";
       case EPS: return "application/postscript";
       case PDF: return "application/pdf";
   }
   ```

4. **直接二进制响应**:
   ```http
   HTTP/1.1 200 OK
   Content-Type: image/png
   Content-Disposition: attachment; filename="diagram.png"
   Content-Length: 1234
   
   [二进制PNG数据]
   ```

5. **客户端处理**:
   ```javascript
   // 浏览器直接下载文件
   const response = await fetch('/api/plantuml/image/png', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ code: plantUMLCode })
   });
   
   // 可以直接保存或显示
   const blob = await response.blob();
   const url = URL.createObjectURL(blob);
   ```

## 🔀 MCP 服务器的处理流程

MCP 服务器作为中间层，处理 AI 代理的请求：

```
AI代理 → MCP服务器 → PlantUML HTTP API → PlantUML引擎 → Base64响应 → MCP响应 → AI代理
```

**MCP 工具调用流程**:

1. **AI 代理调用 MCP 工具**:
   ```json
   {
     "jsonrpc": "2.0",
     "method": "tools/call",
     "params": {
       "name": "plantuml-generate",
       "arguments": {
         "code": "@startuml\\nAlice -> Bob\\n@enduml",
         "format": "png"
       }
     }
   }
   ```

2. **MCP 服务器验证参数** (`index.ts`):
   ```typescript
   // AJV Schema 验证
   const { code, format } = parseArgs<{ code: string; format?: string }>(
     args, 
     tools['plantuml-generate'].inputSchema
   );
   ```

3. **调用 PlantUML 客户端** (`client.ts`):
   ```typescript
   const result = await this.client.generateDiagram(code, format as any);
   ```

4. **格式化 MCP 响应**:
   ```typescript
   if (result.success) {
     return ok({
       success: true,
       format: result.format,
       data: result.data,  // Base64 编码的图片数据
       message: \`Diagram generated successfully in \${result.format} format\`,
       size: result.data ? \`\${Math.round(result.data.length * 0.75)} bytes\` : 'unknown'
     });
   }
   ```

## 📋 不同格式的处理

### PNG 格式
- **Content-Type**: `image/png`
- **特点**: 光栅图像，适合复杂图表
- **Base64**: 较大的编码字符串

### SVG 格式  
- **Content-Type**: `image/svg+xml`
- **特点**: 矢量图像，可缩放，适合简单图表
- **Base64**: 相对较小，基于 XML

### PDF 格式
- **Content-Type**: `application/pdf`
- **特点**: 文档格式，适合打印和报告
- **Base64**: 中等大小

### EPS 格式
- **Content-Type**: `application/postscript`
- **特点**: PostScript 格式，适合专业印刷
- **Base64**: 取决于图表复杂度

## 🚀 性能优化考虑

1. **流式响应**: 大文件可以考虑流式传输
2. **缓存**: 相同的 PlantUML 代码可以缓存结果
3. **压缩**: HTTP 响应可以启用 gzip 压缩
4. **异步处理**: 复杂图表可以异步生成

## 🔧 错误处理

```java
// 服务器端错误处理
try {
    String base64Data = plantUMLService.generateBase64Image(request.getCode(), format);
    return Response.ok(new PlantUMLResponse(true, "Success", format, base64Data)).build();
} catch (IOException e) {
    return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
        .entity(new PlantUMLResponse(false, "Error: " + e.getMessage()))
        .build();
}
```

```typescript
// MCP 客户端错误处理
try {
  const result = await this.client.generateDiagram(code, format);
  if (result.success) {
    return ok({ success: true, data: result.data });
  } else {
    return ok({ success: false, error: result.message });
  }
} catch (error) {
  throw new McpError(ErrorCode.InternalError, \`Tool failed: \${error?.message}\`);
}
```

这种双重 API 设计让 PlantUML 服务器既能满足 AI 代理通过 MCP 协议的集成需求（Base64 JSON），又能支持直接的文件下载需求（二进制响应）。
