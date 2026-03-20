from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AnomaliesAPIView,
    BudgetAPIView,
    InsightsAPIView,
    LoginView,
    RegisterView,
    StatementViewSet,
    SummaryAPIView,
    TransactionViewSet,
    UploadViewSet,
    UserViewSet,
)

router = DefaultRouter()
router.register("user", UserViewSet, basename="user")
router.register("transactions", TransactionViewSet, basename="transactions")
router.register("upload", UploadViewSet, basename="upload")
router.register("statements", StatementViewSet, basename="statements")

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("summary/", SummaryAPIView.as_view(), name="summary"),
    path("insights/", InsightsAPIView.as_view(), name="insights"),
    path("budget/", BudgetAPIView.as_view(), name="budget"),
    path("anomalies/", AnomaliesAPIView.as_view(), name="anomalies"),
    path("", include(router.urls)),
]
