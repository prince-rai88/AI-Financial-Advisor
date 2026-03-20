import logging

from django.conf import settings
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .ml_services import (
    detect_anomalies,
    generate_insights,
    generate_summary,
    predict_monthly_budget,
)
from .models import Category, Transaction, UploadedStatement
from .serializers import (
    LoggingTokenObtainPairSerializer,
    RegisterSerializer,
    TransactionSerializer,
    UserProfileSerializer,
)
from .services import is_allowed_extension, parse_statement_file

logger = logging.getLogger(__name__)


def error_response(message, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({"error": message}, status=status_code)


class LoginView(TokenObtainPairView):
    serializer_class = LoggingTokenObtainPairSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            logger.info("User registered: id=%s username=%s", user.id, user.username)
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)


class UploadViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def create(self, request):
        file_obj = request.FILES.get("file")

        if not file_obj:
            return error_response("No file uploaded.", status.HTTP_400_BAD_REQUEST)

        if not is_allowed_extension(file_obj.name):
            return error_response("Invalid file type. Allowed: CSV and XLSX.", status.HTTP_400_BAD_REQUEST)

        max_size_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if file_obj.size > max_size_bytes:
            return error_response(
                f"File too large. Maximum allowed size is {settings.MAX_UPLOAD_SIZE_MB} MB.",
                status.HTTP_400_BAD_REQUEST,
            )

        try:
            parse_result = parse_statement_file(file_obj)
        except ValueError as validation_error:
            logger.warning("Upload validation failed for user=%s: %s", request.user.id, validation_error)
            return error_response(str(validation_error), status.HTTP_400_BAD_REQUEST)
        except Exception:
            logger.exception("Failed to parse uploaded file for user=%s", request.user.id)
            return error_response("Failed to parse uploaded file.", status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            statement = UploadedStatement.objects.create(
                user=request.user,
                file=file_obj,
                name=file_obj.name,
            )

            transactions = parse_result["transactions"]

            for tx in transactions:
                category, _ = Category.objects.get_or_create(
                    user=request.user,
                    name=tx["category_name"],
                )

                Transaction.objects.create(
                    user=request.user,
                    statement=statement,
                    date=tx["date"],
                    description=tx["description"],
                    amount=tx["amount"],
                    category=category,
                )

            logger.info(
                "File uploaded user=%s statement=%s transactions_created=%s",
                request.user.id,
                statement.id,
                len(transactions),
            )

            return Response(
                {
                    "message": "File uploaded successfully",
                    "statement_id": statement.id,
                    "transactions_created": len(transactions),
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception:
            logger.exception("Server error while storing uploaded file for user=%s", request.user.id)
            return error_response("Could not process the uploaded file.", status.HTTP_500_INTERNAL_SERVER_ERROR)


class TransactionViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Transaction.objects.filter(user=self.request.user)
            .select_related("category")
            .order_by("-date", "-id")
        )


class SummaryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            queryset = Transaction.objects.filter(user=request.user).select_related("category")
            data = generate_summary(queryset)
            return Response(data, status=status.HTTP_200_OK)
        except Exception:
            logger.exception("Summary generation failed for user=%s", request.user.id)
            return error_response("Could not generate summary.", status.HTTP_500_INTERNAL_SERVER_ERROR)


class InsightsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            queryset = Transaction.objects.filter(user=request.user).select_related("category")
            data = generate_insights(queryset)
            return Response(data, status=status.HTTP_200_OK)
        except Exception:
            logger.exception("Insight generation failed for user=%s", request.user.id)
            return error_response("Could not generate insights.", status.HTTP_500_INTERNAL_SERVER_ERROR)


class BudgetAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            queryset = Transaction.objects.filter(user=request.user).select_related("category")
            data = predict_monthly_budget(queryset)
            return Response(data, status=status.HTTP_200_OK)
        except Exception:
            logger.exception("Budget prediction failed for user=%s", request.user.id)
            return error_response("Could not predict budget.", status.HTTP_500_INTERNAL_SERVER_ERROR)


class AnomaliesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            queryset = Transaction.objects.filter(user=request.user).select_related("category")
            anomalies = detect_anomalies(queryset)
            return Response({"unusual_transactions": anomalies}, status=status.HTTP_200_OK)
        except Exception:
            logger.exception("Anomaly detection failed for user=%s", request.user.id)
            return error_response("Could not detect anomalies.", status.HTTP_500_INTERNAL_SERVER_ERROR)


class StatementViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["delete"], url_path="delete")
    def delete_statement(self, request, pk=None):
        try:
            statement = UploadedStatement.objects.get(id=pk, user=request.user)
            statement.delete()
            logger.info("Statement deleted user=%s statement=%s", request.user.id, pk)
            return Response({"message": "Statement deleted"}, status=status.HTTP_200_OK)
        except UploadedStatement.DoesNotExist:
            return error_response("Statement not found.", status.HTTP_404_NOT_FOUND)
        except Exception:
            logger.exception("Failed to delete statement user=%s statement=%s", request.user.id, pk)
            return error_response("Could not delete statement.", status.HTTP_500_INTERNAL_SERVER_ERROR)
