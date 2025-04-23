variable "project_id" {
  description = "GCP Project ID"
  default     = "life-sync-457719"
}

variable "region" {
  description = "GCP region"
  default     = "europe-west1"
}

variable "storage_bucket_name" {
  description = "Name of the storage bucket"
  default     = "life-sync-bucket"
}

variable "function_name" {
  description = "Name of the Cloud Function"
  default     = "life-sync-function"
}

variable "functions" {
  type = list(object({
    name = string
    entry_point = string
    source_dir = string
  }))
  default = [
    {
      name = "life-sync-function"
      entry_point = "lifeSync"
      source_dir = "life-sync-function"
    }
  ]
}