from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AnomaliesAPIView,
    BudgetAPIView,
    DemoAnomaliesAPIView,
    DemoBudgetAPIView,
    DemoInsightsAPIView,
    DemoSummaryAPIView,
    DemoTransactionsAPIView,
    DemoUserAPIView,
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
    # Demo/Guest mode endpoints (public read-only fictional data)
    path("demo/user/", DemoUserAPIView.as_view(), name="demo-user"),
    path("demo/transactions/", DemoTransactionsAPIView.as_view(), name="demo-transactions"),
    path("demo/summary/", DemoSummaryAPIView.as_view(), name="demo-summary"),
    path("demo/insights/", DemoInsightsAPIView.as_view(), name="demo-insights"),
    path("demo/budget/", DemoBudgetAPIView.as_view(), name="demo-budget"),
    path("demo/anomalies/", DemoAnomaliesAPIView.as_view(), name="demo-anomalies"),
    path("", include(router.urls)),
]
