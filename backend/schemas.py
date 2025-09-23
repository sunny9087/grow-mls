# backend/schemas.py
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# Auth
class SignupIn(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str]
    is_subscriber: bool

    class Config:
        # pydantic v2 expects from_attributes=True for ORM objects;
        # pydantic v1 uses orm_mode=True. Set both to be safe.
        from_attributes = True
        orm_mode = True

# Course / Lesson
class CourseOut(BaseModel):
    id: int
    title: str
    description: str
    is_premium: Optional[bool] = False
    price_cents: Optional[int] = 0

    class Config:
        from_attributes = True
        orm_mode = True

class LessonOut(BaseModel):
    id: int
    title: str
    content: str
    order_index: int
    # allow optional quiz reference
    quiz_id: Optional[int] = None

    class Config:
        from_attributes = True
        orm_mode = True

# Lesson with progress (what frontend wants)
class LessonWithProgress(BaseModel):
    id: int
    title: str
    content: str
    order_index: int
    completed: bool = False
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        orm_mode = True

# Quiz / Question
class QuestionOut(BaseModel):
    id: int
    text: str
    choices: List[str]

    class Config:
        from_attributes = True
        orm_mode = True

class QuizOut(BaseModel):
    id: int
    title: str
    pass_percent: int
    questions: List[QuestionOut]
    lesson_id: Optional[int] = None

    class Config:
        from_attributes = True
        orm_mode = True

# Quiz attempt output
class QuizAttemptOut(BaseModel):
    id: int
    quiz_id: int
    score: float
    passed: bool
    answers: Optional[List[int]]
    attempted_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True

# Progress output
class ProgressOut(BaseModel):
    lesson_id: int
    completed_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True
