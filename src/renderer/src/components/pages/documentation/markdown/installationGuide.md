# Application Installation Guide

Welcome to the installation guide for the application. Follow the steps below to set up everything correctly.

---

## &rarr; Step 1: Download & Install the Application

1. Go to the [GitHub Releases Page](https://github.com/Lambton-Digital-Transformation-Lab/blue-water-anglers)
2. Click on the `latest release`

    {{img:latest-release}}

3. Download the `.exe` file

    {{img:download-exe}}

~ (NOTE: NOT THE .exe.blockmap)

4. Run the installer:
   - Select your installation preferences
   - Click `Install`
   - Let the installer finish

   {{img:install-app}}

---

## &rarr; Step 2: Google Cloud Service Account Setup

> `Note`: A Google Cloud account has already been created.

1. Navigate to your Google Cloud `Project`
2. In the sidebar, go to `APIs & Services` > `Enabled APIs & services`
3. Select `Google Drive API`
4. Go to `Credentials` tab
5. Click on `Service Accounts`
6. In the service account page:
   - Click `Keys`
   - Choose `Add Key`
   - Select `JSON Format`
   - Download the key

   {{img:cloud-api}}

   {{img:cloud-console}}

7. Move the downloaded key file to the following directory:
```
This PC > Local Disk > Users > Dell > AppData > Roaming > bluewateranglers > database > google_creds_path
```
{{img:file-location}}


8. Rename the file to:
``` service_account ```
---

## &rarr; Step 3: Share Google Drive Folder

1. Go to Google Drive
2. Select the target folder
3. Share it with the `service account email` (found in your JSON key file)

    {{img:google-drive-share}}

4. Copy the `slug` portion of the shared folder URL
- For example:  
  If the URL is `https://drive.google.com/drive/folders/1abcDEFghIjKLMnOpQ`,  
  The slug is: `1abcDEFghIjKLMnOpQ`

5. Create a file named `folder_id` with the following content:

```
{
  "FOLDER_ID": "1abcDEFghIjKLMnOpQ"
}
```
{{img:google-creds}}


## &rarr; After installation

After installing the application and setting up the cloud backup you can click on run application icon within desktop

{{img:run-app}}


## &rarr; Need Help?

For more assistance, Please contact Lambton Research & Innovation Lab