FROM mysql:latest

# Set environment variables
ENV MYSQL_ROOT_PASSWORD=rootpassword
ENV MYSQL_DATABASE=socialmedia

# Expose MySQL port
EXPOSE 3306

# You could add initialization scripts here if needed
# COPY init.sql /docker-entrypoint-initdb.d/