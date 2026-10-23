"""Read the JSON files written by the audit and training scripts."""
import json
from pathlib import Path


class ArtifactMissing(Exception):
    pass


def read_json(directory: Path, filename: str, how_to_create: str) -> dict:
    path = directory / filename
    if not path.exists():
        raise ArtifactMissing(f"Not available yet. Run: {how_to_create}")
    return json.loads(path.read_text())
