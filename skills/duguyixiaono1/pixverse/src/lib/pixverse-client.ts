import axios, { AxiosInstance } from 'axios';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import FormData from 'form-data';

export interface VideoGenerationOptions {
  prompt: string;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
  duration?: 5 | 8 | 10;
  resolution?: '360p' | '540p' | '720p' | '1080p';
  model?: 'v5.5' | 'v5.6';
  motionMode?: 'normal' | 'fast';
  negativePrompt?: string;
  seed?: number;
  generateAudio?: boolean;
}

export interface ImageToVideoOptions {
  image: string;
  prompt?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
  resolution?: '360p' | '540p' | '720p' | '1080p';
  duration?: 5 | 8 | 10;
  model?: 'v5.5' | 'v5.6';
  motionMode?: 'normal' | 'fast';
  seed?: number;
  generateAudio?: boolean;
}

export interface ExtendVideoOptions {
  video?: string;
  videoId?: number;
  extendSeconds?: 5 | 8 | 10;
  prompt?: string;
  resolution?: '360p' | '540p' | '720p' | '1080p';
  model?: 'v5.5';
  seed?: number;
}

export interface VideoTask {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  progress?: number;
  error?: string;
}

export class PixVerseClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PIXVERSE_API_KEY || '';

    if (!this.apiKey) {
      throw new Error('PIXVERSE_API_KEY is required. Set it in environment variables or pass to constructor.');
    }

    this.client = axios.create({
      baseURL: 'https://app-api.pixverse.ai',
      headers: {
        'API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Add trace ID to every request
    this.client.interceptors.request.use((config) => {
      config.headers['Ai-trace-id'] = randomUUID();
      return config;
    });
  }

  /**
   * Generate video from text prompt
   */
  async generateVideo(options: VideoGenerationOptions): Promise<VideoTask> {
    try {
      const model = options.model || 'v5.6';
      const requestData: any = {
        model,
        prompt: options.prompt,
        aspect_ratio: options.aspectRatio || '16:9',
        duration: options.duration || 8,
        quality: options.resolution || '720p',
        motion_mode: options.motionMode || 'normal',
        seed: options.seed || 0
      };

      // Enable audio by default for v5.5/v5.6
      if (model === 'v5.5' || model === 'v5.6') {
        requestData.generate_audio_switch = options.generateAudio !== false;
      }

      // Add negative prompt if provided
      if (options.negativePrompt) {
        requestData.negative_prompt = options.negativePrompt;
      }

      const response = await this.client.post('/openapi/v2/video/text/generate', requestData);

      // Check for API errors
      if (response.data.ErrCode && response.data.ErrCode !== 0) {
        throw new Error(`API Error ${response.data.ErrCode}: ${response.data.ErrMsg}`);
      }

      return this.mapTaskResponse(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generate video from image
   */
  async imageToVideo(options: ImageToVideoOptions): Promise<VideoTask> {
    try {
      let imageId: number;

      // If it's a local file, upload it first
      if (!options.image.startsWith('http')) {
        imageId = await this.uploadImage(options.image);
      } else {
        throw new Error('URL-based images not yet supported. Please use local file paths.');
      }

      const imgModel = options.model || 'v5.6';
      const imgRequestData: any = {
        model: imgModel,
        prompt: options.prompt || '',
        img_id: imageId,
        aspect_ratio: options.aspectRatio || '16:9',
        duration: options.duration || 8,
        quality: options.resolution || '720p',
        motion_mode: options.motionMode || 'normal',
        seed: options.seed || 0
      };

      if (imgModel === 'v5.5' || imgModel === 'v5.6') {
        imgRequestData.generate_audio_switch = options.generateAudio !== false;
      }

      const response = await this.client.post('/openapi/v2/video/img/generate', imgRequestData);

      // Check for API errors
      if (response.data.ErrCode && response.data.ErrCode !== 0) {
        throw new Error(`API Error ${response.data.ErrCode}: ${response.data.ErrMsg}`);
      }

      return this.mapTaskResponse(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Extend existing video
   */
  async extendVideo(options: ExtendVideoOptions): Promise<VideoTask> {
    try {
      let videoId: number;

      // Use provided videoId if available, otherwise upload file
      if (options.videoId) {
        videoId = options.videoId;
      } else if (options.video) {
        // If it's a local file, upload it first
        if (!options.video.startsWith('http')) {
          videoId = await this.uploadMedia(options.video);
        } else {
          throw new Error('URL-based videos not yet supported. Please use local file paths or videoId.');
        }
      } else {
        throw new Error('Either video file path or videoId is required.');
      }

      const requestData: any = {
        model: options.model || 'v5.5',
        source_video_id: videoId,
        prompt: options.prompt || '',
        seed: options.seed || 0,
        duration: options.extendSeconds || 8,
        quality: options.resolution || '720p'
      };

      const response = await this.client.post('/openapi/v2/video/extend/generate', requestData);

      // Check for API errors
      if (response.data.ErrCode && response.data.ErrCode !== 0) {
        throw new Error(`API Error ${response.data.ErrCode}: ${response.data.ErrMsg}`);
      }

      return this.mapTaskResponse(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get task status
   */
  async getTaskStatus(videoId: string): Promise<VideoTask> {
    try {
      const response = await this.client.get(`/openapi/v2/video/result/${videoId}`);

      return this.mapTaskResponse(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Wait for task completion with polling
   */
  async waitForCompletion(taskId: string, maxWaitTime = 180000, pollInterval = 5000): Promise<VideoTask> {
    const startTime = Date.now();
    let lastStatus = '';

    while (Date.now() - startTime < maxWaitTime) {
      const task = await this.getTaskStatus(taskId);

      // Show status change
      if (task.status !== lastStatus) {
        console.log(`Status: ${task.status}`);
        lastStatus = task.status;
      }

      if (task.status === 'completed') {
        return task;
      }

      if (task.status === 'failed') {
        throw new Error(`Video generation failed: ${task.error || 'Unknown error'}`);
      }

      // Show progress if available
      if (task.progress !== undefined) {
        console.log(`Progress: ${task.progress}%`);
      }

      await this.sleep(pollInterval);
    }

    throw new Error('Video generation timed out');
  }

  /**
   * Upload image to PixVerse
   */
  private async uploadImage(filePath: string): Promise<number> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    const formData = new FormData();
    formData.append('image', fileBuffer, fileName);

    const response = await this.client.post('/openapi/v2/image/upload', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    // Response: {Resp: {img_id: number}}
    if (!response.data || !response.data.Resp) {
      throw new Error(`Invalid upload response: ${JSON.stringify(response.data)}`);
    }
    return response.data.Resp.img_id;
  }

  /**
   * Upload video/media to PixVerse
   */
  private async uploadMedia(filePath: string): Promise<number> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    const formData = new FormData();
    formData.append('file', fileBuffer, fileName);

    const response = await this.client.post('/openapi/v2/media/upload', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    // Response: {Resp: {media_id: number}}
    if (!response.data || !response.data.Resp) {
      throw new Error(`Invalid upload response: ${JSON.stringify(response.data)}`);
    }
    return response.data.Resp.media_id;
  }

  /**
   * Map API response to VideoTask
   */
  private mapTaskResponse(data: any): VideoTask {
    const resp = data.Resp || data;

    // Status mapping based on official docs:
    // 1 = Generation successful
    // 5 = Waiting for generation (processing)
    // 7 = Content moderation failure
    // 8 = Generation failed
    const statusMap: Record<number, VideoTask['status']> = {
      1: 'completed',
      5: 'processing',
      7: 'failed',
      8: 'failed'
    };

    return {
      taskId: String(resp.video_id || resp.id),
      status: statusMap[resp.status] || 'pending',
      videoUrl: resp.url,
      progress: resp.progress,
      error: resp.status === 7 ? 'Content moderation failure' : (resp.status === 8 ? 'Generation failed' : undefined)
    };
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const errMsg = error.response?.data?.ErrMsg || error.response?.data?.message || error.message;
      const errCode = error.response?.data?.ErrCode;

      let message = `PixVerse API Error: ${errMsg}`;
      if (errCode) {
        message += ` (Code: ${errCode})`;
      }

      return new Error(message);
    }
    return error;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
