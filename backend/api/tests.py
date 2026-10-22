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

    def test_demo_endpoints_accessible_without_auth(self):
        # Unauthenticated guest request to /api/demo/user/
        user_res = self.client.get("/api/demo/user/")
        self.assertEqual(user_res.status_code, 200)
        self.assertTrue(user_res.data.get("is_guest"))
        self.assertIn("username", user_res.data)

        # Unauthenticated guest request to /api/demo/transactions/
        tx_res = self.client.get("/api/demo/transactions/")
        self.assertEqual(tx_res.status_code, 200)
        self.assertIsInstance(tx_res.data, list)
        self.assertGreater(len(tx_res.data), 0)
        first_tx = tx_res.data[0]
        self.assertEqual(sorted(first_tx.keys()), ["amount", "category", "date", "description", "id"])

        # Unauthenticated guest request to /api/demo/summary/
        summary_res = self.client.get("/api/demo/summary/")
        self.assertEqual(summary_res.status_code, 200)
        for field in ["total_income", "total_expense", "net_balance", "category_breakdown"]:
            self.assertIn(field, summary_res.data)

        # Unauthenticated guest request to /api/demo/insights/
        insights_res = self.client.get("/api/demo/insights/")
        self.assertEqual(insights_res.status_code, 200)
        for field in ["highest_spending_category", "unusual_transactions", "savings_rate", "recommendation"]:
            self.assertIn(field, insights_res.data)

        # Unauthenticated guest request to /api/demo/budget/
        budget_res = self.client.get("/api/demo/budget/")
        self.assertEqual(budget_res.status_code, 200)
        self.assertIn("predicted_budget", budget_res.data)
        self.assertIn("confidence_note", budget_res.data)

        # Unauthenticated guest request to /api/demo/anomalies/
        anomalies_res = self.client.get("/api/demo/anomalies/")
        self.assertEqual(anomalies_res.status_code, 200)
        self.assertIn("unusual_transactions", anomalies_res.data)

    def test_demo_endpoints_reject_modifications(self):
        # Guests cannot POST, PUT, or DELETE demo data
        post_res = self.client.post("/api/demo/transactions/", {"amount": 500})
        self.assertEqual(post_res.status_code, 405)

        del_res = self.client.delete("/api/demo/transactions/")
        self.assertEqual(del_res.status_code, 405)

    def test_authenticated_endpoints_remain_strictly_protected(self):
        # Protected endpoints must reject unauthenticated requests
        for endpoint in [
            "/api/transactions/",
            "/api/summary/",
            "/api/insights/",
            "/api/budget/",
            "/api/anomalies/",
            "/api/user/",
        ]:
            res = self.client.get(endpoint)
            self.assertEqual(res.status_code, 401, f"Endpoint {endpoint} should require authentication")

        upload_res = self.client.post("/api/upload/", {})
        self.assertEqual(upload_res.status_code, 401)

    def test_user_data_isolation_and_cross_user_protection(self):
        from .models import Category, Transaction, UploadedStatement

        # Create statement and transaction for User A
        statement_a = UploadedStatement.objects.create(
            user=self.user,
            name="user_a_statement.csv",
            file=SimpleUploadedFile("user_a.csv", b"content", content_type="text/csv"),
        )
        cat_a = Category.objects.create(user=self.user, name="Bills")
        Transaction.objects.create(
            user=self.user,
            statement=statement_a,
            date="2026-10-01",
            description="User A Private Expense",
            amount=-5000.0,
            category=cat_a,
        )

        # User B setup
        user_b = User.objects.create_user(
            username="user_b",
            email="user_b@example.com",
            password="testpass123",
        )
        token_b = str(RefreshToken.for_user(user_b).access_token)

        # User B queries /api/transactions/
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_b}")
        res_b = self.client.get("/api/transactions/")
        self.assertEqual(res_b.status_code, 200)
        self.assertEqual(len(res_b.data), 0, "User B should not see User A's transactions")

        # Demo endpoint should return fixed mock data, never User A's private transaction
        self.client.credentials()  # Clear auth (guest)
        demo_res = self.client.get("/api/demo/transactions/")
        self.assertEqual(demo_res.status_code, 200)
        descriptions = [tx["description"] for tx in demo_res.data]
        self.assertNotIn("User A Private Expense", descriptions)

