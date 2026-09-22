# syntax=docker/dockerfile:1

# Pinned to match the @playwright/test version in package-lock.json -- if the image tag drifts
# from the installed version, Playwright can't find the browser executables at runtime.
FROM mcr.microsoft.com/playwright:v1.62.1-noble

WORKDIR /app

# Dependency manifests first so `npm ci` is only re-run when they change, not on every source edit.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Base image's default user (pwuser) already owns the browsers; hand over the app dir too so
# tests -- and their report output -- can run without root.
RUN chown -R pwuser:pwuser /app
USER pwuser

CMD ["npx", "playwright", "test"]
