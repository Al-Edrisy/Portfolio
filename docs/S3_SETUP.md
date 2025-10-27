# S3 Configuration for Phone Recovery Page

This document explains how to configure S3-compatible storage for the phone recovery page image uploads.

## Required Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# S3 Configuration
S3_ENDPOINT=your-s3-endpoint-url
S3_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_FORCE_PATH_STYLE=true
```

## Configuration by Provider

### AWS S3
```env
S3_ENDPOINT=https://s3.amazonaws.com
S3_REGION=us-east-1
S3_BUCKET_NAME=your-bucket
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_FORCE_PATH_STYLE=false
```

### Backblaze B2
```env
S3_ENDPOINT=https://s3.us-west-004.backblazeb2.com
S3_REGION=us-west-004
S3_BUCKET_NAME=your-bucket
S3_ACCESS_KEY_ID=your-key-id
S3_SECRET_ACCESS_KEY=your-application-key
S3_FORCE_PATH_STYLE=true
```

### DigitalOcean Spaces
```env
S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
S3_REGION=nyc3
S3_BUCKET_NAME=your-space-name
S3_ACCESS_KEY_ID=your-spaces-key
S3_SECRET_ACCESS_KEY=your-spaces-secret
S3_FORCE_PATH_STYLE=false
```

### Cloudflare R2
```env
S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET_NAME=your-bucket
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_FORCE_PATH_STYLE=false
```

## Bucket Configuration

1. **Create a bucket** in your S3-compatible storage provider
2. **Set the bucket to public** (or configure appropriate CORS rules)
3. **Create the folder structure**: Create a folder named `phone-founder-images` in your bucket
4. **Set ACL permissions**: Enable public-read access for uploads

## Image Upload Behavior

- Images are uploaded to the `phone-founder-images/` folder
- Filenames follow the pattern: `{timestamp}-{randomId}.{extension}`
- Example: `2025-01-27T14-30-45-a3b2c1.jpg`
- All images are publicly accessible via their S3 URL
- The S3 URL is stored in Firestore for future reference

## Firestore Storage

Each device location record now includes:
- `imageUrl`: Public S3 URL to the uploaded image
- All other metadata (coordinates, IP, device info, etc.)

## Troubleshooting

### Upload Fails
- Verify your S3 credentials are correct
- Check that the bucket exists and is accessible
- Ensure the bucket allows public-read ACLs
- Verify CORS settings if accessing from a browser

### Images Not Accessible
- Check that the bucket/object ACL is set to public-read
- Verify the S3 URL is correctly constructed
- Test the URL directly in a browser

### Permission Errors
- Ensure your access key has `PutObject` permission
- Check that your secret key matches
- Verify the endpoint URL is correct for your provider
