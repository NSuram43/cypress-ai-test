FROM cypress/included:13.15.0

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies, including ts-node for TypeScript support
RUN npm install

# Copy the rest of the project files
COPY . .

# Ensure tsconfig.json is copied (optional, for clarity)
COPY tsconfig.json .

# Run Cypress with ts-node to handle TypeScript config
CMD ["npx", "cypress", "run", "--config-file", "cypress.config.ts"]