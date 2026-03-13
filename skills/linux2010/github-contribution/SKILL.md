# GitHub Contribution Skill

## Purpose
Automated GitHub contribution workflow that handles fork synchronization, branch creation, and PR submission while maintaining clean fork state.

## Core Features

### 1. Fork Protection & Synchronization
- **Main Branch Protection**: Never commit directly to main branch
- **Automatic Sync**: Regularly sync fork main with upstream official repository  
- **Clean State Enforcement**: Ensure fork main branch matches official repository exactly
- **Pollution Prevention**: Prevent local work files from contaminating main branch

### 2. Automated Contribution Workflow
- **Fork Setup**: Automatically configure upstream remote if not exists
- **Branch Creation**: Create feature branches based on latest official code
- **PR Submission**: Handle pull request creation with proper templates
- **Issue Integration**: Link fixes to relevant GitHub issues

### 3. Safety Measures
- **Pre-flight Validation**: Verify fork cleanliness before starting
- **Atomic Operations**: All changes happen in isolated feature branches
- **Rollback Support**: Easy recovery if something goes wrong
- **Permission Handling**: Work within GitHub token permission constraints

## Usage

### Basic Command
```bash
./github-contribution.sh <username> <owner/repo> <issue-number> <branch-name> [projects-root]
```

### Examples
```bash
# Fix issue #123 in openclaw/openclaw
./github-contribution.sh Linux2010 openclaw/openclaw 123 fix/issue-description

# Specify custom project root
./github-contribution.sh Linux2010 openclaw/openclaw 456 fix/bug-fix /custom/path
```

## Fork Protection Best Practices

### Main Branch Rules
1. **Never commit directly** to fork's main branch
2. **Always sync first** before creating new branches
3. **Use feature branches** for all development work
4. **Regular cleanup** of local pollution files

### Safe Synchronization Script
```bash
#!/bin/bash
# sync-fork.sh - Safe fork synchronization

git checkout main
git fetch upstream
git reset --hard upstream/main
git clean -fdx  # Remove all untracked files

# Verify clean state
if [[ $(git status --porcelain) ]]; then
    echo "❌ Warning: Working tree not clean"
    exit 1
fi
echo "✅ Fork synchronized successfully"
```

### Local Git Configuration
```bash
# Prevent accidental main branch pushes
git config branch.main.pushRemote no_push

# Set safe push default
git config push.default nothing
```

## Workflow Steps

### Step 1: Fork Validation
- Check if fork exists and is accessible
- Verify upstream remote configuration
- Validate current fork state cleanliness

### Step 2: Synchronization  
- Fetch latest from upstream official repository
- Reset local main branch to match upstream exactly
- Clean any untracked/local pollution files
- Push synchronized state to fork (if permissions allow)

### Step 3: Feature Branch Creation
- Create new branch from clean main
- Apply necessary changes and fixes
- Commit with proper semantic format
- Push feature branch to fork

### Step 4: PR Creation
- Generate PR with complete template
- Link to relevant issue numbers
- Include proper change type and scope
- Add security impact assessment

## Error Handling

### Common Issues & Solutions

#### Fork Not Clean
- **Problem**: Local main branch has extra commits/files
- **Solution**: Force reset to upstream and clean untracked files

#### Permission Denied (Workflow Scope)
- **Problem**: Token lacks workflow permissions
- **Solution**: Use web-based PR creation or update token permissions

#### Upstream Not Configured  
- **Problem**: Missing upstream remote
- **Solution**: Auto-add upstream remote pointing to official repository

#### Branch Already Exists
- **Problem**: Feature branch already exists
- **Solution**: Use unique branch naming or delete existing branch

## Security Considerations

### Token Permissions
- **Minimum Required**: `repo` scope
- **Optional**: `workflow` scope (for full automation)
- **Never Grant**: Excessive permissions beyond contribution needs

### Local Security
- **File Cleanup**: Always clean working directory after contributions
- **Credential Management**: Use secure credential storage
- **Audit Trail**: Maintain logs of all contribution activities

## Integration with Other Skills

### PR Advocacy Skill
- Hand off created PRs to PR Advocacy for monitoring
- Share PR tracking information for continuous follow-up
- Coordinate review response and maintenance

### Document Spell Check Skill  
- Pre-validate documentation changes before PR creation
- Ensure all text content passes spell checking
- Maintain documentation quality standards

## Best Practices

### For Contributors
- Always start from clean, synchronized main branch
- Use descriptive branch names following convention
- Fill complete PR templates with all required fields
- Test changes locally before pushing

### For Maintainers  
- Regularly audit fork cleanliness
- Update synchronization scripts as needed
- Monitor token permissions and security
- Document contribution workflows for team members

## Limitations

### GitHub Fork Restrictions
- Cannot set full branch protection rules on forks
- Limited automation capabilities without workflow permissions
- Manual intervention sometimes required for complex scenarios

### Workarounds
- Use local git hooks for additional protection
- Implement manual verification steps in workflow
- Leverage GitHub web interface for final PR creation when needed

## Maintenance

### Updates
- Regular script updates for new GitHub API changes
- Security patches for authentication methods
- Performance improvements for large repositories

### Monitoring
- Track success/failure rates of contribution attempts
- Monitor GitHub API rate limit usage
- Collect user feedback for workflow improvements