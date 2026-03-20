import logging

from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Category, Transaction, UploadedStatement

logger = logging.getLogger(__name__)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "first_name", "last_name"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "date_joined"]


class TransactionSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()

    class Meta:
        model = Transaction
        fields = ["id", "date", "description", "amount", "category"]


class StatementSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedStatement
        fields = ["id", "name", "uploaded_at"]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class LoggingTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username = attrs.get("username", "unknown")
        try:
            data = super().validate(attrs)
            logger.info("Authentication successful for user=%s", username)
            return data
        except Exception:
            logger.warning("Authentication failed for user=%s", username)
            raise
