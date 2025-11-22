package com.example.signature.service;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.GetObjectArgs;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.file.Files;

@Service
public class MinioService {
    private final MinioClient client;
    private final String bucket;

    public MinioService(@Value("${minio.endpoint}") String endpoint,
                        @Value("${minio.accessKey}") String accessKey,
                        @Value("${minio.secretKey}") String secretKey,
                        @Value("${minio.bucket}") String bucket) throws Exception {
        this.client = MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
        this.bucket = bucket;

        // Tạo bucket nếu chưa có
        boolean found = client.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
        if (!found) {
            client.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
        }
    }

    public void uploadFile(File file, String objectName, String contentType) throws Exception {
        try (InputStream is = new FileInputStream(file)) {
            client.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectName)
                    .stream(is, file.length(), -1)
                    .contentType(contentType)
                    .build());
        }
    }

    public void uploadBytes(byte[] bytes, String objectName, String contentType) throws Exception {
        try (InputStream is = new java.io.ByteArrayInputStream(bytes)) {
            client.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectName)
                    .stream(is, bytes.length, -1)
                    .contentType(contentType)
                    .build());
        }
    }


    public File downloadToTemp(String objectName) throws Exception {
        File tmp = Files.createTempFile("minio_", "_obj").toFile();
        try (InputStream is = client.getObject(GetObjectArgs.builder()
                .bucket(bucket)
                .object(objectName)
                .build());
             java.io.FileOutputStream fos = new java.io.FileOutputStream(tmp)) {
            is.transferTo(fos);
        }
        return tmp;
    }
}
