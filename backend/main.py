# backend/main.py
import os
import json
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import Session, select, SQLModel

# Use absolute imports (no leading dot) so module can be loaded whether
# you run uvicorn from backend/ or from repo root as backend.main
from database import init_db, get_session, engine
from models import User, Course, Lesson, Quiz, Question, Progress, QuizAttempt
from schemas import (
    UserOut, CourseOut, LessonOut, QuizOut, QuestionOut,
    LessonWithProgress
)

# If your seed_data implementation is in this file previously, move it to
# a helper file called main_helpers.py (or adjust below import to match).
# Here I import seed_data from main_helpers.py to avoid circular imports.
# If your seed_data is defined in this file, remove the import and keep the function.
try:
    from main_helpers import seed_data
except Exception:
    # fallback: if seed_data isn't in main_helpers, try to import from local
    # module named seed_data.py or define a no-op
    try:
        from seed_data import seed_data  # optional second location
    except Exception:
        def seed_data():
            # no-op if not provided (prevents startup crash)
            return

# -----------------------
# FastAPI app
# -----------------------
app = FastAPI(title="Grow with MLS - Mini Backend (Auth Disabled Demo)")

# --- DEV CORS: allow frontend origins so browser can call the API during development
# Read from env FRONTEND_URLS (comma separated) or fallback to sensible defaults
frontend_origins = os.getenv("FRONTEND_URLS", "http://localhost:5173,http://127.0.0.1:5173")
origins = [o.strip() for o in frontend_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# Startup: init DB + seed
# -----------------------
# IMPORTANT:
# - init_db() should call `SQLModel.metadata.create_all(engine)` inside database.py
#   and it should guard against double-registration if possible.
# - We do NOT call SQLModel.metadata.create_all(engine) here at import time to avoid
#   duplicate table registration when FastAPI reloader imports modules repeatedly.
@app.on_event("startup")
def on_startup():
    # initialize/create tables (implementation should be in database.init_db)
    try:
        init_db()
        print("Database initialized.")
    except Exception as e:
        # Print but don't crash server startup for minor DB issues
        print("init_db() failed:", e)

    # Seed demo data — don't raise on error
    try:
        seed_data()
        print("Seed data run (if needed).")
    except Exception as e:
        print("seed_data() failed:", e)

# -----------------------
# Root endpoint (sanity)
# -----------------------
@app.get("/")
def root():
    return {"message": "Grow with MLS - backend running (auth disabled demo)"}

# -----------------------
# Example small helper endpoints (kept minimal here)
# You can paste the rest of your full endpoints below exactly as before,
# using absolute imports and get_session as dependency.
# -----------------------

@app.get("/health")
def health():
    return {"status": "ok", "database_url": os.getenv("DATABASE_URL", "sqlite:///./dev.db")}

# Example: list courses — make sure CourseOut is a proper Pydantic model
@app.get("/courses", response_model=List[CourseOut])
def list_courses(session: Session = Depends(get_session)):
    courses = session.exec(select(Course)).all()
    # If using pydantic v2, ensure CourseOut has model_config={"from_attributes": True}
    return [CourseOut.from_orm(c) for c in courses]

# Keep the rest of your endpoints (get_course, lessons, quizzes, etc.) below.
# Make sure they match the get_session signature from database.py and your pydantic models.

# --- simple auth demo endpoints (signup/login) ---
from pydantic import BaseModel, EmailStr

class SignupIn(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

@app.post("/auth/signup", response_model=TokenOut)
def auth_signup(payload: SignupIn, session: Session = Depends(get_session)):
    # if email exists, return a 400
    if session.exec(select(User).where(User.email == payload.email)).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    # create a basic user record (password stored plaintext in demo; fine for this mini)
    user = User(email=payload.email, password_hash=payload.password, name=payload.name or "", is_subscriber=False)
    session.add(user)
    session.commit()
    session.refresh(user)
    # return a simple access token (frontend stores this but backend demo ignores it)
    return {"access_token": f"demo-token-{user.id}", "token_type": "bearer"}


class LoginIn(BaseModel):
    username: EmailStr
    password: str

@app.post("/auth/login", response_model=TokenOut)
def auth_login(payload: LoginIn, session: Session = Depends(get_session)):
    # attempt to find user by email
    user = session.exec(select(User).where(User.email == payload.username)).first()
    if not user or user.password_hash != payload.password:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    return {"access_token": f"demo-token-{user.id}", "token_type": "bearer"}

# -----------------------
# Helper: always logged in as demo user
# -----------------------
def get_current_user(session: Session = Depends(get_session)) -> User:
    user = session.exec(select(User).where(User.email == "demo@test.com")).first()
    if not user:
        user = User(email="demo@test.com", password_hash="nopass", name="Demo User", is_subscriber=True)
        session.add(user)
        session.commit()
        session.refresh(user)
    return user

def seed_data():
    import json
    from sqlmodel import Session, select

    # Only run if there are no courses
    with Session(engine) as session:
        exists = session.exec(select(Course)).first()
        if exists:
            return

        courses_data = [
            {
                "title": "Intro to Investing",
                "description": "Master the fundamentals of investing with this comprehensive beginner's course. Learn about different investment vehicles including stocks, bonds, mutual funds, and ETFs. Understand key concepts like risk tolerance, diversification, and asset allocation. Discover how compound interest works and why time is your greatest ally in building wealth. This course covers practical strategies for getting started, common mistakes to avoid, and how to develop a long-term investment mindset that will serve you throughout your financial journey.",
                "is_premium": False,
                "price_cents": 0,
                "billing": None,
                "lessons": [
                    {"title": "What is Investing?", "content": "Investing means allocating money with the expectation of generating a future return. Unlike saving, which preserves capital, investing puts your money to work to grow over time through appreciation, dividends, or interest."},
                    {"title": "Types of Investments", "content": "Learn about stocks (ownership in companies), bonds (loans to companies/governments), mutual funds (professionally managed portfolios), ETFs (exchange-traded funds), and real estate investments."},
                    {"title": "Risk and Return", "content": "Understand the fundamental relationship between risk and return. Higher potential returns typically come with higher risk. Learn to assess your risk tolerance and invest accordingly."},
                    {"title": "Compounding & Time", "content": "How compound interest works and why starting early matters more than investing large amounts. See real examples of how small, consistent investments can grow into significant wealth over decades."},
                    {"title": "Getting Started", "content": "Practical steps to begin investing: opening brokerage accounts, understanding fees, making your first investment, and setting up automatic contributions."}
                ],
                "quiz": {
                    "title": "Intro to Investing - Comprehensive Quiz",
                    "pass_percent": 70,
                    "questions": [
                        {
                            "text": "What is compounding?",
                            "choices": ["Paying interest monthly", "Interest earned on previous interest", "Buying multiple stocks", "Reinvesting dividends only"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Which investment typically offers the highest long-term returns?",
                            "choices": ["Savings accounts", "Government bonds", "Stocks", "Certificates of deposit"],
                            "correct_index": 2,
                        },
                        {
                            "text": "Diversification helps reduce which type of risk?",
                            "choices": ["Market risk", "Concentration risk", "Inflation risk", "Interest rate risk"],
                            "correct_index": 1,
                        },
                        {
                            "text": "What does P/E ratio measure?",
                            "choices": ["Price to earnings", "Profit to equity", "Performance to expectations", "Price to expenses"],
                            "correct_index": 0,
                        },
                        {
                            "text": "When should you start investing?",
                            "choices": ["Only after age 30", "After paying off all debt", "As soon as you have emergency fund", "Only when you have $10,000"],
                            "correct_index": 2,
                        },
                        {
                            "text": "What is dollar-cost averaging?",
                            "choices": ["Investing lump sums", "Buying only cheap stocks", "Investing fixed amounts regularly", "Timing the market"],
                            "correct_index": 2,
                        },
                        {
                            "text": "Which account type offers tax advantages for retirement?",
                            "choices": ["Checking account", "401(k)", "Regular brokerage", "Savings account"],
                            "correct_index": 1,
                        },
                        {
                            "text": "What is an ETF?",
                            "choices": ["Electronic Trading Fund", "Exchange-Traded Fund", "Equity Transfer Fund", "Emergency Trading Fund"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Bull market means:",
                            "choices": ["Prices are falling", "Prices are rising", "Market is closed", "High volatility"],
                            "correct_index": 1,
                        },
                        {
                            "text": "What should you do during market downturns?",
                            "choices": ["Panic sell everything", "Stop investing", "Continue regular investing", "Buy only bonds"],
                            "correct_index": 2,
                        }
                    ],
                },
            },
            {
                "title": "Foundations of Budgeting",
                "description": "Build a solid financial foundation with effective budgeting strategies. This course teaches you how to track income and expenses, create realistic budgets, and stick to them. Learn the 50/30/20 rule, zero-based budgeting, and envelope methods. Understand how to build an emergency fund, manage debt effectively, and prioritize your financial goals. Discover tools and apps that make budgeting easier, and develop habits that lead to long-term financial success and peace of mind.",
                "is_premium": False,
                "price_cents": 0,
                "billing": None,
                "lessons": [
                    {"title": "Why Budget Matters", "content": "Understanding why budgeting is crucial for financial success. Learn how budgets provide control, reduce stress, and help achieve financial goals."},
                    {"title": "Tracking Income and Expenses", "content": "Methods to accurately track all money coming in and going out. Tools and techniques for categorizing expenses and identifying spending patterns."},
                    {"title": "The 50/30/20 Rule", "content": "Simple budgeting framework: 50% for needs, 30% for wants, 20% for savings and debt repayment. How to adapt this rule to your situation."},
                    {"title": "Building an Emergency Fund", "content": "Why emergency funds are critical, how much to save, where to keep emergency money, and strategies to build your fund quickly."},
                    {"title": "Debt Management Strategies", "content": "Snowball vs avalanche methods for paying off debt, how to prioritize different types of debt, and strategies to avoid future debt."},
                    {"title": "Budgeting Tools and Apps", "content": "Overview of popular budgeting tools, spreadsheet templates, and mobile apps that can simplify budget management and tracking."}
                ],
                "quiz": {
                    "title": "Budgeting Mastery Quiz",
                    "pass_percent": 70,
                    "questions": [
                        {
                            "text": "What percentage should go to savings in the 50/30/20 rule?",
                            "choices": ["50%", "30%", "20%", "10%"],
                            "correct_index": 2,
                        },
                        {
                            "text": "How much should you have in emergency fund?",
                            "choices": ["1 month expenses", "3-6 months expenses", "1 year expenses", "$1,000 maximum"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Debt snowball method focuses on:",
                            "choices": ["Highest interest rates first", "Smallest balances first", "Largest payments first", "Newest debts first"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Which is a 'need' vs 'want'?",
                            "choices": ["Designer clothes", "Dining out", "Housing payment", "Entertainment subscriptions"],
                            "correct_index": 2,
                        },
                        {
                            "text": "Zero-based budgeting means:",
                            "choices": ["Spending nothing", "Income minus expenses equals zero", "Having no budget", "Zero interest rates"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Best place for emergency fund?",
                            "choices": ["Stock market", "High-yield savings", "Under mattress", "Cryptocurrency"],
                            "correct_index": 1,
                        },
                        {
                            "text": "How often should you review your budget?",
                            "choices": ["Never", "Once per year", "Monthly", "Only when broke"],
                            "correct_index": 2,
                        },
                        {
                            "text": "Envelope method helps with:",
                            "choices": ["Investing", "Controlling spending", "Credit scores", "Tax preparation"],
                            "correct_index": 1,
                        },
                        {
                            "text": "What's the first step in budgeting?",
                            "choices": ["Cut all expenses", "Track current spending", "Open savings account", "Pay off debt"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Fixed expenses include:",
                            "choices": ["Groceries", "Entertainment", "Rent/mortgage", "Dining out"],
                            "correct_index": 2,
                        }
                    ],
                },
            },
            {
                "title": "Advanced Portfolio Construction",
                "description": "Dive deep into sophisticated portfolio management techniques used by professional investors. Master Modern Portfolio Theory, understand correlation and covariance, and learn how to optimize asset allocation for maximum risk-adjusted returns. Explore tactical vs strategic asset allocation, rebalancing strategies, and factor-based investing. This advanced course covers portfolio construction across different market cycles, international diversification, alternative investments, and how to build portfolios for different life stages and risk profiles.",
                "is_premium": True,
                "price_cents": 5000,
                "billing": "lifetime",
                "lessons": [
                    {"title": "Modern Portfolio Theory", "content": "Understanding Markowitz's efficient frontier, how to calculate optimal portfolios, and the mathematical foundations of diversification."},
                    {"title": "Asset Allocation Strategies", "content": "Strategic vs tactical allocation, target-date approaches, and how to determine appropriate asset mixes based on goals and risk tolerance."},
                    {"title": "Risk Metrics and Analysis", "content": "Standard deviation, Sharpe ratio, beta, and other key metrics for measuring and comparing portfolio risk and performance."},
                    {"title": "Correlation and Diversification", "content": "How asset correlations change over time, true diversification across asset classes, and building uncorrelated positions."},
                    {"title": "Rebalancing Techniques", "content": "When and how to rebalance portfolios, threshold vs calendar rebalancing, and tax implications of rebalancing strategies."},
                    {"title": "Factor Investing", "content": "Value, growth, momentum, and quality factors. How to build factor-tilted portfolios and understand factor premiums."},
                    {"title": "International Diversification", "content": "Benefits of global investing, currency hedging, emerging markets, and home country bias considerations."}
                ],
                "quiz": {
                    "title": "Advanced Portfolio Construction Quiz",
                    "pass_percent": 75,
                    "questions": [
                        {
                            "text": "What does the efficient frontier represent?",
                            "choices": ["Maximum return portfolios", "Minimum risk portfolios", "Optimal risk-return combinations", "Market benchmarks"],
                            "correct_index": 2,
                        },
                        {
                            "text": "Sharpe ratio measures:",
                            "choices": ["Total return", "Risk-adjusted return", "Market correlation", "Dividend yield"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Beta measures a stock's:",
                            "choices": ["Dividend yield", "P/E ratio", "Market sensitivity", "Book value"],
                            "correct_index": 2,
                        },
                        {
                            "text": "When should you rebalance?",
                            "choices": ["Daily", "When allocations drift significantly", "Never", "Only during bull markets"],
                            "correct_index": 1,
                        },
                        {
                            "text": "What is home country bias?",
                            "choices": ["Preferring foreign stocks", "Over-investing domestically", "Currency hedging", "Emerging market focus"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Value factor focuses on:",
                            "choices": ["High growth stocks", "Low price ratios", "Large companies", "New technologies"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Asset correlation of +1 means:",
                            "choices": ["Perfect negative correlation", "No correlation", "Perfect positive correlation", "Random movement"],
                            "correct_index": 2,
                        },
                        {
                            "text": "Monte Carlo simulation helps with:",
                            "choices": ["Stock picking", "Modeling portfolio outcomes", "Market timing", "Tax planning"],
                            "correct_index": 1,
                        },
                        {
                            "text": "What's the main benefit of international diversification?",
                            "choices": ["Higher returns always", "Reduced portfolio risk", "Lower costs", "Tax advantages"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Black-Litterman model improves on:",
                            "choices": ["CAPM", "Modern Portfolio Theory", "Efficient Market Hypothesis", "Random Walk Theory"],
                            "correct_index": 1,
                        }
                    ],
                },
            },
            {
                "title": "Options & Derivatives",
                "description": "Master the complex world of options and derivatives trading. Learn the fundamentals of calls and puts, understand the Greeks (Delta, Gamma, Theta, Vega), and explore advanced strategies like spreads, straddles, and iron condors. This course covers options pricing models, volatility trading, and risk management techniques. Understand when and how to use options for hedging, income generation, and speculation. Includes real-world examples and case studies of successful options strategies.",
                "is_premium": True,
                "price_cents": 1000,
                "billing": "yearly",
                "lessons": [
                    {"title": "Options Fundamentals", "content": "What are calls and puts, intrinsic vs extrinsic value, moneyness concepts, and basic options terminology."},
                    {"title": "The Greeks Explained", "content": "Delta (price sensitivity), Gamma (delta sensitivity), Theta (time decay), Vega (volatility sensitivity), and Rho (interest rate sensitivity)."},
                    {"title": "Basic Options Strategies", "content": "Covered calls, protective puts, long straddles, and simple spread strategies for different market outlooks."},
                    {"title": "Advanced Strategies", "content": "Iron condors, butterflies, calendar spreads, and ratio spreads for sophisticated risk management."},
                    {"title": "Volatility Trading", "content": "Understanding implied volatility, volatility smile, and strategies to profit from volatility changes."},
                    {"title": "Options Pricing Models", "content": "Black-Scholes model, binomial trees, and factors affecting options prices."},
                    {"title": "Risk Management", "content": "Position sizing, portfolio Greeks management, and common mistakes in options trading."}
                ],
                "quiz": {
                    "title": "Options & Derivatives Mastery Quiz",
                    "pass_percent": 75,
                    "questions": [
                        {
                            "text": "A call option gives the holder:",
                            "choices": ["Obligation to buy", "Right to buy", "Obligation to sell", "Right to sell"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Delta measures:",
                            "choices": ["Time decay", "Price sensitivity", "Volatility impact", "Interest rate sensitivity"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Theta is always:",
                            "choices": ["Positive for long options", "Negative for long options", "Zero", "Variable"],
                            "correct_index": 1,
                        },
                        {
                            "text": "At-the-money means:",
                            "choices": ["Strike = stock price", "Option has no value", "Maximum profit", "Expiration day"],
                            "correct_index": 0,
                        },
                        {
                            "text": "Covered call strategy involves:",
                            "choices": ["Buying calls only", "Owning stock + selling calls", "Selling naked calls", "Buying protective puts"],
                            "correct_index": 1,
                        },
                        {
                            "text": "High implied volatility suggests:",
                            "choices": ["Cheap options", "Expensive options", "No price movement", "Guaranteed profits"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Iron condor is best used when:",
                            "choices": ["Expecting large moves", "Expecting small moves", "Market is trending", "Volatility is low"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Gamma is highest for:",
                            "choices": ["Deep in-the-money", "Deep out-of-the-money", "At-the-money", "Long-term options"],
                            "correct_index": 2,
                        },
                        {
                            "text": "Assignment risk is highest:",
                            "choices": ["At expiration", "When far from expiration", "For out-of-money options", "Never occurs"],
                            "correct_index": 0,
                        },
                        {
                            "text": "Vega is highest for:",
                            "choices": ["Short-term options", "Long-term options", "Deep ITM options", "Worthless options"],
                            "correct_index": 1,
                        }
                    ],
                },
            },
            {
                "title": "Cryptocurrency Fundamentals",
                "description": "Navigate the exciting and volatile world of cryptocurrency investing. Understand blockchain technology, different types of cryptocurrencies, and how digital assets fit into a diversified portfolio. Learn about major cryptocurrencies like Bitcoin and Ethereum, decentralized finance (DeFi), NFTs, and emerging trends. This course covers wallet security, exchange selection, tax implications, and risk management strategies specific to crypto investing. Stay informed about regulatory developments and market dynamics in this rapidly evolving space.",
                "is_premium": True,
                "price_cents": 750,
                "billing": "monthly",
                "lessons": [
                    {"title": "Blockchain Basics", "content": "Understanding distributed ledgers, consensus mechanisms, and the technology behind cryptocurrencies."},
                    {"title": "Bitcoin Deep Dive", "content": "History, monetary policy, store of value thesis, and Bitcoin's role as digital gold."},
                    {"title": "Ethereum and Smart Contracts", "content": "Programmable blockchain, decentralized applications, and the Ethereum ecosystem."},
                    {"title": "Altcoins and Token Types", "content": "Different categories of cryptocurrencies: utility tokens, security tokens, stablecoins, and governance tokens."},
                    {"title": "DeFi and Yield Farming", "content": "Decentralized finance protocols, liquidity mining, and earning yield on crypto assets."},
                    {"title": "Crypto Security", "content": "Hot vs cold wallets, private key management, and protecting your digital assets."},
                    {"title": "Regulation and Taxes", "content": "Current regulatory landscape, tax implications of crypto trading, and compliance considerations."}
                ],
                "quiz": {
                    "title": "Cryptocurrency Fundamentals Quiz",
                    "pass_percent": 70,
                    "questions": [
                        {
                            "text": "What is a blockchain?",
                            "choices": ["A type of cryptocurrency", "A distributed ledger", "A mining computer", "A trading platform"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Bitcoin's maximum supply is:",
                            "choices": ["Unlimited", "21 million", "100 million", "1 billion"],
                            "correct_index": 1,
                        },
                        {
                            "text": "What makes Ethereum different from Bitcoin?",
                            "choices": ["Faster transactions", "Smart contracts", "Lower fees", "Better security"],
                            "correct_index": 1,
                        },
                        {
                            "text": "A private key is:",
                            "choices": ["Your wallet address", "Used to access your funds", "A type of cryptocurrency", "A blockchain protocol"],
                            "correct_index": 1,
                        },
                        {
                            "text": "DeFi stands for:",
                            "choices": ["Digital Finance", "Decentralized Finance", "Derivative Finance", "Default Finance"],
                            "correct_index": 1,
                        },
                        {
                            "text": "A stablecoin is:",
                            "choices": ["Very volatile", "Pegged to stable assets", "Only for institutions", "A mining reward"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Cold storage refers to:",
                            "choices": ["Storing crypto offline", "Refrigerated servers", "Slow transactions", "Low-value coins"],
                            "correct_index": 0,
                        },
                        {
                            "text": "Proof of Work is:",
                            "choices": ["A consensus mechanism", "A type of wallet", "A trading strategy", "A government regulation"],
                            "correct_index": 0,
                        },
                        {
                            "text": "NFTs are typically built on:",
                            "choices": ["Bitcoin", "Ethereum", "US Dollar", "Gold"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Crypto taxes are triggered by:",
                            "choices": ["Buying only", "Holding only", "Selling/trading", "Mining only"],
                            "correct_index": 2,
                        }
                    ],
                },
            },
            {
                "title": "Real Estate Investment Strategies",
                "description": "Explore the world of real estate as an investment vehicle and wealth-building tool. Learn about different types of real estate investments including rental properties, REITs, real estate crowdfunding, and fix-and-flip strategies. Understand how to analyze properties, calculate returns, and manage real estate portfolios. This course covers financing options, tax benefits, market analysis, and the pros and cons of direct vs indirect real estate investing. Perfect for those looking to diversify beyond traditional stocks and bonds.",
                "is_premium": True,
                "price_cents": 1200,
                "billing": "lifetime",
                "lessons": [
                    {"title": "Real Estate as Investment", "content": "Benefits and drawbacks of real estate investing, different investment approaches, and how real estate fits in a portfolio."},
                    {"title": "Rental Property Analysis", "content": "Cash flow analysis, cap rates, cash-on-cash returns, and the 1% rule for evaluating rental properties."},
                    {"title": "REITs and Public Real Estate", "content": "Real Estate Investment Trusts, different REIT types, and how to invest in real estate without buying property."},
                    {"title": "Financing Real Estate", "content": "Conventional mortgages, investment property loans, leverage strategies, and creative financing techniques."},
                    {"title": "Market Analysis", "content": "Evaluating local markets, demographic trends, economic indicators, and timing real estate cycles."},
                    {"title": "Tax Benefits and Strategies", "content": "Depreciation, 1031 exchanges, tax deductions, and structuring investments for tax efficiency."},
                    {"title": "Property Management", "content": "Self-management vs professional management, tenant screening, maintenance, and maximizing rental income."}
                ],
                "quiz": {
                    "title": "Real Estate Investment Quiz",
                    "pass_percent": 70,
                    "questions": [
                        {
                            "text": "Cap rate is calculated as:",
                            "choices": ["NOI / Property Value", "Gross Rent / Price", "Cash Flow / Down Payment", "Appreciation / Time"],
                            "correct_index": 0,
                        },
                        {
                            "text": "The 1% rule suggests:",
                            "choices": ["1% down payment", "Monthly rent = 1% of price", "1% annual appreciation", "1% vacancy rate"],
                            "correct_index": 1,
                        },
                        {
                            "text": "REIT stands for:",
                            "choices": ["Real Estate Investment Trust", "Residential Estate Investment Tool", "Real Estate Income Tax", "Regional Estate Investment Team"],
                            "correct_index": 0,
                        },
                        {
                            "text": "Leverage in real estate means:",
                            "choices": ["Buying with cash", "Using borrowed money", "Property management", "Tax deductions"],
                            "correct_index": 1,
                        },
                        {
                            "text": "1031 exchange allows:",
                            "choices": ["Tax-free property swaps", "First-time buyer benefits", "Lower interest rates", "Reduced down payments"],
                            "correct_index": 0,
                        },
                        {
                            "text": "NOI stands for:",
                            "choices": ["Net Operating Income", "New Owner Investment", "National Occupancy Index", "Non-Operating Interest"],
                            "correct_index": 0,
                        },
                        {
                            "text": "Depreciation in real estate:",
                            "choices": ["Reduces property value", "Provides tax deductions", "Increases expenses", "Lowers rent"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Cash-on-cash return measures:",
                            "choices": ["Total property return", "Return on invested cash", "Gross rental yield", "Property appreciation"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Best markets for rental properties typically have:",
                            "choices": ["High property prices", "Strong job growth", "Low population", "High crime rates"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Property management fees typically range:",
                            "choices": ["1-3% of rent", "8-12% of rent", "15-20% of rent", "25-30% of rent"],
                            "correct_index": 1,
                        }
                    ],
                },
            },
            {
                "title": "Retirement Planning Mastery",
                "description": "Secure your financial future with comprehensive retirement planning strategies. Learn how to calculate retirement needs, maximize employer benefits, and choose between different retirement accounts. Understand Social Security optimization, healthcare planning, and estate considerations. This course covers 401(k)s, IRAs, Roth conversions, and withdrawal strategies. Explore how to create multiple income streams in retirement and adjust your plan as you approach and enter retirement. Essential knowledge for anyone serious about financial independence.",
                "is_premium": False,
                "price_cents": 0,
                "billing": None,
                "lessons": [
                    {"title": "Retirement Needs Assessment", "content": "Calculating how much you need to retire, replacement ratio concepts, and factoring in inflation over time."},
                    {"title": "401(k) and Employer Plans", "content": "Maximizing employer matches, contribution limits, vesting schedules, and rollover strategies."},
                    {"title": "IRAs and Roth IRAs", "content": "Traditional vs Roth IRAs, conversion strategies, contribution limits, and distribution rules."},
                    {"title": "Social Security Optimization", "content": "How Social Security works, claiming strategies, spousal benefits, and maximizing lifetime benefits."},
                    {"title": "Healthcare in Retirement", "content": "Medicare basics, supplemental insurance, HSAs for retirement, and planning for long-term care costs."},
                    {"title": "Withdrawal Strategies", "content": "4% rule, bucket strategies, tax-efficient withdrawals, and required minimum distributions."},
                    {"title": "Estate Planning Basics", "content": "Wills, trusts, beneficiary designations, and strategies to pass wealth to heirs efficiently."}
                ],
                "quiz": {
                    "title": "Retirement Planning Mastery Quiz",
                    "pass_percent": 70,
                    "questions": [
                        {
                            "text": "The 4% rule suggests:",
                            "choices": ["Save 4% of income", "Withdraw 4% annually", "Earn 4% returns", "Retire at age 40"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Roth IRA contributions are:",
                            "choices": ["Tax-deductible", "Made with after-tax dollars", "Limited to $1,000", "Only for high earners"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Full retirement age for Social Security:",
                            "choices": ["62 for everyone", "65 for everyone", "67 for most people", "70 for everyone"],
                            "correct_index": 2,
                        },
                        {
                            "text": "401(k) employer match is:",
                            "choices": ["Required by law", "Free money if you contribute", "Only for executives", "Taxable immediately"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Medicare Part A covers:",
                            "choices": ["Doctor visits", "Prescription drugs", "Hospital stays", "Dental care"],
                            "correct_index": 2,
                        },
                        {
                            "text": "Required Minimum Distributions start at:",
                            "choices": ["Age 59½", "Age 65", "Age 73", "Age 80"],
                            "correct_index": 2,
                        },
                        {
                            "text": "HSA triple tax advantage includes:",
                            "choices": ["No benefits", "Deductible contributions only", "Deductible, growth, qualified withdrawals", "Only growth"],
                            "correct_index": 2,
                        },
                        {
                            "text": "Catch-up contributions allow:",
                            "choices": ["Younger savers to save more", "Age 50+ to save extra", "High earners bonus limits", "Early withdrawal privileges"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Social Security benefits are based on:",
                            "choices": ["Last 5 years of earnings", "Highest 35 years", "Total lifetime earnings", "Final salary only"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Roth conversion makes sense when:",
                            "choices": ["Tax rates will be lower", "Tax rates will be higher", "You need immediate income", "You're already retired"],
                            "correct_index": 1,
                        }
                    ],
                },
            },
            {
                "title": "Tax-Efficient Investing",
                "description": "Minimize your tax burden and maximize after-tax returns with sophisticated tax strategies. Learn about tax-advantaged accounts, asset location optimization, tax-loss harvesting, and municipal bonds. Understand how different investments are taxed and strategies to defer or minimize taxes legally. This advanced course covers tax implications of different investment vehicles, charitable giving strategies, and year-end tax planning. Essential knowledge for high-income earners and serious investors looking to keep more of what they earn.",
                "is_premium": True,
                "price_cents": 900,
                "billing": "yearly",
                "lessons": [
                    {"title": "Investment Taxation Basics", "content": "Understanding how the IRS treats different types of investment income is crucial for maximizing after-tax returns. Ordinary income (like interest from bonds, dividends from REITs) is taxed at your marginal tax rate, which can be as high as 37% for high earners. Capital gains from selling investments held over one year qualify for long-term capital gains rates (0%, 15%, or 20% depending on income). Short-term capital gains (assets held less than one year) are taxed as ordinary income. Qualified dividends from most stocks receive favorable tax treatment, while non-qualified dividends are taxed at ordinary rates. Municipal bond interest is generally tax-free at the federal level and often at state level if you live in the issuing state. Understanding these distinctions allows you to structure your portfolio to minimize taxes and keep more of your investment returns."},
                    {"title": "Tax-Advantaged Accounts", "content": "Tax-advantaged accounts are powerful tools for building wealth while minimizing taxes. Traditional 401(k)s and IRAs allow pre-tax contributions that reduce your current taxable income, with taxes paid on withdrawals in retirement. Roth accounts are funded with after-tax dollars but provide tax-free growth and withdrawals in retirement. HSAs offer triple tax advantages: deductible contributions, tax-free growth, and tax-free withdrawals for qualified medical expenses. In retirement, HSAs can be used like traditional IRAs for non-medical expenses. 529 education savings plans provide tax-free growth for education expenses. The key is maximizing contributions to these accounts before investing in taxable accounts. For 2024, you can contribute up to $23,000 to a 401(k) ($30,500 if 50+), $7,000 to an IRA ($8,000 if 50+), and $4,300 to an HSA ($5,550 if 50+) for individuals."},
                    {"title": "Asset Location Strategy", "content": "Asset location is about placing the right investments in the right account types to minimize taxes. Tax-inefficient investments that generate significant ordinary income or frequent trading should go in tax-advantaged accounts. This includes bonds, REITs, actively managed funds with high turnover, and investments you plan to trade frequently. In your taxable accounts, hold tax-efficient investments like index funds with low turnover, individual stocks you plan to hold long-term, and municipal bonds if you're in a high tax bracket. International funds with foreign tax credits should also go in taxable accounts since you can't claim the foreign tax credit in tax-advantaged accounts. By implementing proper asset location, you can potentially save thousands in taxes annually while maintaining your desired asset allocation across all accounts."},
                    {"title": "Tax-Loss Harvesting", "content": "Tax-loss harvesting involves selling investments at a loss to offset capital gains and reduce taxes. You can deduct up to $3,000 in net capital losses against ordinary income annually, with additional losses carried forward to future years. The key is avoiding the wash sale rule, which disallows the loss if you buy the same or substantially identical security within 30 days before or after the sale. Instead of buying back the exact same investment, consider similar but not identical alternatives (like switching from one S&P 500 fund to another). Automated tax-loss harvesting through robo-advisors can systematically implement this strategy. Direct indexing takes this further by owning individual stocks instead of funds, allowing more opportunities for tax-loss harvesting. Remember that tax-loss harvesting should never drive investment decisions - maintain your desired asset allocation and risk profile while optimizing for taxes."},
                    {"title": "Municipal Bonds and Tax-Free Income", "content": "Municipal bonds issued by state and local governments typically provide tax-free interest income, making them attractive for high-income investors. The tax-equivalent yield formula helps compare munis to taxable bonds: divide the tax-free yield by (1 - your tax rate). For example, a 3% municipal bond equals a 5% taxable bond for someone in the 40% tax bracket (3% ÷ 0.6 = 5%). In-state municipal bonds are often exempt from both federal and state taxes, providing even greater value for residents of high-tax states. However, municipal bonds typically offer lower yields than comparable taxable bonds, and some are subject to Alternative Minimum Tax (AMT). Private activity bonds and bonds from certain territories may also be taxable. Consider municipal bond funds for diversification, but be aware of interest rate risk and credit risk, especially with lower-rated municipalities."},
                    {"title": "Charitable Giving Strategies", "content": "Strategic charitable giving can provide significant tax benefits while supporting causes you care about. Donating appreciated securities instead of cash allows you to avoid capital gains taxes while claiming the full fair market value deduction. Donor-advised funds let you make a large deductible contribution in high-income years and distribute to charities over time. Charitable remainder trusts provide income for life while offering immediate tax deductions and avoiding capital gains on donated assets. For those 70½ and older, qualified charitable distributions from IRAs can count toward required minimum distributions while excluding the distribution from taxable income. Bunching charitable contributions every few years to exceed the standard deduction can maximize tax benefits. Always consult with tax professionals for complex charitable strategies and ensure proper documentation for all charitable contributions."}
                ],
                "quiz": {
                    "title": "Tax-Efficient Investing Quiz",
                    "pass_percent": 75,
                    "questions": [
                        {
                            "text": "Long-term capital gains tax rates are:",
                            "choices": ["Same as ordinary income", "0%, 15%, or 20%", "Always 15%", "Always tax-free"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Asset location strategy involves:",
                            "choices": ["Picking the best assets", "Placing assets in optimal account types", "Timing the market", "Geographic diversification"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Wash sale rule applies when you:",
                            "choices": ["Buy the same security within 30 days", "Sell at a profit", "Hold for over one year", "Trade frequently"],
                            "correct_index": 0,
                        },
                        {
                            "text": "Municipal bond interest is typically:",
                            "choices": ["Taxed as ordinary income", "Tax-free at federal level", "Subject to capital gains tax", "Always taxable"],
                            "correct_index": 1,
                        },
                        {
                            "text": "HSA offers how many tax advantages?",
                            "choices": ["One", "Two", "Three", "None"],
                            "correct_index": 2,
                        },
                        {
                            "text": "Tax-loss harvesting limit per year is:",
                            "choices": ["$1,000", "$3,000", "$5,000", "Unlimited"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Qualified dividends are taxed at:",
                            "choices": ["Ordinary income rates", "Capital gains rates", "No tax", "Fixed 10% rate"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Best account for bonds:",
                            "choices": ["Always taxable", "Tax-advantaged accounts", "Roth IRA only", "HSA only"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Donating appreciated stock allows you to:",
                            "choices": ["Pay capital gains tax", "Avoid capital gains and deduct FMV", "Only deduct cost basis", "No tax benefits"],
                            "correct_index": 1,
                        },
                        {
                            "text": "Foreign tax credit is available in:",
                            "choices": ["Any account", "Only taxable accounts", "Only 401(k)", "Only Roth IRA"],
                            "correct_index": 1,
                        }
                    ],
                },
            },
        ]

        # Create demo user if not exists
        user = session.exec(select(User).where(User.email == "demo@test.com")).first()
        if not user:
            user = User(
                email="demo@test.com",
                password_hash="nopass",
                name="Demo User",
                is_subscriber=True,  # already subscribed
            )
            session.add(user)
            session.commit()
            session.refresh(user)

        # Insert courses, lessons, quizzes, questions
        for cdata in courses_data:
            course = Course(
                title=cdata["title"],
                description=cdata["description"],
                is_premium=cdata["is_premium"],
                price_cents=cdata["price_cents"],
            )
            session.add(course)
            session.flush()  # get course.id

            lesson_objs = []
            for idx, ls in enumerate(cdata["lessons"], start=1):
                lesson = Lesson(
                    course_id=course.id,
                    title=ls["title"],
                    content=ls["content"],
                    order_index=idx,
                )
                session.add(lesson)
                session.flush()
                lesson_objs.append(lesson)
            session.commit()

            qd = cdata.get("quiz")
            if qd:
                quiz = Quiz(
                    course_id=course.id,
                    lesson_id=lesson_objs[0].id if lesson_objs else None,
                    title=qd["title"],
                    pass_percent=qd.get("pass_percent", 60),
                )
                session.add(quiz)
                session.commit()
                session.refresh(quiz)

                for q in qd.get("questions", []):
                    ques = Question(
                        quiz_id=quiz.id,
                        text=q["text"],
                        choices=json.dumps(q["choices"]),
                        correct_index=q["correct_index"],
                    )
                    session.add(ques)
                session.commit()

# -----------------------
# User endpoints
# -----------------------
@app.get("/users/me", response_model=UserOut)
def read_me(current_user: User = Depends(get_current_user)):
    return UserOut.from_orm(current_user)

@app.post("/subscribe")
def subscribe(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    """
    Subscriptions removed in this build — endpoint kept for compatibility.
    Calling this will be a no-op and return a helpful message.
    """
    return {"message": "subscriptions removed in this build"}

# -----------------------
# Course endpoints
# -----------------------
@app.get("/courses", response_model=List[CourseOut])
def list_courses(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    """
    Return all courses with basic info.
    """
    courses = session.exec(select(Course)).all()
    return [CourseOut.from_orm(course) for course in courses]

@app.get("/courses/{course_id}", response_model=CourseOut)
def get_course(course_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    """
    Get a specific course by ID.
    """
    course = session.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return CourseOut.from_orm(course)

@app.get("/courses/{course_id}/lessons", response_model=List[LessonWithProgress])
def list_lessons_for_course(course_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    """
    Return lessons for a course along with completion status for the current_user.
    Defensive: returns [] (empty list) if there are no lessons for the course.
    """
    # Verify course exists first (keeps consistent 404 if course id invalid)
    course = session.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Fetch lessons (may return empty list)
    lessons = session.exec(
        select(Lesson).where(Lesson.course_id == course_id).order_by(Lesson.order_index)
    ).all()

    # Build map of completed lessons for this user
    completed_rows = session.exec(
        select(Progress.lesson_id, Progress.completed_at).where(Progress.user_id == current_user.id)
    ).all()
    completed_map = {row[0]: row[1] for row in completed_rows} if completed_rows else {}

    # Compose response using LessonWithProgress schema
    response = []
    for l in lessons:
        response.append(LessonWithProgress(
            id=l.id,
            title=l.title,
            content=l.content,
            order_index=l.order_index,
            completed=(l.id in completed_map),
            completed_at=completed_map.get(l.id)
        ))
    return response

@app.get("/lessons/{lesson_id}", response_model=LessonOut)
def get_lesson(lesson_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    lesson = session.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    # check subscription: find total lessons to know if this is allowed for non-subscriber
    stmt = select(Lesson).where(Lesson.course_id == lesson.course_id).order_by(Lesson.order_index)
    all_lessons = session.exec(stmt).all()
    if not current_user.is_subscriber:
        # only allow access to the first lesson
        if all_lessons and lesson.id != all_lessons[0].id:
            raise HTTPException(status_code=403, detail="Subscribe to access this lesson")

    # find a quiz linked to this lesson (if any)
    stmt_q = select(Quiz).where(Quiz.lesson_id == lesson.id)
    quiz_obj = session.exec(stmt_q).first()
    quiz_id = quiz_obj.id if quiz_obj else None

    # return LessonOut with optional quiz_id
    return LessonOut(id=lesson.id, title=lesson.title, content=lesson.content, order_index=lesson.order_index, quiz_id=quiz_id)


@app.post("/lessons/{lesson_id}/complete")
def complete_lesson(lesson_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if session.exec(select(Progress).where(Progress.user_id == current_user.id, Progress.lesson_id == lesson_id)).first():
        return {"message": "already completed"}
    prog = Progress(user_id=current_user.id, lesson_id=lesson_id)
    session.add(prog)
    session.commit()
    return {"message": "completed"}

# -----------------------
# Quizzes
# -----------------------
@app.get("/quizzes/{quiz_id}", response_model=QuizOut)
def get_quiz(quiz_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    """
    Returns quiz questions (without revealing correct_index to the client model).
    Also returns optional lesson_id so frontend can auto-mark that lesson complete on pass.
    """
    quiz = session.get(Quiz, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    # require subscriber
    if not current_user.is_subscriber:
        raise HTTPException(status_code=403, detail="Subscribe to access quizzes")
    stmt = select(Question).where(Question.quiz_id == quiz_id).order_by(Question.id)
    questions = session.exec(stmt).all()
    q_out = []
    for q in questions:
        choices = json.loads(q.choices) if q.choices else []
        q_out.append(QuestionOut(id=q.id, text=q.text, choices=choices))
    # include quiz.lesson_id in the response (may be None)
    return QuizOut(id=quiz.id, title=quiz.title, pass_percent=quiz.pass_percent, questions=q_out, lesson_id=quiz.lesson_id)

class QuizSubmission(BaseModel):
    answers: List[int]

@app.post("/quizzes/{quiz_id}/submit")
def submit_quiz(quiz_id: int, submission: QuizSubmission, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    quiz = session.get(Quiz, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    questions = session.exec(select(Question).where(Question.quiz_id == quiz_id).order_by(Question.id)).all()
    if len(submission.answers) != len(questions):
        raise HTTPException(status_code=400, detail="Answer count mismatch")
    correct = sum(1 for q, ans in zip(questions, submission.answers) if q.correct_index == ans)
    score_percent = round((correct / len(questions)) * 100, 2)
    passed = score_percent >= quiz.pass_percent
    attempt = QuizAttempt(user_id=current_user.id, quiz_id=quiz_id, score=score_percent, passed=passed, answers=json.dumps(submission.answers))
    session.add(attempt)
    session.commit()
    return {"score": score_percent, "passed": passed, "correct": correct, "total": len(questions)}

# -----------------------
# Progress
# -----------------------
@app.get("/users/me/progress")
def my_progress(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    lessons_completed = [{"lesson_id": p.lesson_id, "completed_at": p.completed_at} for p in session.exec(select(Progress).where(Progress.user_id == current_user.id)).all()]
    attempts = session.exec(select(QuizAttempt).where(QuizAttempt.user_id == current_user.id).order_by(QuizAttempt.attempted_at.desc())).all()
    attempts_out = [{"id": a.id, "quiz_id": a.quiz_id, "score": a.score, "passed": a.passed, "answers": json.loads(a.answers), "attempted_at": a.attempted_at} for a in attempts]
    return {"lessons_completed": lessons_completed, "quiz_attempts": attempts_out}

# Root
@app.get("/")
def root():
    return {"message": "Grow with MLS - backend running (auth disabled demo)"}