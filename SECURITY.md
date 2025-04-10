# 🔐 Security Policy

## 📅 Supported Versions

We are actively maintaining the following versions of this project:

| Version | Status     |
|---------|------------|
| 1.0.0   | ✅ Supported |
| < 1.0.0 | ❌ Not Supported |

Please ensure you’re using the latest version to receive the latest security patches and improvements.

---

## 📢 Reporting a Vulnerability

If you discover a security vulnerability in this project, please follow these steps:

1. **Do NOT open public issues** — this could expose the vulnerability to others.
2. Send a **responsible disclosure email** to the project maintainer:
   - ✉️ Email: `sarthak.security@protonmail.com` (replace with your actual or a dummy email)
3. Include:
   - A clear description of the vulnerability.
   - Steps to reproduce it.
   - Potential impact.
   - Suggested fix (if known).

We will respond within **72 hours** and work with you to verify and patch the issue.

---

## 🔒 Security Measures in Place

We follow basic security best practices for a client-side web app:

- ✅ No use of user login or authentication (no sensitive data involved).
- ✅ App is **read-only** for users — no user data is stored or sent to a backend.
- ✅ Input handling is sanitized and limited (e.g., maze dimensions have bounds).
- ✅ No usage of 3rd-party scripts from unknown sources.
- ✅ Only trusted open-source libraries are used (React, Tailwind CSS, etc.).
- ✅ Site uses `HTTPS` in production (recommended if hosted via GitHub Pages, Vercel, etc.).

---

## ⚠️ Known Security Limitations

As this is a front-end only application with educational intent:

- ❗ No CSRF or XSS protection is implemented beyond React’s built-in handling.
- ❗ No access controls — the project is open to all users.
- ❗ No data encryption is used (not needed since no sensitive data is handled).

---

## 🛡️ Future Improvements (Planned)

- Implementing Content Security Policy (CSP) headers when hosted.
- Adding automated linting for dependency vulnerabilities.
- Switching to GitHub Dependabot / GitLab Dependency Scanning for alerts.

---

## 🙌 Thanks for Your Help

Security is a shared responsibility. If you spot something sketchy, please reach out. We appreciate your effort in helping us keep this project safe and solid for all users!

