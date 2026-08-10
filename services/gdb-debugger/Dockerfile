# GDB debugger service for the cppFan Code Lab (#442). Ships a g++/gdb toolchain
# so cppFan's single user can compile and debug C++ in a dedicated container.
# Deployed on the same OVH environment family as Judge0.
FROM node:22-bookworm-slim

# Build + debug toolchain. The service does not claim per-session network isolation.
RUN apt-get update \
  && apt-get install -y --no-install-recommends g++ gdb \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json tsconfig.json ./
RUN npm install

COPY src ./src
RUN npm run build

# Run as a non-root user; debugged inferiors inherit these reduced privileges.
RUN useradd --create-home --shell /usr/sbin/nologin debugger
USER debugger

ENV PORT=3008
EXPOSE 3008

CMD ["node", "dist/server.js"]
