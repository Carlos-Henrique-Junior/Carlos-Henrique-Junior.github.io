import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import Settings, create_app  # noqa: E402


@pytest.fixture
def settings(tmp_path: Path) -> Settings:
    return Settings(
        site_url="http://testserver",
        data_dir=tmp_path / "data",
        contact_limit_per_hour=3,
        retention_days=365,
    )


@pytest.fixture
def app(settings: Settings):
    return create_app(settings)


@pytest.fixture
def client(app):
    with TestClient(app) as test_client:
        yield test_client
