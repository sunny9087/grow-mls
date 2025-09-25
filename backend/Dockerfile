# backend/Dockerfile
FROM python:3.11-slim

# set working dir
WORKDIR /app

# copy requirements
COPY requirements.txt .

# install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# copy app files
COPY . .

# expose port
EXPOSE 8000

# start FastAPI with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
