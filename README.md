# Life Sync Infrastructure

Infrastructure as code for the Life Sync application using Terraform on Google Cloud Platform.

## Components

- Google Cloud Storage bucket for data storage
- Cloud Function v2 for API functionality (written in TypeScript)

## Setup

1. Install Terraform
2. Configure GCP credentials
3. Initialize Terraform:

```bash
terraform init
```

4. Apply the configuration:

```bash
terraform plan
terraform apply
```

5. Import existing bucket (if needed):

```bash
terraform import google_storage_bucket.life_sync personal-website-322920/life-sync
```

## Function Development

The Cloud Function is written in TypeScript:

```bash
cd function
npm install
npm run dev   # Local development with hot reload
npm run start # Run locally with functions-framework
npm run build # Build for production
```

## Manual Deployment

The function can be manually deployed using:

```bash
cd function
npm run deploy
```

Or let Terraform handle the deployment by running:

```bash
terraform apply
```