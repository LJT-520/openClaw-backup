---
name: wan-image-video-gen-edit
description: Image and Video Generation and Editting wiht Wan series models. It offers text2image, image editting(with prompt), text2video and image2video capabiliteis.
homepage: https://bailian.console.aliyun.com/cn-beijing?tab=model#/model-market
metadata: {"clawdbot":{"emoji":"🔍","requires":{"bins":["python3"],"env":["DASHSCOPE_API_KEY"]},"primaryEnv":"DASHSCOPE_API_KEY"},"author":"KrisYe"}
---

# Wan Models

Wan Models, created by Alibaba Group, are popular image and video generation and editting models and widely adopted around the world. This skill integrates with Wan Modles APIs on ModelStudio(Bailian-Alibaba Model Service Platform).

## text2image generation

```bash
python3 {baseDir}/scripts/wan-magic.py text2image --prompt "一个女生站在楼顶的阳台上，夕阳照在她的脸上"
python3 {baseDir}/scripts/wan-magic.py text2image --prompt "一位长发女孩坐在书桌前，背对着镜头，戴着耳机。阳光透过窗户洒进房间，照亮了她和周围散落的书籍与杂物" --size 1280*1280
python3 {baseDir}/scripts/wan-magic.py text2image --prompt "女生优雅地倚在车门旁，身穿红色褶皱长裙，在复古色调的室内场景中缓慢转身看向镜头，霓虹光斑在玻璃窗上流动，轻微晃动，背景家具逐渐虚化凸显人物独白，画面带有电影胶片颗粒质感，港风朦胧光影映照出淡淡的忧伤情绪" --quantity 1
```

### Options

- `--quantity`: Number of images (default: 1, max: 4)
- `--prompt`: User Prompt for Image Generation
- `--size`: Image resolution(default:1280*1280,support resolutions with a width and height from 512 to 1440 pixels, provided the total pixel count does not exceed 1440*1440. Common resolutions:1280*1280,1104*1472,1472*1104,960*1696,1696*960)

## image2image editting

```bash
python3 {baseDir}/scripts/wan-magic.py image-edit --prompt "参考图1的风格和图2的背景，生成一张全新的图片" \
  --images 'https://cdn.wanx.aliyuncs.com/tmp/pressure/umbrella1.png' \
  'https://img.alicdn.com/imgextra/i3/O1CN01SfG4J41UYn9WNt4X1_!!6000000002530-49-tps-1696-960.webp' \
  --size "1280*1280"
  python3 {baseDir}/scripts/wan-magic.py image-edit --prompt "参考图1的风格和图2的背景，生成一张全新的图片" \
  --images '/Users/yejianhongali/workDir/pic1.png' \
  '/Users/yejianhongali/workDir/pic2.webp' 
python3 {baseDir}/scripts/wan-magic.py image-edit --prompt "参考图1的风格和图2的背景，生成一张全新的图片" --images 'https://cdn.wanx.aliyuncs.com/tmp/pressure/umbrella1.png' 'https://img.alicdn.com/imgextra/i3/O1CN01SfG4J41UYn9WNt4X1_!!6000000002530-49-tps-1696-960.webp' --quantity 1
```

### Options

- `--quantity`: Number of images (default: 1, max: 4)
- `--prompt`: User Prompt for Image Editting
- `--images`: Images to be editted(min: 1 image, max: 4 images).Could be image url or local image file(the wan-magic.py script will turn local image into base64 and pass to model API)
- `--size`: Image resolution(default:1280*1280,support resolutions with a width and height from 512 to 1440 pixels, provided the total pixel count does not exceed 1440*1440. Common resolutions:1280*1280,1104*1472,1472*1104,960*1696,1696*960)

## text2video generation

### text2video task-submit
```bash
python3 {baseDir}/scripts/wan-magic.py text2video-gen --prompt "一幅史诗级可爱的场景。一只小巧可爱的卡通小猫将军，身穿细节精致的金色盔甲，头戴一个稍大的头盔，勇敢地站在悬崖上。他骑着一匹虽小但英勇的战马，说：”青海长云暗雪山，孤城遥望玉门关。黄沙百战穿金甲，不破楼兰终不还。“。悬崖下方，一支由老鼠组成的、数量庞大、无穷无尽的军队正带着临时制作的武器向前冲锋。这是一个戏剧性的、大规模的战斗场景，灵感来自中国古代的战争史诗。远处的雪山上空，天空乌云密布。整体氛围是“可爱”与“霸气”的搞笑和史诗般的融合。" --duration 10 --size "1920*1080"
```

#### Options

- `--duration`: duration(seconds) of video (default: 5, max: 15)
- `--prompt`: User Prompt for video generation
- `--size`: Image resolution(default:1920*1080,support any resolutions of 720p and 1080p. required:input resolution numbers(eg. 1280*720) instead of 720p)

### text2video tasks-get(round-robin)
```bash
python3 {baseDir}/scripts/wan-magic.py text2video-get --task-id “<TASK_ID_FROM_VIDEO_GEN>”
```

## image2video generation

### image2video task-submit
```bash
python3 {baseDir}/scripts/wan-magic.py image2video-gen --prompt "一幅都市奇幻艺术的场景。一个充满动感的涂鸦艺术角色。一个由喷漆所画成的少年，正从一面混凝土墙上活过来。他一边用极快的语速演唱一首英文rap，一边摆着一个经典的、充满活力的说唱歌手姿势。场景设定在夜晚一个充满都市感的铁路桥下。灯光来自一盏孤零零的街灯，营造出电影般的氛围，充满高能量和惊人的细节。视频的音频部分完全由他的rap构成，没有其他对话或杂音。" --image "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20250925/wpimhv/rap.png" --duration 10 --resolution "720P"
python3 {baseDir}/scripts/wan-magic.py image2video-gen --prompt "一幅都市奇幻艺术的场景。一个充满动感的涂鸦艺术角色。一个由喷漆所画成的少年，正从一面混凝土墙上活过来。他一边用极快的语速演唱一首英文rap，一边摆着一个经典的、充满活力的说唱歌手姿势。场景设定在夜晚一个充满都市感的铁路桥下。灯光来自一盏孤零零的街灯，营造出电影般的氛围，充满高能量和惊人的细节。视频的音频部分完全由他的rap构成，没有其他对话或杂音。" --image "/Users/yejianhongali/workDir/rap.png" 
```

#### Options

- `--duration`: duration(seconds) of video (default: 5, max: 15)
- `--prompt`: User Prompt for video generation
- `--image`: Image as the first frame of the to-be-gen video. Could be image url or local image file(the wan-magic.py script will turn local image into base64 and pass to model API)
- `--resolution`: Video resolution(default:1080P,support 720P, 1080P. reqired: 720P or 1080P instead of numbers)

### image2video tasks-get(round-robin)
```bash
python3 {baseDir}/scripts/wan-magic.py image2video-get --task-id “<TASK_ID_FROM_VIDEO_GEN>”
```



