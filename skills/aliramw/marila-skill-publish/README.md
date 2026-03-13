# marila-skill-publish

马锐拉的 ClawHub 技能发布流程与经验总结。

## 📖 内容

本技能包含完整的 ClawHub 技能发布指南，基于实际发布 `dingtalk-ai-table` 技能的经验总结。

### 涵盖内容

- ✅ 完整的技能发布流程
- ✅ SKILL.md 元数据规范
- ✅ 常见问题与解决方案
- ✅ 版本更新流程
- ✅ 安全注意事项
- ✅ 最佳实践

## 🚀 使用

这是一个**文档技能**，主要用于参考和查阅。

```bash
# 安装技能
clawhub install marila-skill-publish

# 查看文档
cat ~/.openclaw/workspace/skills/marila-skill-publish/SKILL.md
```

## 📝 快速参考

### 发布命令

```bash
# 直接发布
clawhub publish . --slug my-skill --version 1.0.0 --changelog "更新说明"

# 使用 sync（推荐）
clawhub sync
```

### 必需文件

- `SKILL.md` - 技能主文档（含 frontmatter 元数据）
- `package.json` - 包信息
- `README.md` - 使用说明
- `CHANGELOG.md` - 版本历史

### 关键元数据

```yaml
metadata:
  openclaw:
    requires:
      env: [YOUR_ENV_VAR]
      bins: [your-cli-tool]
    primaryEnv: YOUR_ENV_VAR
    homepage: https://github.com/user/repo
```

## 🔗 相关资源

- [ClawHub 技能市场](https://clawhub.ai/skills)
- [dingtalk-ai-table 技能](https://clawhub.ai/aliramw/dingtalk-ai-table)
- [ClawHub 文档](https://clawhub.ai/docs)

---

**版本：** 1.0.0  
**作者：** 马锐拉 (@aliramw)  
**日期：** 2026-02-27
