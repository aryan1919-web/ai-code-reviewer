FROM node:18-slim

WORKDIR /app

# Copy everything first
COPY . .

# Install backend deps
RUN cd backend && npm install --omit=dev

# Install frontend deps and build
RUN cd frontend && npm install && npm run build

# Create non-root user (HF Spaces requirement)
RUN useradd -m -u 1000 user
RUN chown -R user:user /app
USER user

# HF Spaces expects port 7860
ENV PORT=7860
EXPOSE 7860

CMD ["node", "backend/server.js"]
