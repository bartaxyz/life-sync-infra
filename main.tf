provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_storage_bucket" "life_sync_bucket" {
  name     = var.storage_bucket_name
  location = var.region

  uniform_bucket_level_access = true

  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

resource "google_storage_bucket" "function_source" {
  name     = "${var.project_id}-function-source"
  location = var.region
}

data "archive_file" "function_zip" {
  for_each    = { for f in var.functions : f.name => f }
  type        = "zip"
  output_path = "${path.module}/functions/${each.value.name}.zip"
  source_dir  = "${path.module}/functions/${each.value.name}"
  excludes    = ["node_modules", "dist"]
}

resource "google_storage_bucket_object" "function_source_zip" {
  for_each = { for f in var.functions : f.name => f }
  name     = "function-source-${data.archive_file.function_zip[each.value.name].output_md5}.zip"
  bucket   = google_storage_bucket.function_source.name
  source   = data.archive_file.function_zip[each.value.name].output_path
}

resource "google_cloudfunctions2_function" "functions" {
  for_each = { for f in var.functions : f.name => f }
  name     = each.value.name
  location = var.region

  build_config {
    runtime     = "nodejs22"
    entry_point = each.value.entry_point
    source {
      storage_source {
        bucket = google_storage_bucket.function_source.name
        object = google_storage_bucket_object.function_source_zip[each.value.name].name
      }
    }
  }

  service_config {
    max_instance_count = 1
    available_memory   = "256M"
    timeout_seconds    = 60
    environment_variables = {
      ALLOWED_APPLE_ID = var.allowed_apple_id
    }
  }
}

resource "google_cloud_run_service_iam_member" "public_access" {
  for_each = { for f in var.functions : f.name => f }
  location = var.region
  service  = google_cloudfunctions2_function.functions[each.value.name].name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
