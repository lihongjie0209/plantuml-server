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

// 工具参数模式
export const GenerateDiagramArgsSchema = z.object({
  code: z.string().describe('PlantUML diagram code'),
  format: z.enum(['png', 'svg', 'pdf', 'eps']).default('png').describe('Output format for the diagram'),
});

export const ValidateCodeArgsSchema = z.object({
  code: z.string().describe('PlantUML code to validate'),
});

export const GetFormatsArgsSchema = z.object({});

export type GenerateDiagramArgs = z.infer<typeof GenerateDiagramArgsSchema>;
export type ValidateCodeArgs = z.infer<typeof ValidateCodeArgsSchema>;
export type GetFormatsArgs = z.infer<typeof GetFormatsArgsSchema>;
