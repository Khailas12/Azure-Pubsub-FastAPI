import json
from fastapi import APIRouter, HTTPException
from app.pubsub.pubsub import pubsub_service  # Correct import path

router = APIRouter()

@router.get("/negotiate")
def get_client_url():
    """
    Generates a client access URL for connecting to the Azure Web PubSub service.
    This URL includes a secure token that allows the frontend to establish a WebSocket connection.
    """
    return pubsub_service.get_client_access_url()

@router.post("/trigger-api")
def trigger_api():
    try:
        # Simulate a success scenario
        message = "API Triggered"

        # Send the message with status to all clients
        pubsub_service.send_to_all(json.dumps({"message": message, "status": "success"}))

        return {"status": "success", "message": "Notification sent"}
    except Exception as e:
        import traceback; traceback.print_exc()
        # Send an error message to all clients
        pubsub_service.send_to_all(json.dumps({"message": f"API Triggered: error - {str(e)}", "status": "error"}))
        raise HTTPException(status_code=500, detail=str(e))

# emit to a particular user - what if ther is 4 users? so handle for the dedicated one.