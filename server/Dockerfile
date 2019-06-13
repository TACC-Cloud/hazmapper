FROM python:3.7
RUN apt-get update
RUN apt-get install -y software-properties-common
RUN mkdir /app
COPY . /app
COPY requirements.txt /
RUN pip install -r requirements.txt
RUN pip install gunicorn
ENV PYTHONPATH "${PYTHONPATH}:/app"
WORKDIR /app
