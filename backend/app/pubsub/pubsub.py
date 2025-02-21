from azure.messaging.webpubsubservice import WebPubSubServiceClient
from app.config.settings import settings

class PubSubService:
    def __init__(self):
        self.client = WebPubSubServiceClient.from_connection_string(
            settings.AZURE_WEBPUBSUB_CONNECTION_STRING,
            hub=settings.HUB_NAME
        )

    def get_client_access_url(self):
        token = self.client.get_client_access_token()
        return {"url": token['url']}

    def send_to_all(self, message):
        self.client.send_to_all(
            message=message,
            content_type="application/json"
        )

# Initialize the PubSubService instance
pubsub_service = PubSubService()