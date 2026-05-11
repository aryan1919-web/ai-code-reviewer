FROM node:18-slim

WORKDIR /app

# Copy everything
COPY . .

# Install backend deps
RUN cd backend && npm install --omit=dev

# Install frontend deps and build
RUN cd frontend && npm install && npm run build

# HF Spaces expects port 7860
ENV PORT=7860
EXPOSE 7860

# Use the existing 'node' user (uid 1000) instead of creating a new one
RUN chown -R node:node /app
USER node

CMD ["node", "backend/server.js"]
