from django.urls import path
from .views import RegisterView, LoginView, UserListView, toggle_user_verification

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("list/", UserListView.as_view(), name="user_list"),
    path("verify/<int:user_id>/", toggle_user_verification, name="toggle_verification"),
]
