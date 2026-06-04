# Security Policy

## Supported Versions

Currently, the main branch of this repository is supported with security updates.

## Secret Management

This repository adheres to strict secret management policies:
- **No secrets in source code**: API keys, database credentials, JWT keys, and other sensitive information MUST NOT be committed to the repository.
- **Environment Variables**: Use `.env` files for local development. See `.env.example` templates in `frontend/` and `backend/`.
- **Gitignore**: A comprehensive `.gitignore` is maintained to prevent accidental commits of `.env` files, local databases (`db.sqlite3`), and user uploaded statements (e.g., `*.csv`).

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please send an email to the repository maintainer. All security vulnerabilities will be promptly addressed.
