# ---------- Estágio 1: build do frontend (Vite/React) ----------
FROM node:22-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# API no mesmo domínio (o FastAPI serve o frontend): URL relativa
ENV VITE_API_URL=""
RUN npm run build

# ---------- Estágio 2: runtime (FastAPI + estáticos) ----------
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080
WORKDIR /app

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./
COPY --from=frontend /app/frontend/dist ./static

# Usuário não-root
RUN useradd --system --uid 10001 --no-create-home app \
 && chown -R app:app /app
USER app

EXPOSE 8080
# Segredos (DATABASE_URL, JWT_SECRET_KEY, GROQ_API_KEY) entram só por variável de ambiente em runtime
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
