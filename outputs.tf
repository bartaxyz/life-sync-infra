output "bucket_url" {
  value       = google_storage_bucket.life_sync_bucket.url
  description = "URL of the storage bucket"
}

output "function_urls" {
  value = {
    for k, f in google_cloudfunctions2_function.functions :
    k => f.service_config[0].uri
  }
}