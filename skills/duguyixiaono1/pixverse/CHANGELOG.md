# Changelog

All notable changes to the PixVerse Skills project will be documented in this file.

## [0.2.0] - 2026-02-26

### 🎯 Parameter Alignment with Official MCP

**Full alignment with official PixVerse MCP parameters**
- Updated all parameters based on official MCP (https://github.com/PixVerseAI/PixVerse-MCP)
- 21 parameters added/updated
- Fully compatible with official API specifications

### ✨ New Features

**Text-to-Video (gen-video)**
- ✅ Added `--model` parameter: Support for v4.5 and v5 model selection
- ✅ Added `--motion_mode` parameter: Support for normal and fast motion modes
- ✅ Added `--negative_prompt` parameter: Exclude unwanted elements

**Image-to-Video (img2video)**
- ✅ Parameter renamed: `motion_strength` → `motion_mode` (aligned with official)
- ✅ Added `--aspect_ratio` parameter: Customizable aspect ratio
- ✅ Added `--resolution` parameter: Customizable resolution (previously hardcoded to 540p)
- ✅ Added `--model` parameter: Model version selection

**Video Extension (extend-video)**
- ✅ Added `--video_id` parameter: Use existing video ID directly (no re-upload needed)
- ✅ Added `--aspect_ratio` parameter: Customizable aspect ratio
- ✅ Added `--resolution` parameter: Customizable resolution (previously hardcoded to 540p)
- ✅ Added `--model` parameter: Model version selection
- ✅ Added `--motion_mode` parameter: Motion mode configuration
- ✅ Fixed default value: `extend_seconds` changed from 4 to 5 (API only supports 5 or 8)

### 🔧 Bug Fixes

**ES Modules Compatibility**
- Fixed `require('form-data')` causing module loading errors
- Changed to ES6 import syntax

**API Parameter Fixes**
- Image upload field name: Fixed to `image` (was `file`)
- Video extension parameter: Fixed to `source_video_id` (was `video_media_id`)
- Duration validation: Only accepts 5 or 8 seconds (not 4)

### 🧪 Testing

**New Tests**
- ✅ Image-to-video: Successfully generated and uploaded images
- ✅ Video extension: Successfully extended video (using video_id)
- ✅ Parameter validation: Confirmed all new parameters work correctly

### 📚 Documentation

**Updated Documentation**
- README.md: Updated all parameter descriptions and examples
- API_KEY_GUIDE.md: Complete API key acquisition guide
- skills.json: Updated all skill parameter definitions

### 🔄 Breaking Changes

**Parameter Renaming**
- Image-to-Video: `motion_strength` → `motion_mode`
  - Migration: Change all `--motion_strength` to `--motion_mode`

**Default Value Changes**
- Video Extension: `extend_seconds` default changed from 4 to 5
  - Reason: Official API only supports 5 or 8 seconds
  - Impact: Default extension is now 5 seconds instead of 4

### 📊 API Discoveries

**Image Upload**
- Endpoint: `/openapi/v2/image/upload`
- Field name: `image` (not `file`)
- Response: `{ErrCode, ErrMsg, Resp: {img_id, img_url}}`

**Media Upload**
- Endpoint: `/openapi/v2/media/upload`
- Field name: `file`
- Response: `{ErrCode, ErrMsg, Resp: {media_id, media_type, url}}`

**Video Extension**
- Endpoint: `/openapi/v2/video/extend/generate`
- Key parameter: `source_video_id` (number type)
- Duration constraint: Only 5 or 8 seconds supported

---

## [0.1.0] - 2026-02-26

### ✅ Initial Release

**Core Features**
- Three video generation skills implemented
  - `/gen-video` - Text-to-video generation
  - `/img2video` - Image-to-video animation
  - `/extend-video` - Video extension

**Features**
- Full PixVerse API v2 integration
- Support for multiple resolutions (360p, 540p, 720p, 1080p)
- Multiple aspect ratios (16:9, 9:16, 1:1, 3:4, 4:3)
- Configurable video duration (5s or 8s)
- Automatic file upload for images and videos
- Task status polling with progress display
- Comprehensive error handling

**Technical Stack**
- TypeScript for type safety
- Axios for HTTP requests
- Form-data for file uploads
- UUID for request tracing

**Documentation**
- Complete README with usage examples
- API Key setup guide
- Quick start guide
- Troubleshooting section

### 🔧 Fixed Issues

**API Integration**
- Fixed endpoint URL: `https://app-api.pixverse.ai`
- Fixed authentication: Using `API-KEY` header
- Fixed request parameters: Using string values instead of numeric codes
- Fixed status code mapping:
  - 1 = completed
  - 5 = processing
  - 7 = content moderation failure
  - 8 = generation failed
- Added `Ai-trace-id` header for request tracking

**Error Handling**
- Improved error messages with error codes
- Better API error detection and reporting
- Meaningful error descriptions for common issues

### 📝 Testing

**Successfully Tested**
- ✅ Text-to-video generation with various prompts
- ✅ API key authentication
- ✅ Status polling and completion detection
- ✅ Video URL retrieval

**Test Results**
- Video generation time: ~15-30 seconds
- Status polling interval: 5 seconds
- Successfully generated video URLs accessible

### 📊 Performance

- Initial load time: < 1s
- API response time: ~200-500ms
- Video generation time: 15-30s (depending on complexity)
- Polling interval: 5s

### 🎯 Known Limitations

- Image/video uploads from URLs not yet implemented (local files only)
- No batch processing support yet
- No video download automation
- Maximum video duration: 8 seconds
- 1080p limited to 5 seconds

### 🙏 Credits

- Built by PixVerse team
- Powered by PixVerse API v2
- Based on [PixVerse-MCP](https://github.com/PixVerseAI/PixVerse-MCP)
