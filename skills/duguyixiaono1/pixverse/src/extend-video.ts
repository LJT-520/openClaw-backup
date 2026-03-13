#!/usr/bin/env node

import { PixVerseClient, ExtendVideoOptions } from './lib/pixverse-client.js';

interface Args {
  video?: string;
  video_id?: string;
  extend_seconds?: string;
  prompt?: string;
  resolution?: string;
  model?: string;
  seed?: string;
}

async function main() {
  try {
    // Parse arguments
    const args = parseArgs(process.argv.slice(2));

    if (!args.video && !args.video_id) {
      console.error('Error: either --video or --video_id is required');
      console.error('Usage: /extend-video --video <path> [--extend_seconds 5] [--prompt "continuation"] [--resolution 720p] [--model v5.5] [--seed 0]');
      console.error('   OR: /extend-video --video_id <id> [--extend_seconds 5] [--prompt "continuation"] [--resolution 720p] [--model v5.5] [--seed 0]');
      process.exit(1);
    }

    console.log('🎬 Starting video extension...');
    if (args.video_id) {
      console.log(`Video ID: ${args.video_id}`);
    } else {
      console.log(`Video: ${args.video}`);
    }
    console.log(`Extend: ${args.extend_seconds || 5} seconds`);

    // Initialize client
    const client = new PixVerseClient();

    // Prepare options
    const options: ExtendVideoOptions = {
      video: args.video,
      videoId: args.video_id ? parseInt(args.video_id) : undefined,
      extendSeconds: args.extend_seconds ? parseInt(args.extend_seconds) as any : 8,
      prompt: args.prompt,
      resolution: args.resolution as any || '720p',
      model: args.model as any || 'v5.5',
      seed: args.seed ? parseInt(args.seed) : 0
    };

    // Extend video
    const task = await client.extendVideo(options);
    console.log(`✅ Task created: ${task.taskId}`);
    console.log('⏳ Waiting for video extension (this may take 1-2 minutes)...');

    // Wait for completion
    const result = await client.waitForCompletion(task.taskId);

    console.log('\n🎉 Video extended successfully!');
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
