resource "google_storage_bucket_iam_member" "life_sync_bucket_iam" {
  bucket = google_storage_bucket.life_sync_bucket.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

