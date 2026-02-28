from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken


class UserDetailEndpointTests(APITestCase):
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

    def test_user_detail_requires_authentication(self):
        response = self.client.get("/api/user/")
        self.assertEqual(response.status_code, 401)

    def test_user_detail_returns_current_user(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")
        response = self.client.get("/api/user/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["username"], "profile_user")
        self.assertEqual(response.data["name"], "Prince Rai")
        self.assertEqual(response.data["email"], "profile@example.com")
        self.assertEqual(response.data["account_type"], "Standard")
        self.assertIn("date_joined", response.data)
