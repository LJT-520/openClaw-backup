#!/usr/bin/env node

/**
 * Skill wrapper for OpenClaw/Claude Code integration
 * Converts JSON input to CLI arguments
 */

import { PixVerseClient } from './lib/pixverse-client.js';

async function main() {
  try {
    const [, , skillName, jsonInput] = process.argv;

    if (!skillName || !jsonInput) {
      console.error('Usage: node skill-wrapper.js <skill_name> <json_input>');
      process.exit(1);
    }

    const input = JSON.parse(jsonInput);
    const client = new PixVerseClient();

    console.log(`🎬 Running ${skillName}...`);

    switch (skillName) {
      case 'gen_video': {
        const task = await client.generateVideo({
          prompt: input.prompt,
          aspectRatio: input.aspect_ratio,
          duration: input.duration,
          resolution: input.resolution,
          model: input.model,
          motionMode: input.motion_mode,
          negativePrompt: input.negative_prompt,
          generateAudio: input.generate_audio
        });

        console.log(`✅ Task created: ${task.taskId}`);
        console.log('⏳ Waiting for video generation...');

        const result = await client.waitForCompletion(task.taskId);

        console.log('\n🎉 Video generated successfully!');
        console.log(`📹 Video URL: ${result.videoUrl}`);

        // Output JSON for skill result
        console.log('\n--- SKILL_OUTPUT ---');
        console.log(JSON.stringify({
          success: true,
          taskId: result.taskId,
          videoUrl: result.videoUrl,
          status: result.status
        }));
        break;
      }

      case 'img2video': {
        const task = await client.imageToVideo({
          image: input.image,
          prompt: input.prompt,
          motionMode: input.motion_mode,
          duration: input.duration,
          aspectRatio: input.aspect_ratio,
          resolution: input.resolution,
          model: input.model,
          generateAudio: input.generate_audio
        });

        console.log(`✅ Task created: ${task.taskId}`);
        console.log('⏳ Waiting for video generation...');

        const result = await client.waitForCompletion(task.taskId);

        console.log('\n🎉 Video generated successfully!');
        console.log(`📹 Video URL: ${result.videoUrl}`);

        console.log('\n--- SKILL_OUTPUT ---');
        console.log(JSON.stringify({
          success: true,
          taskId: result.taskId,
          videoUrl: result.videoUrl,
          status: result.status
        }));
        break;
      }

      case 'extend_video': {
        const task = await client.extendVideo({
          video: input.video,
          videoId: input.video_id,
          extendSeconds: input.extend_seconds,
          prompt: input.prompt,
          resolution: input.resolution,
          model: input.model,
          seed: input.seed
        });

        console.log(`✅ Task created: ${task.taskId}`);
        console.log('⏳ Waiting for video generation...');

        const result = await client.waitForCompletion(task.taskId);

        console.log('\n🎉 Video extended successfully!');
        console.log(`📹 Video URL: ${result.videoUrl}`);

        console.log('\n--- SKILL_OUTPUT ---');
        console.log(JSON.stringify({
          success: true,
          taskId: result.taskId,
          videoUrl: result.videoUrl,
          status: result.status
        }));
        break;
      }

      default:
        console.error(`Unknown skill: ${skillName}`);
        process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    console.log('\n--- SKILL_OUTPUT ---');
    console.log(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }));
    process.exit(1);
  }
}

main();
