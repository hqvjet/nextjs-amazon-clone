# Use AWS Lambda Python 3.12 base image
FROM public.ecr.aws/lambda/python:3.12

# Lambda task root is /var/task
WORKDIR ${LAMBDA_TASK_ROOT}

# Copy application source and project metadata
COPY app/ ./app/
COPY pyproject.toml ./

# Install project (deps + package)
RUN pip install --no-cache-dir .

# Ensure Python can import from /var/task
ENV PYTHONPATH="${LAMBDA_TASK_ROOT}/app:${PYTHONPATH}"

# Lambda handler (module.function)
CMD ["app.main.handler"]
