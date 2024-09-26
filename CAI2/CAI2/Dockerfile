# Use the official Python image with a slim variant.
FROM python:3.12-slim

# Set the working directory in the container.
WORKDIR /app

# Copy the requirements file first for better caching.
COPY requirements.txt .

# Install any needed packages specified in requirements.txt.
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container.
COPY . .

# Make port 8080 available to the world outside this container.
EXPOSE 8080

# Set the environment variable for Flask application.
ENV FLASK_APP=app.py

# Command to run the application.
CMD ["flask", "run", "--host=0.0.0.0", "--port=8080"]
