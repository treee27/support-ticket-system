from django.urls import path
from . import views

urlpatterns = [
    path('', views.ticket_list_create, name='ticket-list-create'),
    path('<int:pk>/', views.ticket_detail, name='ticket-detail'),
    path('stats/', views.ticket_stats, name='ticket-stats'),
    path('classify/', views.classify, name='ticket-classify'),
]
