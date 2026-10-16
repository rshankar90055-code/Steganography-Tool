# 🔐 Steganography Tool

A modern steganography and encryption tool built with React, with a Python Flask backend using Pillow, NumPy, and PyCryptodome.

## 🚀 Frontend

```bash
npm install
npm start
```

Optionally set:
```
REACT_APP_API_BASE=http://localhost:8000
```

## 🧰 Backend (Flask)

### Setup
```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
python backend/app.py  # runs on http://localhost:8000
```

### Endpoints
- POST `/embed` (form-data): `image` file, `message` string, `key` string
- POST `/extract` (form-data): `image` file, `key` string
- POST `/encrypt` (json): `text`, `key`
- POST `/decrypt` (json): `encrypted`, `key`
- GET `/health`

The frontend utilities `src/utils/steganography.js` and `src/utils/encryption.js` call these endpoints.

---

Happy Hiding! 🔐✨
