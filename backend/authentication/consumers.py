import json
from channels.generic.websocket import AsyncWebsocketConsumer

class SignalingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['appointment_id']
        self.room_group_name = f'signaling_{self.room_name}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        
        # Relay the message to the other person in the room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'signaling_message',
                'message': data,
                'sender_channel_name': self.channel_name
            }
        )

    # Receive message from room group
    async def signaling_message(self, event):
        # Send message to WebSocket (if not the sender)
        if self.channel_name != event['sender_channel_name']:
            await self.send(text_data=json.dumps(event['message']))
