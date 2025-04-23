terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.3.0"
    }
  }

  backend "gcs" {
    bucket = "life-sync-terraform-state"
    prefix = "terraform/state"
  }
}