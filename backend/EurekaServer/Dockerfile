FROM eclipse-temurin:17-jdk

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

VOLUME /tmp
COPY target/eureka-server-*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
EXPOSE 8761
