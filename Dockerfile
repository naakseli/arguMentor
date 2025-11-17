FROM node:22-bullseye-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY packages/backend/package.json packages/backend/
COPY packages/client/package.json packages/client/
COPY packages/shared/package.json packages/shared/
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --frozen-lockfile --recursive

FROM deps AS build
COPY . .
RUN pnpm --filter @argumentor/shared run build
RUN pnpm --filter @argumentor/backend run build
RUN pnpm --filter @argumentor/client run build

FROM base AS argumentor-backend
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json .
COPY --from=build /app/pnpm-lock.yaml .
COPY --from=build /app/pnpm-workspace.yaml .
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
EXPOSE 3000
CMD ["pnpm", "--filter", "@argumentor/backend", "run", "start"]

FROM nginx:1.27-alpine AS argumentor-client
COPY --from=build /app/packages/client/dist /usr/share/nginx/html
COPY --from=build /app/packages/client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]