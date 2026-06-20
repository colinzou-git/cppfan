FROM ubuntu:24.04

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      clang \
      g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace
USER 65532:65532

