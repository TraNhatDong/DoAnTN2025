Signature Service (Spring Boot) - GnuPG signing

How to use:
1. Build jar: mvn clean package
2. Place your GPG keys (private and public .asc exports) into a folder 'keys' and mount it in docker-compose as /keys (read-only).
3. docker-compose example snippet:
   signature-service:
     build: ./signature-service
     volumes:
       - ./keys:/keys:ro
     environment:
       - spring.datasource.url=jdbc:mysql://mysql:3306/meetingdb
       - spring.datasource.username=root
       - spring.datasource.password=root
       - minio.endpoint=http://minio:9000
       - minio.accessKey=minioadmin
       - minio.secretKey=minioadmin
       - minio.bucket=meeting-pdf
       - signature.gpgHome=/gnupg
       - signature.gpgUser=signer@example.com
     depends_on:
       - minio
       - rabbitmq
       - mysql

Endpoints:
- POST /api/sign/pdf  (form: meetingId, file)
