from __future__ import annotations

import os
from pathlib import Path
from typing import Protocol, cast

import gdown


class DriveFile(Protocol):
    id: str
    path: str


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DRIVE_FOLDER_URL = (
    "https://drive.google.com/drive/folders/"
    "1xto-wPFfFd8kFxIo6S6oxoYDROZ7EafC"
)

DATASET_TARGETS = {
    "BCCC-SFU-SQLInj-2023.csv": Path("DATASET/BCCC-SFU-SQLInj-2023.csv"),
    "SQLI_Dataset.csv": Path("DATASET/SQLI_Dataset.csv"),
    "sqli.csv": Path("DATASET/sqli.csv"),
    "sqliv2.csv": Path("DATASET/sqliv2.csv"),
    "SQLiV3.csv": Path("DATASET/SQLiV3.csv"),
    "SQLiV3_cleaned.csv": Path("DATASET/SQLiV3_cleaned.csv"),
    "SQLiV3_final.csv": Path("DATASET/SQLiV3_final.csv"),
    "rbsqli_dataset.csv": Path("RBSQLI/rbsqli_dataset.csv"),
    "extra_sqli_dataset.csv": Path("extra_sqli_dataset.csv"),
}


def get_remote_files() -> dict[str, DriveFile]:
    listed_files = cast(
        list[DriveFile],
        gdown.download_folder(
            url=DRIVE_FOLDER_URL,
            skip_download=True,
            quiet=False,
            use_cookies=False,
        ),
    )
    remote_files: dict[str, DriveFile] = {}

    for remote_file in listed_files:
        filename = Path(remote_file.path).name
        if filename not in DATASET_TARGETS:
            continue
        if filename in remote_files:
            raise RuntimeError(
                f"Google Drive folder contains more than one "
                f"{filename!r}; refusing to select one ambiguously."
            )
        remote_files[filename] = remote_file

    missing = sorted(set(DATASET_TARGETS) - set(remote_files))
    if missing:
        raise RuntimeError(
            "The public Google Drive folder is missing required dataset "
            f"file(s): {', '.join(missing)}. Check folder contents and sharing."
        )

    return remote_files


def download_missing_datasets() -> None:
    remote_files = get_remote_files()

    for filename, relative_target in DATASET_TARGETS.items():
        target = PROJECT_ROOT / relative_target
        if target.exists():
            if not target.is_file() or target.stat().st_size == 0:
                raise RuntimeError(
                    f"Dataset target exists but is not a non-empty file: {target}"
                )
            print(f"Already present, skipping: {relative_target}")
            continue

        target.parent.mkdir(parents=True, exist_ok=True)
        partial = target.with_name(f".{target.name}.part")
        remote_file = remote_files[filename]

        print(f"Downloading {filename} to {relative_target}")
        result = gdown.download(
            url=f"https://drive.google.com/uc?id={remote_file.id}",
            output=str(partial),
            quiet=False,
            use_cookies=False,
            resume=True,
        )
        if result is None or not partial.is_file() or partial.stat().st_size == 0:
            raise RuntimeError(
                f"Download did not produce a valid file for {filename!r}."
            )

        os.replace(partial, target)
        print(f"Downloaded: {relative_target}")


if __name__ == "__main__":
    download_missing_datasets()
