# Life Sync Infra

Infrastructure and backend services powering the [For As Long As I'm Alive project](https://ondrejbarta.com).

## Overview

This repository uses infrastructure-as-code to automatically maintain the Google Cloud Platform resources needed for the project:

- Cloud Storage buckets for persistent data storage
- Cloud Functions (v2) for serverless API endpoints 
- IAM configuration for secure resource access

## CI/CD Pipeline

Deployment is fully automated:
- Merges to main branch trigger Terraform deployment via GitHub Actions
- Infrastructure changes are applied automatically
- Function code is built and deployed as part of the pipeline

## Repository Structure

- `/functions` - Cloud Function implementation
- `*.tf` - Terraform configuration files