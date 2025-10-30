from django.urls import path
from .views import RegisterView, LoginView, UserListView, toggle_user_verification, CurrentUserView, LogoutView, UpdateProfileView, ChangePasswordView, UploadAvatarView

urlpatterns = [
    path("list/", UserListView.as_view(), name="user_list"),
    path("verify/<int:user_id>/", toggle_user_verification, name="toggle_verification"),
    path("profile/", UpdateProfileView.as_view(), name="update_profile"),
    path("profile/password/", ChangePasswordView.as_view(), name="change_password"),
    path("profile/avatar/", UploadAvatarView.as_view(), name="upload_avatar"),
]
