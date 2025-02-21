from azure.messaging.webpubsubservice import WebPubSubServiceClient
from app.config.settings import settings
from collections import defaultdict

class PubSubService:
    def __init__(self):
        self.client = WebPubSubServiceClient.from_connection_string(
            settings.AZURE_WEBPUBSUB_CONNECTION_STRING,
            hub=settings.HUB_NAME
        )
        self.user_connections = {} 
    def get_client_access_url(self):
        token = self.client.get_client_access_token()
        return {"url": token['url']}

    def send_to_all(self, message):
        self.client.send_to_all(
            message=message,
            content_type="application/json"
        )

    def user_connected(self, user_id, connection_id):
        """
        Register a user connection.
        """
        self.user_connections[user_id] = connection_id

    def user_disconnected(self, user_id):
        """
        Unregister a user connection.
        """
        if user_id in self.user_connections:
            del self.user_connections[user_id]

    def send_to_user(self, user_id, message):
        """
        Send a message to a specific user based on their connection.
        """
        if user_id in self.user_connections:
            connection_id = self.user_connections[user_id]
            self.client.send_to_user(
                user_id=connection_id,  # Use the connection ID to send the message
                message=message,
                content_type="application/json"
            )
        else:
            # Handle the case where the user is not connected
            print(f"User {user_id} is not connected. Message not sent.")

# Initialize the PubSubService instance
pubsub_service = PubSubService()