from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "issues_tracker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.workers.tasks",
        "app.workers.email_tasks"
    ]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "aggregate-daily-stats": {
            "task": "app.workers.tasks.aggregate_daily_stats",
            "schedule": 30.0 * 60,  # Every 30 minutes
        },
    },
)