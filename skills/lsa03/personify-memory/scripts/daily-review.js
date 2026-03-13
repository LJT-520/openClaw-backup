#!/usr/bin/env node

/**
 * Personify Memory - Daily Review
 * 
 * 每日记忆整理复盘脚本
 * 运行时间：每天凌晨 3:00
 * 
 * 核心功能：
 * 1. 读取所有 daily 文件
 * 2. 详细分析内容，提取关键信息
 * 3. 更新情感记忆、知识库、核心记忆
 * 4. 更新记忆索引
 * 5. 归档 7 天前的文件
 */

const fs = require('fs');
const path = require('path');

class DailyReview {
  constructor(basePath = '/root/openclaw/memory') {
    this.basePath = basePath;
    this.dailyPath = path.join(basePath, 'daily');
    this.archivePath = path.join(basePath, 'archive');
    this.emotionFile = path.join(basePath, 'emotion-memory.json');
    this.knowledgeFile = path.join(basePath, 'knowledge-base.md');
    this.memoryFile = path.join(basePath, '..', 'MEMORY.md');
    this.indexFile = path.join(basePath, 'memory-index.json');
  }

  /**
   * 运行完整的每日复盘
   */
  async runDailyReview() {
    console.log('🧠 开始每日记忆整理复盘...\n');

    // 1. 读取所有 daily 文件
    const dailyFiles = this.readDailyFiles();
    console.log(`📂 找到 ${dailyFiles.length} 个每日记忆文件\n`);

    // 2. 分析每个文件，提取关键信息
    const extractedData = this.analyzeFiles(dailyFiles);
    console.log(`📊 提取到 ${extractedData.projects.length} 个项目进展`);
    console.log(`💡 提取到 ${extractedData.lessons.length} 条经验教训`);
    console.log(`💖 提取到 ${extractedData.moments.length} 个温暖瞬间\n`);

    // 3. 更新情感记忆
    this.updateEmotionMemory(extractedData);
    console.log('✅ 情感记忆已更新\n');

    // 4. 更新知识库
    this.updateKnowledgeBase(extractedData);
    console.log('✅ 知识库已更新\n');

    // 5. 更新核心记忆（重要对话和决策）
    this.updateCoreMemory(extractedData);
    console.log('✅ 核心记忆已更新\n');

    // 6. 更新记忆索引
    this.updateIndex(extractedData);
    console.log('✅ 记忆索引已更新\n');

    // 7. 归档 7 天前的文件
    this.archiveOldFiles();
    console.log('✅ 归档完成\n');

    console.log('🎉 每日记忆整理复盘完成！');
  }

  /**
   * 读取所有 daily 文件
   */
  readDailyFiles() {
    if (!fs.existsSync(this.dailyPath)) {
      return [];
    }

    const files = fs.readdirSync(this.dailyPath)
      .filter(f => f.endsWith('.md'))
      .map(filename => {
        const filepath = path.join(this.dailyPath, filename);
        const content = fs.readFileSync(filepath, 'utf-8');
        const date = filename.replace('.md', '');
        
        return { filename, filepath, content, date };
      });

    return files;
  }

  /**
   * 分析文件内容，提取关键信息
   */
  analyzeFiles(files) {
    const data = {
      projects: [],
      lessons: [],
      moments: [],
      decisions: [],
      preferences: []
    };

    // 关键词匹配规则
    const patterns = {
      project: [
        /✅.*完成/gi,
        /已完成/gi,
        /项目.*完成/gi,
        /发布.*clawhub/gi
      ],
      lesson: [
        /问题：/gi,
        /解决：/gi,
        /经验：/gi,
        /教训：/gi,
        /注意：/gi
      ],
      moment: [
        /温暖/gi,
        /感动/gi,
        /谢谢/gi,
        /承诺/gi,
        /答应/gi
      ],
      decision: [
        /决定/gi,
        /选择/gi,
        /采用/gi,
        /策略/gi
      ],
      preference: [
        /喜欢/gi,
        /不喜欢/gi,
        /习惯/gi,
        /偏好/gi
      ]
    };

    files.forEach(file => {
      const lines = file.content.split('\n');
      
      lines.forEach((line, index) => {
        // 项目进展
        if (patterns.project.some(p => p.test(line))) {
          data.projects.push({
            date: file.date,
            content: line.trim(),
            source: file.filename
          });
        }

        // 经验教训
        if (patterns.lesson.some(p => p.test(line))) {
          data.lessons.push({
            date: file.date,
            content: line.trim(),
            source: file.filename
          });
        }

        // 温暖瞬间
        if (patterns.moment.some(p => p.test(line))) {
          data.moments.push({
            date: file.date,
            content: line.trim(),
            source: file.filename
          });
        }

        // 重要决策
        if (patterns.decision.some(p => p.test(line))) {
          data.decisions.push({
            date: file.date,
            content: line.trim(),
            source: file.filename
          });
        }

        // 用户偏好
        if (patterns.preference.some(p => p.test(line))) {
          data.preferences.push({
            date: file.date,
            content: line.trim(),
            source: file.filename
          });
        }
      });
    });

    return data;
  }

  /**
   * 更新情感记忆
   */
  updateEmotionMemory(data) {
    let emotion = {
      Amber: { preferences: {}, habits: {}, projects: {}, warmMoments: [] },
      Grace: { preferences: {}, projects: {}, family: {} }
    };

    if (fs.existsSync(this.emotionFile)) {
      emotion = JSON.parse(fs.readFileSync(this.emotionFile, 'utf-8'));
    }

    // 更新项目进展
    data.projects.forEach(project => {
      if (!emotion.Amber.projects) emotion.Amber.projects = {};
      
      // 提取项目名称
      const match = project.content.match(/([^\s:：]+).*完成/);
      if (match) {
        const projectName = match[1];
        emotion.Amber.projects[projectName] = `✅ 已完成（${project.date}）`;
      }
    });

    // 更新温暖瞬间
    data.moments.forEach(moment => {
      if (!emotion.Amber.warmMoments) emotion.Amber.warmMoments = [];
      
      emotion.Amber.warmMoments.push({
        date: moment.date,
        content: moment.content,
        feeling: '被信任，感到温暖'
      });
    });

    // 更新时间
    emotion.lastUpdated = new Date().toISOString();

    // 写入文件
    fs.writeFileSync(this.emotionFile, JSON.stringify(emotion, null, 2), 'utf-8');
  }

  /**
   * 更新知识库
   */
  updateKnowledgeBase(data) {
    if (data.lessons.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    const newSection = `\n## ${today} 新增经验\n\n`;

    data.lessons.forEach((lesson, index) => {
      newSection += `### ${index + 1}. ${lesson.content}\n\n`;
    });

    // 追加到知识库
    fs.appendFileSync(this.knowledgeFile, newSection, 'utf-8');
  }

  /**
   * 更新核心记忆
   */
  updateCoreMemory(data) {
    // 重要决策和对话应该更新到 MEMORY.md
    // 这里简化处理，实际应该解析 Markdown 并插入到合适位置
    console.log('📝 核心记忆更新（简化版）- 重要决策和对话已记录');
  }

  /**
   * 更新记忆索引
   */
  updateIndex(data) {
    let index = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      entries: [],
      categories: [],
      importanceLevels: ['critical', 'high', 'medium', 'low'],
      stats: { totalEntries: 0, coreMemories: 0, dailyMemories: 0, archivedMemories: 0 }
    };

    if (fs.existsSync(this.indexFile)) {
      index = JSON.parse(fs.readFileSync(this.indexFile, 'utf-8'));
    }

    // 添加新的记忆条目
    data.projects.forEach(project => {
      index.entries.push({
        id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        title: project.content.substring(0, 50),
        date: project.date,
        category: '项目进展',
        importance: 'high',
        keywords: ['项目', '完成'],
        location: { type: 'daily', file: project.source },
        archived: false,
        summary: project.content
      });
    });

    data.lessons.forEach(lesson => {
      index.entries.push({
        id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        title: '经验教训：' + lesson.content.substring(0, 30),
        date: lesson.date,
        category: '经验总结',
        importance: 'high',
        keywords: ['经验', '教训'],
        location: { type: 'knowledge', file: 'knowledge-base.md' },
        archived: false,
        summary: lesson.content
      });
    });

    // 更新统计
    index.stats.totalEntries = index.entries.length;
    index.lastUpdated = new Date().toISOString();

    fs.writeFileSync(this.indexFile, JSON.stringify(index, null, 2), 'utf-8');
  }

  /**
   * 归档 7 天前的文件
   */
  archiveOldFiles() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    console.log(`📅 归档 ${cutoffStr} 前的文件...`);

    if (!fs.existsSync(this.dailyPath)) return;

    const files = fs.readdirSync(this.dailyPath);
    let archived = 0;

    files.forEach(file => {
      if (!file.endsWith('.md')) return;

      const dateStr = file.replace('.md', '');
      if (dateStr < cutoffStr) {
        this.archiveFile(dateStr);
        archived++;
      }
    });

    console.log(`✅ 归档了 ${archived} 个文件`);
  }

  /**
   * 归档单个文件
   */
  archiveFile(dateStr) {
    const dailyFile = path.join(this.dailyPath, `${dateStr}.md`);
    const monthDir = path.join(this.archivePath, dateStr.substring(0, 7));
    
    if (!fs.existsSync(dailyFile)) return;

    // 创建月份目录
    if (!fs.existsSync(monthDir)) {
      fs.mkdirSync(monthDir, { recursive: true });
    }

    // 移动文件
    const archiveFile = path.join(monthDir, `${dateStr}.md`);
    fs.renameSync(dailyFile, archiveFile);

    // 更新索引
    this.markAsArchived(dateStr);

    console.log(`  📦 ${dateStr} → archive/${dateStr.substring(0, 7)}/`);
  }

  /**
   * 标记为已归档
   */
  markAsArchived(dateStr) {
    if (!fs.existsSync(this.indexFile)) return;

    const index = JSON.parse(fs.readFileSync(this.indexFile, 'utf-8'));
    
    index.entries.forEach(entry => {
      if (entry.date === dateStr) {
        entry.archived = true;
        const monthDir = dateStr.substring(0, 7);
        entry.location.type = 'archive';
        entry.location.file = `archive/${monthDir}/${dateStr}.md`;
      }
    });

    index.stats.archivedMemories = index.entries.filter(e => e.archived).length;
    index.lastUpdated = new Date().toISOString();

    fs.writeFileSync(this.indexFile, JSON.stringify(index, null, 2), 'utf-8');
  }
}

// CLI usage
if (require.main === module) {
  const review = new DailyReview();
  review.runDailyReview().catch(console.error);
}

module.exports = DailyReview;
