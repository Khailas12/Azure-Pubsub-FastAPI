import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.services.pubsub import pubsub_service  
from app.schemas.user import UserCreate, UserLogin, Token, TriggerApiRequest
from app.services.user import get_user_by_username, create_user, verify_password
from app.core.auth import create_access_token, get_current_user, invalidate_token
from fastapi.security import OAuth2PasswordRequestForm
from app.core.dependency import get_db

router = APIRouter()

@router.get("/negotiate/{user_id}", dependencies=[Depends(get_current_user)])
def get_client_url(user_id: str):
    """
    Generates a client access URL for connecting to Azure Web PubSub service.
    Requires authentication.
    """
    return pubsub_service.get_client_access_url(user_id=user_id)


@router.post("/trigger-api")
def trigger_api(request: TriggerApiRequest, current_user: str = Depends(get_current_user)):
    """
    Sends a real-time message to the specific user based on their connection ID and user ID.
    Requires authentication.
    """
    try:
        message = "API Triggered"
        print(f"Sending message to user: {request.user_id}")  # Debugging
        pubsub_service.send_to_user(
            connection_id=request.connection_id,
            user_id=request.user_id,
            message=json.dumps({"message": message, "status": "success"})
        )
        return {"status": "success", "message": "Notification sent"}
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    create_user(db, user)
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "user_id": user.id}

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_username(db, username=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "user_id": user.id}  

@router.post("/logout")
def logout(current_user: str = Depends(get_current_user)):
    return {"message": "Logged out successfully"}

@router.get("/validate-token")
def validate_token(current_user: str = Depends(get_current_user)):
    return {"message": "Token is valid"}

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

# @router.post("/trigger-api")
# def trigger_api(request: TriggerApiRequest, current_user: str = Depends(get_current_user)):
#     try:
#         # Simulate a success scenario
#         message = "API Triggered"

#         # Send the message with status to all clients
#         pubsub_service.send_to_all(json.dumps({"message": message, "status": "success"}))

#         return {"status": "success", "message": "Notification sent"}
#     except Exception as e:
#         import traceback; traceback.print_exc()
#         # Send an error message to all clients
#         pubsub_service.send_to_all(json.dumps({"message": f"API Triggered: error - {str(e)}", "status": "error"}))
#         raise HTTPException(status_code=500, detail=str(e))