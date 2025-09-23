# backend/models.py
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

# --- User
class User(SQLModel, table=True):
    __table_args__ = {"extend_existing": True}

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    password_hash: str
    name: Optional[str] = None
    is_subscriber: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

# --- Course
class Course(SQLModel, table=True):
    __table_args__ = {"extend_existing": True}

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    is_premium: bool = False
    price_cents: int = 0  # store price in smallest currency unit (e.g. rupees or cents)
    billing: Optional[str] = None  # e.g. "lifetime", "yearly", "monthly"

# --- Lesson
class Lesson(SQLModel, table=True):
    __table_args__ = {"extend_existing": True}

    id: Optional[int] = Field(default=None, primary_key=True)
    course_id: int = Field(foreign_key="course.id")
    title: str
    content: str
    order_index: int

# --- Quiz
class Quiz(SQLModel, table=True):
    __table_args__ = {"extend_existing": True}

    id: Optional[int] = Field(default=None, primary_key=True)
    course_id: int = Field(foreign_key="course.id")
    lesson_id: Optional[int] = Field(default=None, foreign_key="lesson.id")
    title: str
    pass_percent: int = 60

# --- Question
class Question(SQLModel, table=True):
    __table_args__ = {"extend_existing": True}

    id: Optional[int] = Field(default=None, primary_key=True)
    quiz_id: int = Field(foreign_key="quiz.id")
    text: str
    choices: str   # JSON string (list of choices)
    correct_index: int

# --- Progress
class Progress(SQLModel, table=True):
    __table_args__ = {"extend_existing": True}

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    lesson_id: int = Field(foreign_key="lesson.id")
    completed_at: datetime = Field(default_factory=datetime.utcnow)

# --- QuizAttempt
class QuizAttempt(SQLModel, table=True):
    __table_args__ = {"extend_existing": True}

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    quiz_id: int = Field(foreign_key="quiz.id")
    score: float
    passed: bool
    answers: Optional[str] = None  # JSON string
    attempted_at: datetime = Field(default_factory=datetime.utcnow)
