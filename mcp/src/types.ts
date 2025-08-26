import { z } from 'zod';

// PlantUML 请求参数验证模式
export const PlantUMLRequestSchema = z.object({
  code: z.string().min(1, 'PlantUML code cannot be empty'),
  format: z.enum(['png', 'svg', 'pdf', 'eps']).default('png'),
});

// PlantUML 响应模式
export const PlantUMLResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.string().optional(),
  format: z.string().optional(),
});

// 导出类型
export type PlantUMLRequest = z.infer<typeof PlantUMLRequestSchema>;
export type PlantUMLResponse = z.infer<typeof PlantUMLResponseSchema>;

// 支持的格式
export const SUPPORTED_FORMATS = ['png', 'svg', 'pdf', 'eps'] as const;
export type SupportedFormat = typeof SUPPORTED_FORMATS[number];

// JSON Schema for MCP tools (AJV compatible)
export const GenerateDiagramArgsSchema = {
  type: "object",
  properties: {
    code: {
      type: "string",
      minLength: 1,
      description: "PlantUML source code (required). Must include @startuml and @enduml tags. Example: '@startuml\\nAlice -> Bob: Hello\\n@enduml'"
    },
    format: {
      type: "string",
      enum: ["png", "svg", "pdf", "eps"],
      default: "png",
      description: "Output image format (optional). Defaults to 'png'. Options: png (web), svg (scalable), pdf (documents), eps (publications)"
    },
    save_path: {
      type: "string",
      description: "Local file save path (optional). When provided, saves diagram to file and omits Base64 data from response to save bandwidth. Example: './diagrams/my-diagram.png'"
    },
    savePath: {
      type: "string",
      description: "Alias for save_path. Local file save path (optional). Supports both camelCase and snake_case naming conventions."
    }
  },
  required: ["code"],
  additionalProperties: false
} as const;

export const GetFormatsArgsSchema = {
  type: "object",
  properties: {},
  additionalProperties: false
} as const;

// Zod schemas for runtime validation
export const GenerateDiagramZodSchema = z.object({
  code: z.string().min(1, 'PlantUML code cannot be empty'),
  format: z.enum(['png', 'svg', 'pdf', 'eps']).default('png'),
  save_path: z.string().optional(),
  savePath: z.string().optional(), // 支持 camelCase 别名
});

export type GenerateDiagramArgs = z.infer<typeof GenerateDiagramZodSchema>;
export type GetFormatsArgs = Record<string, never>;
