# AI-Based SQL Injection Detection and Prevention

## Dataset setup

Dataset files are excluded from Git. The public Google Drive folder must be
accessible to anyone with the link as a viewer. The downloader uses that public
access only; it does not need Google credentials or OAuth tokens.

Install the Python dependencies from the project root:

```powershell
py -m pip install -r requirements.txt
```

Download missing datasets from the project root:

```powershell
py scripts\download_datasets.py
```

The downloader preserves the filenames and paths expected by the existing
scripts. It skips non-empty files already present locally, downloads missing
files to temporary names, and moves each completed download into place.

The folder currently provides CSV files directly, so no ZIP extraction is
needed. If the public folder or its filenames change, update the folder URL or
dataset mapping in `scripts/download_datasets.py`. If downloads fail with an
access error, set the Drive folder sharing to **Anyone with the link - Viewer**.

## Run the application

After installing dependencies and downloading datasets, start the backend and
frontend from the project root:

```powershell
powershell -ExecutionPolicy Bypass -File .\start_all.ps1
```

The launcher starts the API at `http://localhost:8000` and the frontend at
`http://localhost:5173`. The API uses the existing trained model files in the
project root; downloading datasets does not train or replace models.

To run the existing Random Forest training script explicitly (this retrains
and writes model artifacts):

```powershell
py train_random_forest.py
```

Training is not part of the normal application startup.
