
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # path('admin/', admin.site.urls),
    path('admin/', admin.site.urls),
    # path('', include('PMS_App.urls')),  # Include your app's URLs
    path('pms/', include('PMS_App.urls')),  # Include your app's URLs
]
