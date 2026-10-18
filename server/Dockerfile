FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install dependencies (production dependencies only)
RUN npm ci --omit=dev

# Copy application source code with correct node ownership
COPY --chown=node:node . .

# Create symlinks so Linux handles both 'models'/'Models' and 'Routes'/'routes' smoothly
RUN ln -s /app/models /app/Models 2>/dev/null || true && \
    ln -s /app/Routes /app/routes 2>/dev/null || true

# Expose server port
ENV PORT=6969
EXPOSE 6969

# Run as non-root user for container security
USER node

# Start Express & Socket.io server
CMD ["node", "index.js"]
