#!/usr/bin/env node

import { PixVerseClient, ImageToVideoOptions } from './lib/pixverse-client.js';

interface Args {
  image: string;
  prompt?: string;
  motion_mode?: string;
  duration?: string;
  aspect_ratio?: string;
  resolution?: string;
  model?: string;
  generate_audio?: string;
}

async function main() {
  try {
    // Parse arguments
    const args = parseArgs(process.argv.slice(2));

    if (!args.image) {
      console.error('Error: image is required');
      console.error('Usage: /img2video --image <path|url> [--prompt "motion description"] [--motion_mode normal] [--duration 5] [--aspect_ratio 16:9] [--resolution 720p] [--model v4.5]');
      process.exit(1);
    }

    console.log('🎬 Starting image-to-video conversion...');
    console.log(`Image: ${args.image}`);
    if (args.prompt) {
      console.log(`Motion: ${args.prompt}`);
    }

    // Initialize client
    const client = new PixVerseClient();

    // Prepare options
    const options: ImageToVideoOptions = {
      image: args.image,
      prompt: args.prompt,
      motionMode: args.motion_mode as any || 'normal',
      duration: args.duration ? parseInt(args.duration) as any : 8,
      aspectRatio: args.aspect_ratio as any || '16:9',
      resolution: args.resolution as any || '720p',
      model: args.model as any || 'v5.6',
      generateAudio: args.generate_audio !== 'false'
    };

    // Generate video
    const task = await client.imageToVideo(options);
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
