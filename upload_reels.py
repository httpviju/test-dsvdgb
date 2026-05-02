#!/usr/bin/env python3
"""
Instagram Reels Auto-Upload Script
Downloads reels from Google Drive and uploads them to Instagram
"""

import os
import json
import sys
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import re

try:
    import gdown
    from instagrapi import Client
    from instagrapi.exceptions import LoginRequired, ChallengeRequired
except ImportError as e:
    print(f"Error: Required package not installed: {e}")
    sys.exit(1)

# Configuration
DAILY_COUNT = 5
REELS_DIR = Path("reels")
LOG_FILE = Path("uploaded_log.json")
DRIVE_FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID", "")
IG_USERNAME = os.getenv("IG_USERNAME", "")
IG_PASSWORD = os.getenv("IG_PASSWORD", "")

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("upload_reels.log"),
    ],
)
logger = logging.getLogger(__name__)


class ReelsUploader:
    """Handles downloading and uploading Instagram reels"""

    def __init__(self):
        """Initialize the uploader"""
        self.reels_dir = REELS_DIR
        self.log_file = LOG_FILE
        self.instagram_client = None
        self.uploaded_log = self._load_log()

        # Create reels directory if it doesn't exist
        self.reels_dir.mkdir(exist_ok=True)

    def _load_log(self) -> Dict:
        """Load the uploaded reels log"""
        try:
            if self.log_file.exists():
                with open(self.log_file, "r") as f:
                    return json.load(f)
        except Exception as e:
            logger.warning(f"Error loading log file: {e}")
        return {"uploaded": [], "failed": []}

    def _save_log(self) -> None:
        """Save the uploaded reels log"""
        try:
            with open(self.log_file, "w") as f:
                json.dump(self.uploaded_log, f, indent=2)
            logger.info("Log file saved successfully")
        except Exception as e:
            logger.error(f"Error saving log file: {e}")

    def _get_today_count(self) -> int:
        """Get number of reels uploaded today"""
        today = datetime.now().strftime("%Y-%m-%d")
        count = sum(
            1
            for entry in self.uploaded_log.get("uploaded", [])
            if entry.get("date", "").startswith(today)
        )
        return count

    def _validate_credentials(self) -> bool:
        """Validate required environment variables"""
        if not DRIVE_FOLDER_ID:
            logger.error("GOOGLE_DRIVE_FOLDER_ID environment variable not set")
            return False
        if not IG_USERNAME:
            logger.error("IG_USERNAME environment variable not set")
            return False
        if not IG_PASSWORD:
            logger.error("IG_PASSWORD environment variable not set")
            return False
        return True

    def _instagram_login(self) -> bool:
        """Login to Instagram"""
        try:
            logger.info(f"Attempting to login to Instagram as {IG_USERNAME}")
            self.instagram_client = Client()
            self.instagram_client.login(IG_USERNAME, IG_PASSWORD)
            logger.info("Successfully logged in to Instagram")
            return True
        except ChallengeRequired as e:
            logger.error(f"Challenge required during login: {e}")
            logger.error("Please complete the challenge manually and try again")
            return False
        except LoginRequired as e:
            logger.error(f"Login failed: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error during login: {e}")
            return False

    def download_reels(self) -> List[Path]:
        """Download reels from Google Drive folder"""
        try:
            logger.info(f"Starting download from Google Drive folder: {DRIVE_FOLDER_ID}")

            # Build Google Drive folder URL
            folder_url = f"https://drive.google.com/drive/folders/{DRIVE_FOLDER_ID}"

            # Download entire folder
            output_dir = str(self.reels_dir)
            gdown.download_folder(
                folder_url,
                output=output_dir,
                quiet=False,
                use_cookies=False,
                skip_subdirs=True,
            )

            logger.info("Download completed")

            # Get list of downloaded files
            downloaded_files = self._get_reel_files()
            logger.info(f"Found {len(downloaded_files)} reel files")
            return downloaded_files

        except Exception as e:
            logger.error(f"Error downloading from Google Drive: {e}")
            return []

    def _get_reel_files(self) -> List[Path]:
        """Get list of reel files in the reels directory"""
        video_extensions = {".mp4", ".mov", ".avi", ".mkv", ".webm"}
        files = []

        try:
            for file in sorted(self.reels_dir.iterdir()):
                if file.is_file() and file.suffix.lower() in video_extensions:
                    files.append(file)
        except Exception as e:
            logger.error(f"Error reading reel files: {e}")

        return files

    def _extract_reel_number(self, filename: str) -> Optional[int]:
        """Extract reel number from filename"""
        match = re.search(r"(\d+)", filename)
        if match:
            try:
                return int(match.group(1))
            except ValueError:
                pass
        return None

    def _generate_caption(self, filename: str) -> str:
        """Generate Instagram caption for the reel"""
        reel_num = self._extract_reel_number(filename)
        if reel_num:
            return f"🔥 Meme_{reel_num:03d}\n#memes #hindimemes"
        return "🔥 Check out this meme!\n#memes #hindimemes"

    def _is_uploaded(self, filename: str) -> bool:
        """Check if reel has already been uploaded"""
        return any(
            entry["filename"] == filename
            for entry in self.uploaded_log.get("uploaded", [])
        )

    def _get_next_unuploaded_reel(self) -> Optional[Path]:
        """Get the next reel that hasn't been uploaded yet"""
        reel_files = self._get_reel_files()

        for reel_file in reel_files:
            if not self._is_uploaded(reel_file.name):
                logger.info(f"Found unuploaded reel: {reel_file.name}")
                return reel_file

        logger.info("No unuploaded reels found")
        return None

    def upload_reel(self, reel_path: Path) -> bool:
        """Upload a single reel to Instagram"""
        try:
            # Check daily limit
            today_count = self._get_today_count()
            if today_count >= DAILY_COUNT:
                logger.warning(
                    f"Daily upload limit reached ({DAILY_COUNT} reels per day)"
                )
                return False

            # Generate caption
            caption = self._generate_caption(reel_path.name)
            logger.info(f"Uploading reel: {reel_path.name}")
            logger.info(f"Caption: {caption}")

            # Validate file
            if not reel_path.exists():
                logger.error(f"Reel file not found: {reel_path}")
                self._log_failed(reel_path.name, "File not found")
                return False

            file_size = reel_path.stat().st_size / (1024 * 1024)  # MB
            logger.info(f"File size: {file_size:.2f} MB")

            # Upload to Instagram
            logger.info("Starting Instagram upload...")
            media = self.instagram_client.clip_upload(
                video_path=str(reel_path),
                caption=caption,
            )

            logger.info(f"Successfully uploaded reel! Media ID: {media.id}")

            # Log successful upload
            self._log_uploaded(reel_path.name, media.id)

            # Delete reel file to save space
            try:
                reel_path.unlink()
                logger.info(f"Deleted local file: {reel_path.name}")
            except Exception as e:
                logger.warning(f"Error deleting reel file: {e}")

            return True

        except Exception as e:
            logger.error(f"Error uploading reel: {e}")
            self._log_failed(reel_path.name, str(e))
            return False

    def _log_uploaded(self, filename: str, media_id: str) -> None:
        """Log successfully uploaded reel"""
        entry = {
            "filename": filename,
            "media_id": media_id,
            "date": datetime.now().isoformat(),
            "status": "success",
        }
        self.uploaded_log.setdefault("uploaded", []).append(entry)
        self._save_log()

    def _log_failed(self, filename: str, error: str) -> None:
        """Log failed upload"""
        entry = {
            "filename": filename,
            "error": error,
            "date": datetime.now().isoformat(),
            "status": "failed",
        }
        self.uploaded_log.setdefault("failed", []).append(entry)
        self._save_log()

    def run(self) -> bool:
        """Main execution logic"""
        logger.info("=" * 60)
        logger.info("Instagram Reels Auto-Upload - Started")
        logger.info("=" * 60)

        # Validate credentials
        if not self._validate_credentials():
            logger.error("Credential validation failed")
            return False

        # Check daily limit before proceeding
        today_count = self._get_today_count()
        logger.info(f"Reels uploaded today: {today_count}/{DAILY_COUNT}")

        if today_count >= DAILY_COUNT:
            logger.warning("Daily upload limit already reached")
            return True

        # Download reels
        logger.info("Step 1: Downloading reels from Google Drive")
        self.download_reels()

        # Login to Instagram
        logger.info("Step 2: Logging in to Instagram")
        if not self._instagram_login():
            logger.error("Instagram login failed")
            return False

        # Upload next unuploaded reel
        logger.info("Step 3: Uploading next unuploaded reel")
        next_reel = self._get_next_unuploaded_reel()

        if next_reel:
            success = self.upload_reel(next_reel)
            if success:
                logger.info(f"Reel upload completed successfully")
            else:
                logger.warning(f"Reel upload failed")
        else:
            logger.info("No new reels to upload")

        logger.info("=" * 60)
        logger.info("Instagram Reels Auto-Upload - Completed")
        logger.info("=" * 60)

        return True


def main():
    """Main entry point"""
    try:
        uploader = ReelsUploader()
        success = uploader.run()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        logger.info("Process interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
