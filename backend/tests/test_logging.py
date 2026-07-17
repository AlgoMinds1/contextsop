import logging

from app.logger import SafeFormatter, mask_sensitive_data


def test_mask_openai_key():
    raw = "My OpenAI key is sk-proj-abcdefghijklmnopqrstuvwxyz1234567890abcdefgh"
    masked = mask_sensitive_data(raw)
    assert "sk-****[REDACTED]****" in masked
    assert "sk-proj-" not in masked


def test_mask_jwt_token():
    raw = (
        "Authorization: Bearer "
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
        "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ."
        "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    )
    masked = mask_sensitive_data(raw)
    assert "Bearer ****[REDACTED]****" in masked


def test_mask_db_url():
    raw = "Connecting to database postgresql://admin:MySecurePassword123@localhost:5432/contextsop"
    masked = mask_sensitive_data(raw)
    assert "postgresql://[USER]:[PASSWORD_REDACTED]@localhost:5432/contextsop" in masked
    assert "MySecurePassword123" not in masked


def test_mask_config_password():
    raw = "config: password=MySecretPass123, other=val"
    masked = mask_sensitive_data(raw)
    assert "password=[REDACTED]" in masked
    assert "MySecretPass123" not in masked


def test_safe_formatter():
    formatter = SafeFormatter("%(message)s")
    record = logging.LogRecord(
        name="root",
        level=logging.INFO,
        pathname="path",
        lineno=10,
        msg="User logged in with password='unsafe-password'",
        args=(),
        exc_info=None,
    )
    formatted = formatter.format(record)
    assert "password='[REDACTED]'" in formatted
    assert "unsafe-password" not in formatted
