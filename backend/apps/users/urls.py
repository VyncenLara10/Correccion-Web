from django.urls import path
from .views import RegisterView, LoginView, UserListView, toggle_user_verification, CurrentUserView, LogoutView, UpdateProfileView, ChangePasswordView, UploadAvatarView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("list/", UserListView.as_view(), name="user_list"),
    path("verify/<int:user_id>/", toggle_user_verification, name="toggle_verification"),
    path("me/", CurrentUserView.as_view(), name="current_user"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("profile/", UpdateProfileView.as_view(), name="update_profile"),
    path("profile/password/", ChangePasswordView.as_view(), name="change_password"),
    path("profile/avatar/", UploadAvatarView.as_view(), name="upload_avatar"),
]
