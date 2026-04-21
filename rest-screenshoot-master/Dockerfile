FROM mcr.microsoft.com/playwright:v1.52.0-noble

# Point to the pre-installed browsers — skip re-downloading them
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src/ ./src/

EXPOSE 3000
CMD ["npm", "start"]
