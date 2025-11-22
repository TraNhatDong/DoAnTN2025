Notification Service (Spring Boot)

How to build:
1. mvn clean package
2. docker build -t notification-service .

How to run with docker-compose (example):
notification-service:
  build: ./notification-service
  ports:
    - "8084:8084"
  environment:
    - SPRING_RABBITMQ_HOST=rabbitmq
    - SPRING_RABBITMQ_PORT=5672
    - SPRING_RABBITMQ_USERNAME=guest
    - SPRING_RABBITMQ_PASSWORD=guest
    - SMTP_HOST=mailhog
    - SMTP_PORT=1025
  depends_on:
    - rabbitmq
    - mailhog
