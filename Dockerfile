FROM node:18-slim

WORKDIR /app

# Copy and install backend deps
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --production

# Copy and install frontend deps + build
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Copy backend source
COPY backend/ ./backend/

# Create non-root user (HF Spaces requirement)
RUN useradd -m -u 1000 user
RUN chown -R user:user /app
USER user

# HF Spaces expects port 7860
ENV PORT=7860
EXPOSE 7860

CMD ["node", "backend/server.js"]
