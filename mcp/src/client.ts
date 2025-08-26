import axios, { AxiosResponse } from 'axios';
import { PlantUMLRequest, PlantUMLResponse, SupportedFormat } from './types.js';

/**
 * PlantUML 服务客户端
 */
export class PlantUMLClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:9090') {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // 移除末尾斜杠
  }

  /**
   * 生成 PlantUML 图表并返回 Base64 编码的图片
   */
  async generateDiagram(code: string, format: SupportedFormat = 'png'): Promise<PlantUMLResponse> {
    try {
      const request: PlantUMLRequest = { code, format };
      
      const response: AxiosResponse<PlantUMLResponse> = await axios.post(
        `${this.baseUrl}/api/plantuml/generate`,
        request,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30秒超时
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        return {
          success: false,
          message: `Request failed: ${errorMessage}`,
        };
      }
      
      return {
        success: false,
        message: `Unexpected error: ${error}`,
      };
    }
  }

  /**
   * 获取支持的格式列表
   */
  async getSupportedFormats(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/plantuml/formats`, {
        timeout: 10000,
      });
      
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch formats from server, using defaults');
      return ['png', 'svg', 'pdf', 'eps'];
    }
  }

  /**
   * 检查服务器健康状态
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/plantuml/health`, {
        timeout: 5000,
      });
      
      return {
        healthy: response.status === 200,
        message: response.data.status || 'Server is healthy',
      };
    } catch (error) {
      return {
        healthy: false,
        message: `Health check failed: ${error}`,
      };
    }
  }

  /**
   * 验证 PlantUML 代码语法
   */
  async validateCode(code: string): Promise<{ valid: boolean; message: string }> {
    try {
      // 使用最简单的格式进行快速验证
      const result = await this.generateDiagram(code, 'png');
      
      return {
        valid: result.success,
        message: result.message,
      };
    } catch (error) {
      return {
        valid: false,
        message: `Validation failed: ${error}`,
      };
    }
  }

  /**
   * 设置服务器 URL
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/$/, '');
  }

  /**
   * 获取当前服务器 URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}
