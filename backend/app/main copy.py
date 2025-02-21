import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from azure.messaging.webpubsubservice import WebPubSubServiceClient
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables
connection_string = os.getenv("AZURE_WEBPUBSUB_CONNECTION_STRING")
hub_name = os.getenv("HUB_NAME")

# Validate environment variables
if not connection_string:
    raise ValueError("AZURE_WEBPUBSUB_CONNECTION_STRING is not set in the environment variables.")
if not hub_name:
    raise ValueError("HUB_NAME is not set in the environment variables.")

# Debugging
print(f"Connection String: {connection_string}")
print(f"Hub Name: {hub_name}")

# Initialize Azure Web PubSub client
wps_client = WebPubSubServiceClient.from_connection_string(connection_string, hub=hub_name)
print(f"WebPubSub Client: {wps_client}")

@app.get("/negotiate")
async def get_client_url():
    token = wps_client.get_client_access_token()
    return {"url": token['url']}

@app.post("/trigger-api")
async def trigger_api():
    try:
        wps_client.send_to_all(
            message=json.dumps({"message": "API Triggered"}),
            content_type="application/json"
        )
        return {"status": "Notification sent"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))