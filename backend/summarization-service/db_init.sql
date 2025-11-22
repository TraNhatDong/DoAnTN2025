CREATE DATABASE IF NOT EXISTS meetingdb;
USE meetingdb;

-- ============================
-- 🔹 Bảng transcripts
-- ============================
CREATE TABLE IF NOT EXISTS transcripts (
    id VARCHAR(36) PRIMARY KEY,
    meeting_id VARCHAR(36) NOT NULL,              -- Liên kết đến Meeting Service
    audio_id VARCHAR(36),                         -- ID của file audio (nếu có)
    audio_path VARCHAR(255),                      -- Đường dẫn file audio
    content LONGTEXT NOT NULL,                    -- Nội dung transcript
    status VARCHAR(20) DEFAULT 'DRAFT' 
           CHECK (status IN ('DRAFT','REVIEWED','CONFIRMED')),
    created_by VARCHAR(36) NOT NULL,              -- ID người tạo (thư ký hoặc AI)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
                ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_transcript_meeting ON transcripts(meeting_id);

-- ============================
-- 🔹 Bảng summaries
-- ============================
CREATE TABLE IF NOT EXISTS summaries (
    id VARCHAR(36) PRIMARY KEY,
    meeting_id VARCHAR(36) NOT NULL,              -- Liên kết đến Meeting Service
    transcript_id VARCHAR(36) NOT NULL,           -- Bản transcript gốc
    content LONGTEXT NOT NULL,                    -- Nội dung tóm tắt
    status VARCHAR(20) DEFAULT 'DRAFT' 
           CHECK (status IN ('DRAFT','REVIEWED','CONFIRMED')),
    created_by VARCHAR(36) NOT NULL,              -- ID người tạo (AI hoặc thư ký)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
                ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_summary_transcript 
        FOREIGN KEY (transcript_id) REFERENCES transcripts(id)
);

CREATE INDEX idx_summary_meeting ON summaries(meeting_id);
CREATE INDEX idx_summary_transcript ON summaries(transcript_id);

-- ============================
-- 🔹 Bảng summary_reviews
-- ============================
CREATE TABLE IF NOT EXISTS summary_reviews (
    id VARCHAR(36) PRIMARY KEY,
    summary_id VARCHAR(36) NOT NULL,              -- Bản tóm tắt cần duyệt
    user_id VARCHAR(36) NOT NULL,                 -- Thành viên duyệt
    status VARCHAR(20) DEFAULT 'PENDING' 
           CHECK (status IN ('PENDING','CONFIRMED','REJECTED')),
    comment TEXT,     
    handled TINYINT(1) NULL,-- Nhận xét của người duyệt
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_review_summary 
        FOREIGN KEY (summary_id) REFERENCES summaries(id)
);

CREATE INDEX idx_review_summary ON summary_reviews(summary_id);
