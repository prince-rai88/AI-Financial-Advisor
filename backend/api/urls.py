from django.urls import path
from .views import (
    RegisterView,
    UploadStatementView,
    TransactionListView,
    SummaryView,
    DeleteStatementView
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("login/", TokenObtainPairView.as_view()),
    path("refresh/", TokenRefreshView.as_view()),

    path("upload/", UploadStatementView.as_view()),
    path("transactions/", TransactionListView.as_view()),
    path("summary/", SummaryView.as_view()),
    path("delete-statement/<int:statement_id>/", DeleteStatementView.as_view()),
]