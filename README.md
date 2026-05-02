# Instagram Reels Auto-Upload

Automatically download Instagram reels from Google Drive and upload them to your Instagram account on a schedule.

## Features

✅ **Scheduled Uploads** - 5 times daily (7 AM, 10 AM, 1 PM, 6 PM, 9 PM IST)  
✅ **Automatic Download** - Pulls reels from Google Drive folder  
✅ **Duplicate Prevention** - Maintains upload log to avoid re-uploading  
✅ **Auto-Captioning** - Generates captions like `🔥 Meme_001\n#memes #hindimemes`  
✅ **Rate Limiting** - Max 5 reels per day  
✅ **Space Optimization** - Deletes files after successful upload  
✅ **Error Handling** - Graceful error recovery with detailed logging  
✅ **Git Integration** - Auto-commits upload logs back to repo  

## Prerequisites

- Google Drive folder with Instagram reels (MP4, MOV, AVI, MKV, WebM)
- Instagram account credentials
- GitHub repository with Actions enabled

## Setup Instructions

### 1. Get Your Google Drive Folder ID

1. Open Google Drive and create a folder for your reels
2. Right-click → Share → Get link
3. Copy the folder ID from the URL:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID_HERE
   ```

### 2. Add GitHub Secrets

Go to your repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `GOOGLE_DRIVE_FOLDER_ID` | Your Google Drive folder ID |
| `IG_USERNAME` | Your Instagram username or email |
| `IG_PASSWORD` | Your Instagram password |

**Security Note:** Use a strong password or app password. Never commit credentials to the repo.

### 3. Configure File Structure

Ensure your files are in the repo root:
```
├── .github/
│   └── workflows/
│       └── upload.yml
├── upload_reels.py
├── requirements.txt
└── .gitignore
```

### 4. Enable GitHub Actions

1. Go to **Actions** tab in your repo
2. Click "I understand my workflows, go ahead and enable them"

## Schedule (IST Times)

The workflow runs 5 times daily:

| Time (IST) | Time (UTC) | Cron |
|-----------|-----------|------|
| 7:00 AM | 1:30 AM | `30 1 * * *` |
| 10:00 AM | 4:30 AM | `30 4 * * *` |
| 1:00 PM | 7:30 AM | `30 7 * * *` |
| 6:00 PM | 12:30 PM | `30 12 * * *` |
| 9:00 PM | 3:30 PM | `30 15 * * *` |

## How It Works

1. **Download** - Pulls all reels from Google Drive folder
2. **Check** - Compares with `uploaded_log.json` to skip already-uploaded reels
3. **Upload** - Uploads next unuploaded reel to Instagram
4. **Log** - Records successful uploads and errors
5. **Cleanup** - Deletes local file to save space
6. **Commit** - Pushes updated log back to repository

## Configuration

Edit `upload_reels.py` to customize:

```python
DAILY_COUNT = 5  # Max reels per day
REELS_DIR = Path("reels")  # Local reels folder
LOG_FILE = Path("uploaded_log.json")  # Log file location
```

## Log File Format

The `uploaded_log.json` tracks all uploads:

```json
{
  "uploaded": [
    {
      "filename": "meme_001.mp4",
      "media_id": "123456789",
      "date": "2026-05-02T12:00:00",
      "status": "success"
    }
  ],
  "failed": [
    {
      "filename": "meme_bad.mp4",
      "error": "Invalid video format",
      "date": "2026-05-02T11:00:00",
      "status": "failed"
    }
  ]
}
```

## Troubleshooting

### ❌ "Credential validation failed"

- Check that all 3 secrets are set correctly in GitHub Settings
- Verify Instagram credentials are correct
- Ensure Google Drive folder ID is valid

### ❌ "Challenge required during login"

- Instagram is asking for verification
- Solution: Log in manually once from a browser to verify
- Then re-run the workflow

### ❌ "No unuploaded reels found"

- All reels in Google Drive have been uploaded
- Add new reels to the folder
- Or delete entries from `uploaded_log.json` to re-upload

### ❌ "Daily upload limit reached"

- You've already uploaded 5 reels today
- Check `uploaded_log.json` for today's uploads
- Try again tomorrow

## Manual Trigger

To run immediately (instead of waiting for schedule):

1. Go to **Actions** → **Instagram Reels Auto-Upload**
2. Click **Run workflow** → **Run workflow**

## Monitoring

Check run status and logs:

1. Go to **Actions** tab
2. Click the latest workflow run
3. View logs under **upload-reels** job
4. Download artifacts (logs stored for 30 days)

## Environment Variables

The script uses these env variables (set via GitHub Secrets):

| Variable | Purpose |
|----------|---------|
| `GOOGLE_DRIVE_FOLDER_ID` | Google Drive folder ID |
| `IG_USERNAME` | Instagram username/email |
| `IG_PASSWORD` | Instagram password |

## Dependencies

- `instagrapi==2.0.0` - Instagram API client
- `gdown==5.1.0` - Google Drive downloader

## File Formats Supported

Video formats supported for upload:
- `.mp4`
- `.mov`
- `.avi`
- `.mkv`
- `.webm`

Instagram reel requirements:
- Duration: 15 seconds to 90 seconds
- Resolution: 1080x1920 (vertical)
- Format: MP4 recommended
- File size: < 100 MB

## Best Practices

1. **Organize Reels** - Use consistent naming (e.g., `meme_001.mp4`, `meme_002.mp4`)
2. **Backup** - Keep backups of reels in Google Drive
3. **Test First** - Run workflow manually once to test
4. **Monitor Logs** - Check action logs for errors
5. **Rate Limiting** - Respect Instagram's rate limits (5/day default)
6. **Secure Credentials** - Use app passwords instead of main password if available

## Security Considerations

⚠️ **Never commit credentials** - Always use GitHub Secrets  
⚠️ **Use app-specific passwords** - If available on Instagram  
⚠️ **Rotate passwords** - Periodically change your Instagram password  
⚠️ **Limited scope** - Use a separate account if possible  

## Support & Issues

If you encounter issues:

1. Check workflow logs in GitHub Actions
2. Review `upload_reels.log` in artifacts
3. Verify credentials and folder ID
4. Check Instagram's login status manually
5. Review GitHub Actions status page

## License

MIT License - Feel free to use and modify

## Contributing

Improvements welcome! Feel free to:
- Report issues
- Suggest features
- Submit pull requests
