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

@router.post("/notify-user/{user_id}")
def notify_user(user_id: str):
    """
    Send a notification to a specific user.
    """
    try:
        message = "Personalized Notification"
        pubsub_service.send_to_user(user_id, json.dumps({"message": message, "status": "success"}))
        return {"status": "success", "message": "Notification sent to user"}
    except Exception as e:
        import traceback; traceback.print_exc()
        pubsub_service.send_to_all(json.dumps({"message": f"Error sending notification to user {user_id}: {str(e)}", "status": "error"}))
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/user-connected/{user_id}/{connection_id}")
def user_connected(user_id: str, connection_id: str):
    """
    Endpoint to register a user connection.
    """
    pubsub_service.user_connected(user_id, connection_id)
    return {"status": "success", "message": f"User {user_id} connected with ID {connection_id}"}

@router.post("/user-disconnected/{user_id}")
def user_disconnected(user_id: str):
    """
    Endpoint to unregister a user connection.
    """
    pubsub_service.user_disconnected(user_id)
    return {"status": "success", "message": f"User {user_id} disconnected"}

# emit to a particular user - what if ther is 4 users? so handle for the dedicated one.