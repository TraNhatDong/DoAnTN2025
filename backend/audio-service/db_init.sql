CREATE DATABASE IF NOT EXISTS meetingdb;
USE meetingdb;


CREATE TABLE audio_files (
  id VARCHAR(36) PRIMARY KEY, 
    meeting_id VARCHAR(36) NOT NULL,                        -- tham chiếu logic đến meeting
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,                          -- đường dẫn lưu trữ (S3, local, ...)
	status ENUM('PENDING','PROCESSING','COMPLETED','FAILED') DEFAULT 'PENDING' ,
    created_by VARCHAR(36)  NOT NULL,                        -- user (thư ký) upload
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🔹 Index để tăng tốc truy vấn
CREATE INDEX idx_audio_meeting ON audio_files(meeting_id);
CREATE INDEX idx_audio_status ON audio_files(status);
