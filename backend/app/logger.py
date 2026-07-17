import logging
import re

# Regex patterns to scrub sensitive data from production logs
SECRETS_PATTERNS = [
    # OpenAI API Keys
    (re.compile(r"sk-[a-zA-Z0-9\-]{20,}", re.IGNORECASE), "sk-****[REDACTED]****"),
    # Supabase / general JWT Bearer tokens
    (
        re.compile(
            r"bearer\s+[a-zA-Z0-9_\-\=]+\.[a-zA-Z0-9_\-\=]+\.[a-zA-Z0-9_\-\=\+]+",
            re.IGNORECASE,
        ),
        "Bearer ****[REDACTED]****",
    ),
    # Database connection passwords
    (
        re.compile(r"(postgresql(?:\+psycopg2)?:\/\/)[^:]+:([^@]+)@", re.IGNORECASE),
        r"\1[USER]:[PASSWORD_REDACTED]@",
    ),
    # Config parameters e.g., secret=XYZ or token=ABC
    (
        re.compile(
            r"(\b(?:password|secret|apikey|token|passwd)\s*[:=]\s*['\"]?)[^'\"\s,;]+(['\"]?)",
            re.IGNORECASE,
        ),
        r"\1[REDACTED]\2",
    ),
]


def mask_sensitive_data(message: str) -> str:
    """
    Inspects message text and replaces any matches of sensitive credentials
    with redacted placeholders.
    """
    if not isinstance(message, str):
        return message

    scrubbed = message
    for pattern, replacement in SECRETS_PATTERNS:
        scrubbed = pattern.sub(replacement, scrubbed)
    return scrubbed


class SafeFormatter(logging.Formatter):
    """
    Custom logging formatter that strips sensitive secrets from the output logs.
    """

    def format(self, record: logging.LogRecord) -> str:
        # Get standard formatted record
        formatted = super().format(record)
        return mask_sensitive_data(formatted)


def setup_secure_logging(level: int = logging.INFO):
    """
    Sets up the secure logging configuration for the backend Flask application.
    """
    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Clear existing handlers to prevent duplicate formatting logs
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Standard stream console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(level)

    # Structured JSON-like standard logging formatting
    formatter = SafeFormatter("[%(asctime)s] [%(levelname)s] [%(name)s:%(lineno)d] - %(message)s")
    console_handler.setFormatter(formatter)

    root_logger.addHandler(console_handler)
    logging.info("Secure logging initialized. Secret scrubbing active.")
