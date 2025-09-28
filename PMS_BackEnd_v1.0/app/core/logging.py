import logging
import logging.config
from typing import Any, Dict


def get_default_logging_config() -> Dict[str, Any]:
    """Return a default logging configuration for the application."""

    return {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "default",
                "level": "INFO",
            }
        },
        "root": {
            "handlers": ["console"],
            "level": "INFO",
        },
    }


def setup_logging() -> None:
    """Configure logging for the application if not already configured."""

    if not logging.getLogger().handlers:
        logging.config.dictConfig(get_default_logging_config())
