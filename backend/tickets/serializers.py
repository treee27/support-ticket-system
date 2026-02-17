from rest_framework import serializers
from .models import Ticket


class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

    def validate_title(self, value):
        if len(value) > 200:
            raise serializers.ValidationError(
                "Title must be 200 characters or fewer."
            )
        return value
