'use strict';

const SEVERITY_ICON = { critical: '🔴', high: '🟠', medium: '🟡', low: '🔵', info: '✅' };
const SOURCE_LABELS = {
  heartbeat: '💓 Heartbeat', hooks: '🪝 Hooks', whatsapp: '📱 WhatsApp',
  subagents: '🤖 Subagents', skills: '🔧 Skills', memory: '🧠 Memory',
  primary_model: '⚙️ Primary Model', sessions: '💬 Sessions',
  workspace: '📁 Workspace', config: '📄 Config',
};

function relativeAge(ageMs) {
  if (!ageMs) return 'unknown';
  const s = Math.floor(ageMs / 1000);
  if (s < 60)          return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60)          return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)          return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30)          return `${d}d ago`;
  const mo = Math.floor(d / 30);
  return `${mo}mo ago`;
}

function absoluteDate(updatedAt) {
  if (!updatedAt) return '';
  return new Date(updatedAt).toLocaleString();
}

function generateMarkdownReport(analysis) {
  const { summary, findings, sessions, primaryModel, scannedAt } = analysis;
  const bleed = summary.estimatedMonthlyBleed;
  const lines = [];

  lines.push('# Clawculator Report');
  lines.push('> Your friendly penny pincher. · 100% offline · Zero AI · Pure deterministic logic');
  lines.push('');
  lines.push(`**Scanned:** ${new Date(scannedAt).toLocaleString()}`);
  if (primaryModel) lines.push(`**Primary model:** ${primaryModel}`);
  lines.push('');

  // Cost alert
  if (bleed > 0) {
    lines.push(`## ⚠️ Estimated Monthly Cost Exposure: $${bleed.toFixed(2)}/month`);
    lines.push('');
  } else {
    lines.push('## ✅ No significant cost bleed detected');
    lines.push('');
  }

  // Summary table
  lines.push('## Summary');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push(`| 🔴 Critical | ${summary.critical} |`);
  lines.push(`| 🟠 High | ${summary.high} |`);
  lines.push(`| 🟡 Medium | ${summary.medium} |`);
  lines.push(`| 🔵 Low | ${summary.low || 0} |`);
  lines.push(`| ✅ OK | ${summary.info} |`);
  lines.push(`| Sessions analyzed | ${summary.sessionsAnalyzed} |`);
  lines.push(`| Total tokens found | ${(summary.totalTokensFound || 0).toLocaleString()} |`);

  // Session cost summary
  if (sessions?.length > 0) {
    const totalCost = sessions.reduce((sum, s) => sum + s.cost, 0);
    const dailyRates = sessions.filter(s => s.dailyCost).map(s => s.dailyCost);
    const totalDailyRate = dailyRates.reduce((sum, r) => sum + r, 0);
    if (totalCost > 0)      lines.push(`| Total session cost (lifetime) | $${totalCost.toFixed(4)} |`);
    if (totalDailyRate > 0) lines.push(`| Avg daily burn rate | $${totalDailyRate.toFixed(4)}/day (~$${(totalDailyRate * 30).toFixed(2)}/month) |`);
  }
  lines.push('');

  // Findings by severity
  lines.push('## Findings');
  lines.push('');

  for (const severity of ['critical', 'high', 'medium', 'low', 'info']) {
    const group = findings.filter(f => f.severity === severity);
    if (!group.length) continue;

    lines.push(`### ${SEVERITY_ICON[severity]} ${severity.toUpperCase()} (${group.length})`);
    lines.push('');

    for (const f of group) {
      lines.push(`#### ${SOURCE_LABELS[f.source] || f.source}`);
      lines.push('');
      lines.push(`**${f.message}**`);
      lines.push('');
      if (f.detail)          lines.push(`${f.detail}`);
      if (f.monthlyCost > 0) lines.push(`**Monthly cost:** $${f.monthlyCost.toFixed(2)}/month`);
      if (f.fix) {
        lines.push('');
        lines.push(`**Fix:** ${f.fix}`);
      }
      if (f.command) {
        lines.push('');
        lines.push('```bash');
        lines.push(f.command);
        lines.push('```');
      }
      lines.push('');
    }
  }

  // Session breakdown
  if (sessions?.length > 0) {
    lines.push('## Session Breakdown');
    lines.push('');
    lines.push('| Session | Model | Tokens | Total Cost | $/day | Last Active |');
    lines.push('|---------|-------|--------|-----------|-------|-------------|');

    [...sessions]
      .sort((a, b) => (b.inputTokens + b.outputTokens) - (a.inputTokens + a.outputTokens))
      .slice(0, 20)
      .forEach(s => {
        const tok        = (s.inputTokens + s.outputTokens).toLocaleString();
        const flag       = s.isOrphaned ? ' ⚠️' : '';
        const keyDisplay = s.key.length > 12 ? s.key.slice(0, 8) + '…' : s.key;
        const age        = s.ageMs ? `${relativeAge(s.ageMs)} (${absoluteDate(s.updatedAt)})` : 'unknown';
        const daily      = s.dailyCost ? `$${s.dailyCost.toFixed(4)}` : '—';
        lines.push(`| \`${keyDisplay}${flag}\` | ${s.modelLabel || s.model} | ${tok} | $${s.cost.toFixed(6)} | ${daily} | ${age} |`);
      });

    lines.push('');
    lines.push('> ⚠️ = orphaned session · $/day = total cost ÷ session age');
    lines.push('');
  }

  // Quick wins
  const wins = findings.filter(f => f.fix && f.severity !== 'info');
  if (wins.length > 0) {
    lines.push('## Quick Wins');
    lines.push('');
    wins.slice(0, 5).forEach((f, i) => {
      lines.push(`${i + 1}. **${f.fix}**`);
      if (f.command) lines.push(`   \`${f.command}\``);
    });
    lines.push('');
  }

  lines.push('---');
  lines.push('*Generated by [Clawculator](https://github.com/echoudhry/clawculator) · Your friendly penny pincher.*');

  return lines.join('\n');
}

module.exports = { generateMarkdownReport };
