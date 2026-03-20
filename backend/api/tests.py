from django.contrib.auth.models import User
from django.test import override_settings
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.files.uploadedfile import SimpleUploadedFile


class ApiSecurityAndStructureTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="profile_user",
            email="profile@example.com",
            password="testpass123",
            first_name="Prince",
            last_name="Rai",
        )
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)

    def auth(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

    def test_user_detail_requires_authentication(self):
        response = self.client.get("/api/user/")
        self.assertEqual(response.status_code, 401)

    def test_user_detail_returns_current_user(self):
        self.auth()
        response = self.client.get("/api/user/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["username"], "profile_user")
        self.assertEqual(response.data["email"], "profile@example.com")
        self.assertIn("date_joined", response.data)

    def test_transactions_response_shape(self):
        self.auth()
        response = self.client.get("/api/transactions/")

        self.assertEqual(response.status_code, 200)
        if response.data:
            tx = response.data[0]
            self.assertEqual(sorted(tx.keys()), ["amount", "category", "date", "description", "id"])

    def test_insights_endpoint_returns_structured_json(self):
        self.auth()
        response = self.client.get("/api/insights/")

        self.assertEqual(response.status_code, 200)
        self.assertIn("highest_spending_category", response.data)
        self.assertIn("unusual_transactions", response.data)
        self.assertIn("savings_rate", response.data)
        self.assertIn("recommendation", response.data)

    def test_upload_rejects_invalid_extension(self):
        self.auth()
        bad_file = SimpleUploadedFile("notes.txt", b"hello world", content_type="text/plain")

        response = self.client.post("/api/upload/", {"file": bad_file}, format="multipart")

        self.assertEqual(response.status_code, 400)
        self.assertIn("Invalid file type", response.data["error"])

    @override_settings(MAX_UPLOAD_SIZE_MB=0)
    def test_upload_rejects_oversized_files(self):
        self.auth()
        content = b"Date,Description,Amount\n2026-01-01,Test,-100\n"
        csv_file = SimpleUploadedFile("sample.csv", content, content_type="text/csv")

        response = self.client.post("/api/upload/", {"file": csv_file}, format="multipart")

        self.assertEqual(response.status_code, 400)
        self.assertIn("File too large", response.data["error"])
