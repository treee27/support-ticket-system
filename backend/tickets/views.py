from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta

from .models import Ticket
from .serializers import TicketSerializer
from .llm import classify_ticket


@api_view(['GET', 'POST'])
def ticket_list_create(request):
    """
    GET  /api/tickets/   — list all tickets with optional filters
    POST /api/tickets/   — create a new ticket
    """

    if request.method == 'GET':
        qs = Ticket.objects.all()

        # Filters
        category = request.query_params.get('category')
        priority = request.query_params.get('priority')
        status_filter = request.query_params.get('status')
        search = request.query_params.get('search')

        if category:
            qs = qs.filter(category=category)

        if priority:
            qs = qs.filter(priority=priority)

        if status_filter:
            qs = qs.filter(status=status_filter)

        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )

        serializer = TicketSerializer(qs, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = TicketSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
def ticket_detail(request, pk):
    """
    PATCH /api/tickets/<id>/ — partial update
    """
    try:
        ticket = Ticket.objects.get(pk=pk)
    except Ticket.DoesNotExist:
        return Response(
            {'error': 'Ticket not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = TicketSerializer(ticket, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def ticket_stats(request):
    """
    GET /api/tickets/stats/
    """
    from django.db.models import Count
    from django.db.models.functions import TruncDate

    total = Ticket.objects.count()
    open_count = Ticket.objects.filter(status='open').count()

    daily_counts = (
        Ticket.objects
        .annotate(day=TruncDate('created_at'))
        .values('day')
        .annotate(count=Count('id'))
        .order_by('day')
    )

    if daily_counts.exists():
        total_days = daily_counts.count()
        avg_per_day = round(total / total_days, 1) if total_days > 0 else 0
    else:
        avg_per_day = 0

    # Priority breakdown
    priority_qs = (
        Ticket.objects
        .values('priority')
        .annotate(count=Count('id'))
    )

    priority_breakdown = {p['priority']: p['count'] for p in priority_qs}
    for key in ['low', 'medium', 'high', 'critical']:
        priority_breakdown.setdefault(key, 0)

    # Category breakdown
    category_qs = (
        Ticket.objects
        .values('category')
        .annotate(count=Count('id'))
    )

    category_breakdown = {c['category']: c['count'] for c in category_qs}
    for key in ['billing', 'technical', 'account', 'general']:
        category_breakdown.setdefault(key, 0)

    return Response({
        'total_tickets': total,
        'open_tickets': open_count,
        'avg_tickets_per_day': avg_per_day,
        'priority_breakdown': priority_breakdown,
        'category_breakdown': category_breakdown,
    })


@api_view(['POST'])
def classify(request):
    """
    POST /api/tickets/classify/
    """
    description = request.data.get('description', '')

    if not description.strip():
        return Response(
            {'error': 'description is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    result = classify_ticket(description)
    return Response(result)
