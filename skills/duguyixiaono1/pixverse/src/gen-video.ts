#!/usr/bin/env node

import { PixVerseClient, VideoGenerationOptions } from './lib/pixverse-client.js';

interface Args {
  prompt: string;
  aspect_ratio?: string;
  duration?: string;
  resolution?: string;
  model?: string;
  motion_mode?: string;
  negative_prompt?: string;
  generate_audio?: string;
}

async function main() {
  try {
    // Parse arguments
    const args = parseArgs(process.argv.slice(2));

    if (!args.prompt) {
      console.error('Error: prompt is required');
      console.error('Usage: /gen-video --prompt "your prompt" [--aspect_ratio 16:9] [--duration 5] [--resolution 720p] [--model v4.5] [--motion_mode normal] [--negative_prompt "text"]');
      process.exit(1);
    }

    console.log('🎬 Starting video generation...');
    console.log(`Prompt: ${args.prompt}`);

    // Initialize client
    const client = new PixVerseClient();

    // Prepare options
    const options: VideoGenerationOptions = {
      prompt: args.prompt,
      aspectRatio: args.aspect_ratio as any || '16:9',
      duration: args.duration ? parseInt(args.duration) as any : 8,
      resolution: args.resolution as any || '720p',
      model: args.model as any || 'v5.6',
      motionMode: args.motion_mode as any || 'normal',
      negativePrompt: args.negative_prompt,
      generateAudio: args.generate_audio !== 'false'
    };

    // Generate video
    const task = await client.generateVideo(options);
    console.log(`✅ Task created: ${task.taskId}`);
    console.log('⏳ Waiting for video generation (this may take 1-2 minutes)...');

    // Wait for completion
    const result = await client.waitForCompletion(task.taskId);

    console.log('\n🎉 Video generated successfully!');
    console.log(`📹 Video URL: ${result.videoUrl}`);
    console.log('\nYou can download or share this video.');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

function parseArgs(argv: string[]): Args {
  const args: any = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[i + 1];

      if (value && !value.startsWith('--')) {
        args[key] = value;
        i++;
      }
    }
  }

  return args;
}

main();
