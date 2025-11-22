FROM eclipse-temurin:17-jdk-jammy

# Cài gpg và curl
RUN apt-get update && apt-get install -y gnupg2 curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy jar
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar

# Chuẩn bị thư mục GNUPG
RUN mkdir -p /gnupg && chmod 700 /gnupg
ENV GNUPGHOME=/gnupg

# Copy script entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["java","-jar","/app/app.jar"]
