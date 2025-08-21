# Use AWS Lambda Python 3.12 base image
FROM public.ecr.aws/lambda/python:3.12

# Set working directory
WORKDIR ${LAMBDA_TASK_ROOT}

COPY pyproject.toml /app/
RUN pip install --no-cache-dir .

COPY app/ ./app/

# Set Python path to include source directory
ENV PYTHONPATH="${LAMBDA_TASK_ROOT}/src:${PYTHONPATH}"

# Lambda handler
CMD ["src.main.handler"]
