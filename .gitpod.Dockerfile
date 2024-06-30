FROM gitpod/workspace-full:latest

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs

# Install npm dependencies
COPY package.json package-lock.json ./
RUN npm install
