import json
from azure.messaging.webpubsubservice import WebPubSubServiceClient
from app.core.settings import settings

class PubSubService:
    def __init__(self):
        self.client = WebPubSubServiceClient.from_connection_string(
            settings.AZURE_WEBPUBSUB_CONNECTION_STRING,
            hub=settings.HUB_NAME
        )
        self.user_connections = {}  # Dictionary mapping user_id -> set of connection_ids

    # def get_client_access_url(self):
    #     """
    #     Generate an access URL for a new client connection.
    #     """
    #     token = self.client.get_client_access_token()
    #     return {"url": token['url']}

    def send_to_all(self, message):
        """
        Send a message to all connected users.
        """
        self.client.send_to_all(
            message=message,
            content_type="application/json"
        )
        print(f"Message sent to all: {message}")

    def user_disconnected(self, connection_id):
        """
        Unregister a user connection.
        """
        for user_id, connections in self.user_connections.items():
            if connection_id in connections:
                connections.remove(connection_id)
                if not connections:  # If the user has no more active connections, remove them from the dict
                    del self.user_connections[user_id]
                print(f"User {user_id} disconnected. Remaining connections:", self.user_connections)
                return

        print(f"Connection {connection_id} not found.")

    def get_client_access_url(self, user_id):
        """
        Generate an access URL for a new client connection with a specific user ID.
        This ensures Azure Web PubSub recognizes the user.
        """
          # Ensure user_id is a string
        token = self.client.get_client_access_token(user_id=str(user_id))  # Generate token with user_id
        return {"url": token['url']}

    def user_connected(self, user_id, connection_id):
        """
        Register a new user connection and add them to Web PubSub groups.
        """
        user_id = str(user_id)  # Ensure user_id is a string
        if user_id not in self.user_connections:
            self.user_connections[user_id] = set()
        self.user_connections[user_id].add(connection_id)

        print(f"🔗 User {user_id} connected with {connection_id}. Current connections:", self.user_connections)

        # # 🔥 Add user to a Web PubSub group (AFTER they are recognized)
        # try:
        #     self.client.add_user_to_group(group=f"user_{user_id}", user_id=user_id)
        #     print(f"✅ User {user_id} added to Web PubSub group")
        # except Exception as e:
        #     print(f"❌ Failed to add user {user_id} to group: {e}")

    def user_disconnected(self, connection_id):
        """
        Unregister a user connection.
        """
        for user_id, connections in self.user_connections.items():
            if connection_id in connections:
                connections.remove(connection_id)
                if not connections:  # If the user has no more active connections, remove them from the dict
                    del self.user_connections[user_id]
                print(f"User {user_id} disconnected. Remaining connections:", self.user_connections)
                return
        print(f"Connection {connection_id} not found.")

    def send_to_user(self, connection_id, user_id, message):
        """
        Send a message to a specific user.
        """
        user_id = str(user_id)  # Ensure user_id is a string
        if user_id in self.user_connections:
            print(f"📤 Sending message to user {user_id}: {message}")
            try:
                self.client.send_to_user(
                    user_id=user_id,
                    message=message,  # Ensure message is a JSON string
                    content_type="application/json"
                )
                print(f"✅ Message sent to user {user_id}")
            except Exception as e:
                print(f"❌ Failed to send message to user {user_id}: {e}")
        else:
            print(f"⚠️ User {user_id} is not connected. Message not sent.")
# Initialize the PubSubService instance
pubsub_service = PubSubService()
