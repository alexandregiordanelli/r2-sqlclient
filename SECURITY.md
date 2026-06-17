# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 🔒 Private Disclosure

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please report security issues privately:

1. **Email**: Send details to [your-email@example.com]
2. **Subject**: `[SECURITY] R2 SQL Client - Brief Description`
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
   - Your contact information

### 🕐 Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-7 days
  - High: 7-30 days
  - Medium: 30-90 days
  - Low: Best effort

### 🎁 Recognition

- Security researchers will be credited in:
  - Security advisories
  - Release notes
  - `SECURITY.md` hall of fame (with permission)

## Security Best Practices

### For Users

1. **Keep Updated**: Always use the latest version
2. **API Tokens**: 
   - Use tokens with minimum required permissions
   - Rotate tokens regularly
   - Never share tokens publicly
3. **Environment Variables**: 
   - Keep `.env` file private
   - Don't commit API keys to git
4. **Download**: Only download from official sources
   - GitHub Releases
   - Official website (when available)

### For Developers

1. **Dependencies**: 
   - Run `pnpm audit` regularly
   - Keep dependencies updated
   - Review security advisories

2. **Code Review**:
   - All PRs must be reviewed
   - Security-sensitive changes require 2 approvals

3. **Secrets**:
   - Never commit secrets to git
   - Use `.env.example` for templates
   - Scan for leaked secrets

4. **Input Validation**:
   - Validate all user inputs
   - Sanitize before SQL execution
   - Use parameterized queries

## Known Security Considerations

### Local Storage

- Credentials stored in browser localStorage
- **Risk**: Accessible to JavaScript (XSS)
- **Mitigation**: Tauri's security model limits XSS surface
- **Future**: Consider encrypted storage

### API Keys

- OpenAI API key stored in environment variables
- **Risk**: Key exposure in memory/logs
- **Mitigation**: Keys never sent to backend logs
- **Best Practice**: Use separate API key for this app

### Network

- All API calls use HTTPS
- No man-in-the-middle risk for Cloudflare APIs
- Certificate validation enforced by reqwest

### Desktop App

- Tauri provides native sandboxing
- IPC layer validates all commands
- No remote code execution risk

## Security Features

✅ **Implemented:**
- HTTPS-only API communication
- Certificate validation
- Input sanitization in SQL editor
- Tauri security model (limited syscall access)
- No telemetry or external tracking

🔄 **Planned:**
- Encrypted credential storage
- 2FA for connection profiles
- Audit logging
- Permission scoping

## Vulnerability Disclosure Policy

We follow **responsible disclosure**:

1. **Report** privately to maintainers
2. **Collaborate** on a fix
3. **Wait** for public release
4. **Publish** advisory after fix is deployed
5. **Credit** reporter (with permission)

### Embargo Period

- **Critical/High**: 7-14 days
- **Medium**: 30 days
- **Low**: 90 days

Embargo can be extended if:
- Fix requires significant refactoring
- Dependency fixes are pending
- Multiple coordinated releases needed

## Past Security Advisories

None yet (initial release).

## Bug Bounty

Currently, we do not offer a bug bounty program. This may change as the project grows.

## Contact

Security concerns: [your-email@example.com]
General inquiries: [GitHub Issues](https://github.com/yourusername/r2-sqlclient/issues)

---

**Thank you for helping keep R2 SQL Client secure!** 🔒
