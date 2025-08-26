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
      description: "PlantUML diagram code. Required. Example: '@startuml\\nAlice -> Bob: Hello\\n@enduml'"
    },
    format: {
      type: "string",
      enum: ["png", "svg", "pdf", "eps"],
      default: "png",
      description: "Output format for the diagram. Optional, defaults to 'png'. Use 'svg' for scalable graphics, 'pdf' for documents."
    }
  },
  required: ["code"],
  additionalProperties: false
} as const;

export const ValidateCodeArgsSchema = {
  type: "object",
  properties: {
    code: {
      type: "string",
      minLength: 1,
      description: "PlantUML code to validate. Required. Should include @startuml/@enduml tags."
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
});

export const ValidateCodeZodSchema = z.object({
  code: z.string().min(1, 'PlantUML code cannot be empty'),
});

export type GenerateDiagramArgs = z.infer<typeof GenerateDiagramZodSchema>;
export type ValidateCodeArgs = z.infer<typeof ValidateCodeZodSchema>;
export type GetFormatsArgs = Record<string, never>;
