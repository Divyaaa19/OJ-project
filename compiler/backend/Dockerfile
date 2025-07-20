FROM node:18-alpine
WORKDIR /app

# Install system dependencies and compilers
RUN apk update && apk add --no-cache \
    gcc \
    g++ \
    openjdk21 \
    python3 \
    py3-pip \
    make \
    bash

# Set Java environment variables
ENV JAVA_HOME=/usr/lib/jvm/java-21-openjdk
ENV PATH=$PATH:$JAVA_HOME/bin

# Verify installations
RUN gcc --version && \
    g++ --version && \
    java --version && \
    javac --version && \
    python3 --version

COPY . .
EXPOSE 8000
CMD ["node","index.js"]