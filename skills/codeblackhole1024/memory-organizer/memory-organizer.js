#!/usr/bin/env node

/**
 * Memory Organizer - Organize and compress memory files
 * Features:
 * 1. Scan memory files
 * 2. Analyze content importance
 * 3. Classify by topic
 * 4. Compress/discard redundant content
 * 
 * Security: Validates paths to prevent directory traversal
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Get workspace from env or argument, with validation
function getWorkspace() {
  const envWorkspace = process.env.OPENCLAW_WORKSPACE;
  if (envWorkspace) {
    return path.resolve(envWorkspace);
  }
  
  // Default to home workspace
  const home = os.homedir();
  return path.join(home, '.openclaw', 'workspace-main');
}

// Validate that a file path is within the allowed directory
function isPathSafe(filePath, baseDir) {
  const resolved = path.resolve(filePath);
  const baseResolved = path.resolve(baseDir);
  return resolved.startsWith(baseResolved + path.sep) || resolved === baseResolved;
}

// Validate filename to prevent path traversal
function isFilenameSafe(filename) {
  // Reject any path components, only allow simple filenames
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false;
  }
  // Reject hidden files (except .md)
  if (filename.startsWith('.') && !filename.startsWith('..')) {
    return false;
  }
  // Only allow .md files
  if (!filename.endsWith('.md')) {
    return false;
  }
  return true;
}

const WORKSPACE = getWorkspace();
const MEMORY_DIR = path.join(WORKSPACE, 'memory');
const MAIN_MEMORY = path.join(WORKSPACE, 'MEMORY.md');

// Topic keyword mapping
const TOPIC_KEYWORDS = {
  'User Preferences': ['用户', '偏好', 'preference', '称呼', '名字', '时区', 'timezone', 'name', 'pronoun'],
  'Project Config': ['项目', '配置', 'config', 'agent', '工作空间', 'workspace', 'cron', '定时', 'bot', 'skill'],
  'Skills': ['skill', '工具', 'tool', '安装', 'install', 'command'],
  'Money Ideas': ['赚钱', '副业', 'money', '收入', '点子', '项目', 'income'],
  'Todos': ['待办', 'todo', '任务', 'task', '下一步', '计划', 'next'],
  'Tech Notes': ['代码', 'command', '命令', '技术', '调试', '问题', '解决', 'code', 'fix'],
  'Daily': ['日记', '日志', '记录', '今天', '昨天', '日常', 'daily', 'log']
};

// Keywords to keep
const IMPORTANT_KEYWORDS = [
  '用户', '偏好', '配置', '项目', '待办', '任务', 'Agent', '重要', '关键',
  'user', 'preference', 'config', 'project', 'todo', 'task', 'important', 'key'
];

// Keywords to discard
const DISCARD_KEYWORDS = [
  '测试', 'test', '调试', '临时', 'temp', '日志', '详情', '具体过程',
  'debug', 'temporary', 'details', 'process'
];

/**
 * Scan memory directory
 */
function scanMemories() {
  if (!fs.existsSync(MEMORY_DIR)) {
    console.log('❌ Memory directory does not exist');
    return [];
  }

  const files = fs.readdirSync(MEMORY_DIR)
    .filter(f => f.endsWith('.md') && !f.endsWith('.bak') && !f.endsWith('.discarded'))
    .map(f => {
      const filePath = path.join(MEMORY_DIR, f);
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf-8');
      return {
        name: f,
        size: stats.size,
        lines: content.split('\n').length,
        chars: content.length
      };
    });

  console.log('\n📁 Memory files:\n');
  console.log(`  Workspace: ${WORKSPACE}`);
  console.log(`  Memory dir: ${MEMORY_DIR}\n`);
  
  let totalChars = 0;
  files.forEach(f => {
    console.log(`  ${f.name}: ${f.chars} chars, ${f.lines} lines`);
    totalChars += f.chars;
  });
  console.log(`\nTotal: ${files.length} files, ${totalChars} chars`);

  return files;
}

/**
 * Analyze memory content topic
 */
function analyzeTopic(content) {
  const scores = {};
  
  Object.keys(TOPIC_KEYWORDS).forEach(topic => {
    scores[topic] = 0;
  });
  scores['Uncategorized'] = 0;

  Object.entries(TOPIC_KEYWORDS).forEach(([topic, keywords]) => {
    keywords.forEach(kw => {
      const regex = new RegExp(kw, 'gi');
      const matches = content.match(regex);
      if (matches) {
        scores[topic] += matches.length;
      }
    });
  });

  let maxTopic = 'Uncategorized';
  let maxScore = 0;
  
  Object.entries(scores).forEach(([topic, score]) => {
    if (score > maxScore) {
      maxScore = score;
      maxTopic = topic;
    }
  });

  return { topic: maxTopic, scores };
}

/**
 * Classify all memory files
 */
function classifyMemories() {
  if (!fs.existsSync(MEMORY_DIR)) {
    console.log('❌ Memory directory does not exist');
    return;
  }

  const files = fs.readdirSync(MEMORY_DIR)
    .filter(f => f.endsWith('.md') && !f.endsWith('.bak') && !f.endsWith('.discarded'));

  const categories = {};

  console.log('\n🗂️ Memory classification:\n');

  files.forEach(f => {
    const content = fs.readFileSync(path.join(MEMORY_DIR, f), 'utf-8');
    const { topic, scores } = analyzeTopic(content);
    
    if (!categories[topic]) {
      categories[topic] = [];
    }
    categories[topic].push({
      file: f,
      chars: content.length,
      scores
    });
  });

  Object.entries(categories).forEach(([topic, items]) => {
    console.log(`\n📌 ${topic} (${items.length})`);
    items.forEach(item => {
      console.log(`   - ${item.file} (${item.chars} chars)`);
    });
  });

  return categories;
}

/**
 * Find redundant memories
 */
function findRedundant() {
  const categories = classifyMemories();
  const redundant = [];

  Object.entries(categories).forEach(([topic, items]) => {
    if (items.length > 1) {
      items.sort((a, b) => a.file.localeCompare(b.file));
      redundant.push({
        topic,
        keep: items[items.length - 1].file,
        discard: items.slice(0, items.length - 1).map(i => i.file)
      });
    }
  });

  if (redundant.length === 0) {
    console.log('\n✅ No redundant memories found');
    return [];
  }

  console.log('\n⚠️ Redundant memories found:\n');
  redundant.forEach(r => {
    console.log(`📌 ${r.topic}:`);
    console.log(`   Keep: ${r.keep}`);
    console.log(`   Discard: ${r.discard.join(', ')}`);
  });

  return redundant;
}

/**
 * Discard memory file (with safety check)
 */
function discardMemory(filename, force = false) {
  // Security: validate filename
  if (!isFilenameSafe(filename)) {
    console.log(`❌ Invalid filename: ${filename}`);
    return false;
  }

  const filePath = path.join(MEMORY_DIR, filename);
  
  // Security: validate path is within memory directory
  if (!isPathSafe(filePath, MEMORY_DIR)) {
    console.log(`❌ Path outside memory directory: ${filename}`);
    return false;
  }
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File does not exist: ${filename}`);
    return false;
  }

  if (!force) {
    console.log(`⚠️ Confirm discard ${filename}?`);
    console.log('   Use --force to force discard');
    return false;
  }

  const backupPath = filePath + '.discarded';
  fs.renameSync(filePath, backupPath);
  
  console.log(`🗑️ Discarded: ${filename}`);
  console.log(`   Backup: ${filename}.discarded`);
  
  return true;
}

/**
 * Batch discard redundant memories
 */
function discardRedundant(force = false) {
  const redundant = findRedundant();
  
  if (redundant.length === 0) {
    console.log('✅ No memories to discard');
    return;
  }

  let discarded = 0;
  redundant.forEach(r => {
    r.discard.forEach(filename => {
      if (discardMemory(filename, force)) {
        discarded++;
      }
    });
  });

  console.log(`\n✅ Discarded ${discarded} files`);
}

/**
 * Compress memory file
 */
function compressMemory(filename, options = {}) {
  // Security: validate filename
  if (!isFilenameSafe(filename)) {
    console.log(`❌ Invalid filename: ${filename}`);
    return false;
  }

  const filePath = path.join(MEMORY_DIR, filename);
  
  // Security: validate path
  if (!isPathSafe(filePath, MEMORY_DIR)) {
    console.log(`❌ Path outside memory directory`);
    return false;
  }
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File does not exist: ${filename}`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  let compressed;
  if (options.aggressive) {
    compressed = lines.filter(l => l.startsWith('#'));
  } else if (options.keepTitles) {
    compressed = lines.filter(l => 
      l.startsWith('#') || 
      l.startsWith('- ') || 
      l.startsWith('* ')
    );
  } else {
    compressed = lines.filter(l => {
      const lower = l.toLowerCase();
      return l.startsWith('#') || 
             l.startsWith('- ') || 
             l.startsWith('* ') ||
             IMPORTANT_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));
    });
  }

  const result = compressed.join('\n');
  
  fs.writeFileSync(filePath + '.bak', content);
  fs.writeFileSync(filePath, result);

  console.log(`✅ Compressed: ${filename}`);
  console.log(`   Original: ${content.length} -> Compressed: ${result.length} chars`);

  return true;
}

/**
 * Merge to main memory
 */
function mergeToMain(sourceFile) {
  // Security: validate filename
  if (!isFilenameSafe(sourceFile)) {
    console.log(`❌ Invalid filename: ${sourceFile}`);
    return false;
  }

  const sourcePath = path.join(MEMORY_DIR, sourceFile);
  
  // Security: validate path
  if (!isPathSafe(sourcePath, MEMORY_DIR)) {
    console.log(`❌ Path outside memory directory`);
    return false;
  }
  
  if (!fs.existsSync(sourcePath)) {
    console.log(`❌ Source file does not exist: ${sourceFile}`);
    return false;
  }

  const sourceContent = fs.readFileSync(sourcePath, 'utf-8');
  const { topic } = analyzeTopic(sourceContent);
  
  const importantLines = sourceContent.split('\n').filter(l => 
    l.startsWith('#') || l.startsWith('- ') || l.startsWith('* ')
  );

  let mainContent = '';
  if (fs.existsSync(MAIN_MEMORY)) {
    mainContent = fs.readFileSync(MAIN_MEMORY, 'utf-8');
  }

  const merged = mainContent + '\n\n---\n\n## ' + topic + ': ' + sourceFile + '\n\n' + importantLines.join('\n');
  fs.writeFileSync(MAIN_MEMORY, merged);
  
  console.log(`✅ Merged to MEMORY.md [${topic}]: ${sourceFile}`);
  return true;
}

/**
 * View memory content
 */
function viewMemory(filename) {
  // Security: validate filename
  if (!isFilenameSafe(filename)) {
    console.log(`❌ Invalid filename: ${filename}`);
    return;
  }

  const filePath = path.join(MEMORY_DIR, filename);
  
  // Security: validate path
  if (!isPathSafe(filePath, MEMORY_DIR)) {
    console.log(`❌ Path outside memory directory`);
    return;
  }
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File does not exist: ${filename}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const { topic } = analyzeTopic(content);
  
  console.log(`\n📄 ${filename} [${topic}]`);
  console.log('─'.repeat(40));
  console.log(content);
}

/**
 * Cleanup backups and discarded files
 */
function cleanup() {
  if (!fs.existsSync(MEMORY_DIR)) return;

  const patterns = ['.bak', '.discarded'];
  let count = 0;

  patterns.forEach(pattern => {
    fs.readdirSync(MEMORY_DIR)
      .filter(f => f.endsWith(pattern))
      .forEach(f => {
        fs.unlinkSync(path.join(MEMORY_DIR, f));
        count++;
        console.log(`🗑️ Deleted: ${f}`);
      });
  });

  console.log(`\n✅ Cleaned ${count} files`);
}

// Main
const args = process.argv.slice(2);
const command = args[0];

console.log('🧠 Memory Organizer v2.1');
console.log('=======================\n');

// Handle workspace override
if (args.includes('--workspace')) {
  const idx = args.indexOf('--workspace');
  if (args[idx + 1]) {
    process.env.OPENCLAW_WORKSPACE = args[idx + 1];
    console.log(`Workspace: ${getWorkspace()}\n`);
  }
}

switch (command) {
  case 'scan':
    scanMemories();
    break;

  case 'classify':
  case 'cat':
    classifyMemories();
    break;

  case 'redundant':
    findRedundant();
    break;

  case 'discard':
    const force = args.includes('--force');
    if (args[1] === 'redundant') {
      discardRedundant(force);
    } else if (args[1]) {
      discardMemory(args[1], force);
    } else {
      console.log('Usage: memory-organizer discard <filename>');
      console.log('       memory-organizer discard redundant [--force]');
    }
    break;

  case 'compress':
    const fileToCompress = args[1];
    const options = {
      keepTitles: args.includes('--titles'),
      aggressive: args.includes('--aggressive')
    };
    if (fileToCompress) {
      compressMemory(fileToCompress, options);
    } else {
      console.log('Usage: memory-organizer compress <filename> [--titles] [--aggressive]');
    }
    break;

  case 'merge':
    const fileToMerge = args[1];
    if (fileToMerge) {
      mergeToMain(fileToMerge);
    } else {
      console.log('Usage: memory-organizer merge <filename>');
    }
    break;

  case 'view':
    const fileToView = args[1];
    if (fileToView) {
      viewMemory(fileToView);
    } else {
      console.log('Usage: memory-organizer view <filename>');
    }
    break;

  case 'clean':
    cleanup();
    break;

  case 'help':
  default:
    console.log(`
🧠 Memory Organizer v2.1 - Memory Organization Tool

Usage:
  memory-organizer scan                   Scan all memory files
  memory-organizer classify              Classify by topic
  memory-organizer redundant             Find redundant memories
  memory-organizer discard <filename>    Discard memory file
  memory-organizer discard redundant [--force]  Discard redundant files
  memory-organizer compress <filename>   Compress file
  memory-organizer compress <filename> --titles  Keep titles only
  memory-organizer compress <filename> --aggressive  Aggressive compression
  memory-organizer merge <filename>      Merge to MEMORY.md
  memory-organizer view <filename>       View memory content
  memory-organizer clean                 Clean backups/discarded files
  memory-organizer --workspace <path>    Use custom workspace

Security:
  - Validates all file paths to prevent directory traversal
  - Only allows .md files in memory directory
  - Workspace can be customized via --workspace or OPENCLAW_WORKSPACE env

Topics:
  - User Preferences
  - Project Config
  - Skills
  - Money Ideas
  - Todos
  - Tech Notes
  - Daily
`);
}
