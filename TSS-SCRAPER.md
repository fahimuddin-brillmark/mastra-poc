# API Endpoints

### GET /

- **Purpose**: Get API status and version information
- **Response**: Returns status, message, API version, organization, author, xray_enabled, and log_level

### Example CURL

```bash
curl "<https://api.snapit.intelliconvert.ai/>"
```

---

### POST /scrape

- **Purpose**: Trigger a new scraping job (asynchronous)
- **Required Parameters (JSON body)**:
    - `user` (string)
    - `project` (string)
    - `url` (string to scrape)
- **Optional Parameters (JSON body)**:
    - `region` (string, AWS region for worker; defaults to controller region if omitted)
    - `include_selectors` (array of CSS selectors to keep)
    - `exclude_selectors` (array of CSS selectors to remove)
    - `screenshot_variants` (array, specify which screenshots to take; see below)
        - Supported values:
            - `"viewport"` (default desktop viewport)
            - `"full-page"` (entire page)
            - `"mobile"` (default iPhone 14 Pro emulation)
            - `"ultra-wide"` (ultra-wide desktop)
            - `{ "type": "custom", "width": <int>, "height": <int>, "mobile": <bool, optional> }` (custom size, set `mobile: true` for mobile user agent)
            - `{ "type": "mobile", "model": <string> }` (emulate a specific mobile device by model name, e.g. "iPhone 14 Pro", "Pixel 8 Pro", "Galaxy S24")
        - If a model is not recognized, a generic mobile user agent and size will be used.
- **Response**: Job status, job_id, req_id, and timestamp
- **Notes**: Stores a `metadata.json` file for each job in S3. No database is used; all state is kept in S3.

### Example CURL

```bash
curl -X POST "<https://api.snapit.intelliconvert.ai/scrape>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "user": "ariful",
    "project": "myproject",
    "url": "<https://brillmark.com>",
    "region": "us-west-1",
    "include_selectors": [".main-content", "#important-section"],
    "exclude_selectors": [".ads", ".footer"],
    "screenshot_variants": [
      "viewport",
      "full-page",
      {"type": "mobile", "model": "iPhone 14 Pro"},
      {"type": "mobile", "model": "Pixel 8 Pro"},
      {"type": "custom", "width": 800, "height": 600},
      {"type": "custom", "width": 800, "height": 600, "mobile": true}
    ]
  }'
```

---

### GET /retrieve

- **Purpose**: Get pre-signed URLs for job results (including archive if job is complete)
- **Required Parameters (query string)**:
    - `user` (string)
    - `project` (string)
    - `job_id` (string)
- **Optional Parameters (query string)**:
    - `presign_expiry` (integer, seconds; default 3600, min 60, max 604800)
- **Response**:
    - If job is complete: status, job_id, metadata, presigned_xz (archive URL)
    - If job is failed: status, job_id, error, metadata
    - If job is in progress/queued: status, job_id, metadata
    - 404 if job not found

### Example CURL

```bash
curl "<https://api.snapit.intelliconvert.ai/retrieve?user=ariful&project=myproject&job_id=498505534640>"
```

---

### GET /preview

- **Purpose**: Get pre-signed URLs for preview files (excludes archive and metadata)
- **Required Parameters (query string)**:
    - `user` (string)
    - `project` (string)
    - `job_id` (string)
- **Optional Parameters (query string)**:
    - `presign_expiry` (integer, seconds; default 3600, min 60, max 604800)
- **Response**: status, job_id, metadata, result (object with keys for each file type present)
    - Example result keys: `html`, `markdown`, `png_viewport`, `png_full`, `png_mobile`, `png_ultrawide`, `png_mobile_iphone_14_pro`, `png_mobile_pixel_8_pro`, `png_custom_800x600`, etc.
    - Only returns URLs for files present in the job folder, excluding archive and metadata.
- **Notes**: The result keys are dynamically generated based on the requested screenshot variants and files produced.

### Example CURL

```bash
curl "<https://api.snapit.intelliconvert.ai/preview?user=ariful&project=myproject&job_id=498505534640>"
```

---

## Notes

- All job state and results are stored in S3 as files (e.g., `metadata.json`). No database is used.
- To add a new region for workers, update the deployment configuration and redeploy.
- For full details on request/response formats, see the controller code and S3 object structure.
- **Mobile device emulation:** You can request screenshots for any mobile device by model name. Supported models include iPhone 14 Pro, iPhone SE, iPhone XR, Pixel 7, Pixel 8 Pro, Galaxy S24, Galaxy S8+, Galaxy S20 Ultra, and more. If a model is not recognized, a generic mobile emulation will be used.
- All mobile screenshots use a mobile user agent for accurate rendering.