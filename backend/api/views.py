import pandas as pd
from datetime import datetime
from collections import defaultdict

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from django.contrib.auth.models import User

from .models import UploadedStatement, Transaction, Category
from .serializers import (
    RegisterSerializer,
    TransactionSerializer,
    StatementSerializer,
    CategorySerializer,
    UserProfileSerializer,
)


def auto_categorize(description):
    description = description.lower()

    if "zomato" in description or "swiggy" in description:
        return "Food"
    elif "uber" in description or "ola" in description:
        return "Transport"
    elif "salary" in description:
        return "Income"
    elif "amazon" in description or "flipkart" in description:
        return "Shopping"
    else:
        return "Others"


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully"})
        return Response(serializer.errors, status=400)


class UserDetailView(APIView):
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)


class UploadStatementView(APIView):

    def post(self, request):
        file = request.FILES.get("file")

        if not file:
            return Response({"error": "No file uploaded"}, status=400)

        df = pd.read_csv(file)

        statement = UploadedStatement.objects.create(
            user=request.user,
            file=file,
            name=file.name
        )

        for _, row in df.iterrows():

            category_name = auto_categorize(row["Description"])

            category, _ = Category.objects.get_or_create(
                user=request.user,
                name=category_name
            )

            Transaction.objects.create(
                user=request.user,
                statement=statement,
                date=datetime.strptime(row["Date"], "%Y-%m-%d").date(),
                description=row["Description"],
                amount=float(row["Amount"]),
                category=category
            )

        return Response({"message": "File uploaded successfully"})


class TransactionListView(APIView):

    def get(self, request):
        transactions = Transaction.objects.filter(user=request.user)
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)


class SummaryView(APIView):

    def get(self, request):
        transactions = Transaction.objects.filter(user=request.user)

        total_income = 0
        total_expense = 0
        category_summary = defaultdict(float)
        monthly_summary = defaultdict(float)

        for t in transactions:

            if t.amount > 0:
                total_income += t.amount
            else:
                total_expense += t.amount

            category_summary[t.category.name] += t.amount

            month = t.date.strftime("%Y-%m")
            monthly_summary[month] += t.amount

        return Response({
            "total_income": total_income,
            "total_expense": total_expense,
            "net_balance": total_income + total_expense,
            "category_breakdown": category_summary,
            "monthly_breakdown": monthly_summary
        })


class DeleteStatementView(APIView):

    def delete(self, request, statement_id):
        try:
            statement = UploadedStatement.objects.get(
                id=statement_id,
                user=request.user
            )
            statement.delete()
            return Response({"message": "Statement deleted"})
        except UploadedStatement.DoesNotExist:
            return Response({"error": "Not found"}, status=404)
