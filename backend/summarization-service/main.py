# main.py
from fastapi import FastAPI, Depends, HTTPException, Body
from pydantic import BaseModel
from typing import List, Optional
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from sqlalchemy.orm import Session
from datetime import datetime
import re
import socket
import py_eureka_client.eureka_client as eureka_client
import os

# =============================
# 0️⃣ Import DB và Models
# =============================
from db import SessionLocal, Summary, Transcript, SummaryReview, init_db, SummaryStatus

app = FastAPI(title="Summarization Service")
init_db()
# =============================
# 1️⃣ Database Dependency
# =============================
def get_db():
    """Tạo và đóng session cho mỗi request"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.on_event("startup")
async def register_to_eureka():
    try:
        await eureka_client.init_async(
            eureka_server=os.getenv("EUREKA_SERVER", "http://eureka-server:8761/eureka/"),
            app_name="SUMMARY-SERVICE",
            instance_host=socket.gethostbyname(socket.gethostname()),
            instance_port=int(os.getenv("PORT", "8080")),
        )
        print("✅ Registered SUMMARY-SERVICE to Eureka")
    except Exception as e:
        print("❌ Eureka registration failed:", e)


# =============================
# 2️⃣ API: Lấy bản summary mới nhất theo meeting_id
# =============================
@app.get("/summaries/{meeting_id}")
def get_latest_summary(meeting_id: str, db: Session = Depends(get_db)):
    """Lấy bản summary mới nhất của một cuộc họp"""
    try:
        summary = (
            db.query(Summary)
            .filter(Summary.meeting_id == meeting_id)
            .order_by(Summary.created_at.desc())
            .first()
        )

        if not summary:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy summary cho meeting_id={meeting_id}")

        return {
            "summary_id": summary.id,
            "meeting_id": summary.meeting_id,
            "status": summary.status.value if hasattr(summary.status, "value") else summary.status,
            "content": summary.content,
            "created_by": summary.created_by,
            "created_at": summary.created_at.isoformat() if summary.created_at else None,
        }

    except Exception as e:
        print(f"❌ Lỗi khi truy vấn summary: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi khi truy vấn dữ liệu: {str(e)}")


# =============================
# 3️⃣ API: Lấy transcript mới nhất theo meeting_id
# =============================
@app.get("/summaries/transcripts/{meeting_id}")
def get_latest_transcript(meeting_id: str, db: Session = Depends(get_db)):
    """Lấy transcript mới nhất của một cuộc họp"""
    try:
        transcript = (
            db.query(Transcript)
            .filter(Transcript.meeting_id == meeting_id)
            .order_by(Transcript.created_at.desc())
            .first()
        )

        if not transcript:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy transcript cho meeting_id={meeting_id}")

        return {
            "transcript_id": transcript.id,
            "meeting_id": transcript.meeting_id,
            "content": transcript.content,
            "status": transcript.status.value if hasattr(transcript.status, "value") else transcript.status,
            "created_by": transcript.created_by,
            "created_at": transcript.created_at.isoformat() if transcript.created_at else None,
            "updated_at": transcript.updated_at.isoformat() if transcript.updated_at else None,
        }

    except Exception as e:
        print(f"❌ Lỗi khi truy vấn transcript: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi khi truy vấn dữ liệu: {str(e)}")


# =============================
# 4️⃣ API: Lấy danh sách review theo summary_id
# =============================
@app.get("/summaries/summary-reviews/{summary_id}")
def get_reviews_by_summary(summary_id: str, db: Session = Depends(get_db)):
    """Lấy danh sách các review của 1 summary"""
    try:
        reviews = (
            db.query(SummaryReview)
            .filter(SummaryReview.summary_id == summary_id)
            .order_by(SummaryReview.reviewed_at.desc())
            .all()
        )

        if not reviews:
            raise HTTPException(status_code=404, detail=f"Không có review nào cho summary_id={summary_id}")

        return [
            {
                "review_id": r.id,
                "summary_id": r.summary_id,
                "user_id": r.user_id,
                "status": r.status.value if hasattr(r.status, "value") else r.status,
                "comment": r.comment,
                "handled": r.handled, 
                "reviewed_at": r.reviewed_at.isoformat() if r.reviewed_at else None,
            }
            for r in reviews
        ]

    except Exception as e:
        print(f"❌ Lỗi khi truy vấn review: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi khi truy vấn dữ liệu: {str(e)}")


# =============================
# 5️⃣ API: Cập nhật review theo summary_id + user_id
# =============================
@app.put("/summaries/summary-reviews/update")
def update_review_by_summary_and_user(
    summary_id: str = Body(..., embed=True),
    user_id: str = Body(..., embed=True),
    status: Optional[str] = Body(None, embed=True),
    comment: Optional[str] = Body(None, embed=True),
    db: Session = Depends(get_db),
):
    """Cập nhật trạng thái hoặc bình luận của 1 review"""
    try:
        # 🔍 Tìm review của user trong summary này
        review = (
            db.query(SummaryReview)
            .filter(
                SummaryReview.summary_id == summary_id,
                SummaryReview.user_id == user_id
            )
            .first()
        )

        if not review:
            raise HTTPException(
                status_code=404,
                detail=f"Không tìm thấy review cho summary_id={summary_id}, user_id={user_id}"
            )

        # 🔄 Cập nhật trạng thái (nếu có)
        if status:
            valid_status = ["PENDING", "CONFIRMED", "REJECTED"]
            if status not in valid_status:
                raise HTTPException(
                    status_code=400,
                    detail=f"Status không hợp lệ. Chỉ chấp nhận: {valid_status}"
                )
            review.status = status

        # 📝 Cập nhật comment (nếu có)
        if comment is not None:
            review.comment = comment

        # ⚙️ Gắn handled = False (báo hiệu có thay đổi mới)
        review.handled = False

        # 🕒 Cập nhật thời gian chỉnh sửa
        review.reviewed_at = datetime.utcnow()

        db.commit()
        db.refresh(review)

        # ✅ Kiểm tra nếu tất cả reviewer đã xử lý và CONFIRMED
        all_reviews = db.query(SummaryReview).filter(
            SummaryReview.summary_id == summary_id,
            SummaryReview.handled.isnot(None)  # handled NOT NULL
        ).all()

        # Nếu tất cả reviewer đều CONFIRMED thì cập nhật trạng thái summary
        if all(all_r.status == "CONFIRMED" for all_r in all_reviews) and all_reviews:
            summary = db.query(Summary).filter(Summary.id == summary_id).first()
            if summary:
                summary.status = "PENDING_CHAIR_APPROVAL"
                db.commit()

        return {
            "review_id": review.id,
            "summary_id": review.summary_id,
            "user_id": review.user_id,
            "status": review.status,
            "comment": review.comment,
            "handled": review.handled,  # ❗ sửa lỗi: trước đây ghi nhầm 'review.handle'
            "reviewed_at": review.reviewed_at.isoformat() if review.reviewed_at else None,
        }

    except Exception as e:
        db.rollback()
        print(f"❌ Lỗi khi cập nhật review: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi khi cập nhật review: {str(e)}")

@app.put("/summaries/summary-reviews/mark-fixed")
def mark_review_as_fixed(review_id: str = Body(..., embed=True), db: Session = Depends(get_db)):
    review = db.query(SummaryReview).filter(SummaryReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Không tìm thấy review")

    review.handled = True
    db.commit()
    db.refresh(review)
    return {
            "review_id": review.id,
            "summary_id": review.summary_id,
            "user_id": review.user_id,
            "status": review.status,
            "comment": review.comment,
            "handled": review.handled,  # ❗ sửa lỗi: trước đây ghi nhầm 'review.handle'
            "reviewed_at": review.reviewed_at.isoformat() if review.reviewed_at else None,
        }

# =============================
# 6️⃣ API: Thêm nhiều review cho 1 summary
# =============================
class ReviewCreateRequest(BaseModel):
    summary_id: str
    reviewers: List[str]
    status: Optional[str] = "PENDING"
    comment: Optional[str] = None


@app.post("/summaries/summary-reviews")
def add_reviews(request: ReviewCreateRequest, db: Session = Depends(get_db)):
    """Thêm nhiều review cho cùng một summary"""
    try:
        new_reviews = []
        for user_id in request.reviewers:
            review = SummaryReview(
                summary_id=request.summary_id,
                user_id=user_id,
                status=request.status,
                comment=request.comment,
                reviewed_at=datetime.utcnow(),
            )
            db.add(review)
            new_reviews.append(review)

        db.commit()

        return {
            "message": f"✅ Đã thêm {len(new_reviews)} review cho summary {request.summary_id}",
            "reviews": [
                {
                    "review_id": r.id,
                    "summary_id": r.summary_id,
                    "user_id": r.user_id,
                    "status": r.status,
                    "comment": r.comment,
                    "reviewed_at": r.reviewed_at.isoformat() if r.reviewed_at else None,
                }
                for r in new_reviews
            ],
        }

    except Exception as e:
        db.rollback()
        print(f"❌ Lỗi khi thêm review: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi khi thêm review: {str(e)}")

# =============================
# 4️⃣ API: Cập nhật status summary
# =============================
class UpdateSummaryStatusRequest(BaseModel):
    summary_id: str
    status: str

@app.put("/summaries/update-status")
def update_summary_status(request: UpdateSummaryStatusRequest, db: Session = Depends(get_db)):
    summary = db.query(Summary).filter(Summary.id == request.summary_id).first()
    if not summary:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy summary_id={request.summary_id}")

    valid_status = [s.value for s in SummaryStatus]
    if request.status not in valid_status:
        raise HTTPException(status_code=400, detail=f"Status không hợp lệ. Chỉ chấp nhận: {valid_status}")

    summary.status = request.status
    db.commit()
    db.refresh(summary)

    return {
        "summary_id": summary.id,
        "meeting_id": summary.meeting_id,
        "status": summary.status,
        "content": summary.content,
        "created_by": summary.created_by,
        "created_at": summary.created_at.isoformat() if summary.created_at else None,
    }
class UpdateSummaryContentRequest(BaseModel):
    meeting_id: int
    content: str
    updated_by: str = "Secretary"  # có thể truyền id user

@app.post("/summaries/update-content")
def update_summary_content(request: UpdateSummaryContentRequest, db: Session = Depends(get_db)):
    # 1️⃣ Tìm summary gần nhất của cuộc họp
    old_summary = (
        db.query(Summary)
        .filter(Summary.meeting_id == request.meeting_id)
        .order_by(Summary.created_at.desc())
        .first()
    )
    if not old_summary:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy summary cho meeting_id={request.meeting_id}")

    # 2️⃣ Lấy transcript_id từ cuộc họp hiện tại (vì bảng summaries cần cột này)
    transcript = (
        db.query(Transcript)
        .filter(Transcript.meeting_id == request.meeting_id)
        .order_by(Transcript.created_at.desc())
        .first()
    )
    if not transcript:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy transcript cho meeting_id={request.meeting_id}")

    # 3️⃣ Tạo bản summary mới (giữ nguyên bản cũ)
    new_summary = Summary(
        meeting_id=request.meeting_id,
        transcript_id=transcript.id,
        content=request.content,
        status="PENDING_REVIEW",  # thư ký chỉnh sửa => cần duyệt lại
        created_by=request.updated_by,
        created_at=datetime.utcnow(),
    )
    db.add(new_summary)
    db.commit()
    db.refresh(new_summary)

    # 4️⃣ Trả về kết quả
    return {
        "message": "✅ Đã lưu bản biên bản mới, giữ nguyên bản cũ.",
        "old_summary_id": old_summary.id,
        "summary_id": new_summary.id,
        "meeting_id": new_summary.meeting_id,
        "transcript_id": new_summary.transcript_id,
        "status": new_summary.status,
        "created_by": new_summary.created_by,
        "created_at": new_summary.created_at.isoformat(),
        "content": new_summary.content,
    }


# =============================
# 7️⃣ Model Summarization (load từ Hugging Face)
# =============================
MODEL_NAME = "VietAI/vit5-base-vietnews-summarization"

print("🔹 Loading tokenizer and model...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)
print("✅ Model loaded successfully!")


# =============================
# 8️⃣ API: Sinh tóm tắt nội dung
# =============================
class SummarizeRequest(BaseModel):
    transcript_id: str
    content: str
    created_by: str


def clean_text(text: str) -> str:
    """Làm sạch văn bản đầu ra"""
    text = re.sub(r"[^0-9A-Za-zÀ-ỹ\s,.!?-]", "", text)
    tokens = text.split()
    cleaned = []
    for i, t in enumerate(tokens):
        if i == 0 or t != tokens[i - 1]:
            cleaned.append(t)
    return " ".join(cleaned)


@app.post("/summarize")
def summarize(request: SummarizeRequest):
    """API test sinh tóm tắt trực tiếp từ transcript"""
    try:
        inputs = tokenizer(
            "summarize: " + request.content,
            return_tensors="pt",
            max_length=512,
            truncation=True,
        )

        outputs = model.generate(
            inputs["input_ids"],
            max_length=150,
            min_length=30,
            num_beams=5,
            no_repeat_ngram_size=3,
            early_stopping=True,
        )

        summary_text = clean_text(tokenizer.decode(outputs[0], skip_special_tokens=True))

        return {
            "transcript_id": request.transcript_id,
            "summary": summary_text,
            "created_by": request.created_by,
        }

    except Exception as e:
        print(f"❌ Lỗi khi sinh tóm tắt: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi khi sinh tóm tắt: {str(e)}")
