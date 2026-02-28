from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Transaction, UploadedStatement, Category


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class TransactionSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()

    class Meta:
        model = Transaction
        fields = '__all__'


class StatementSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedStatement
        fields = '__all__'


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'