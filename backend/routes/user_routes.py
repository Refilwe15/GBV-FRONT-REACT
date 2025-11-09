from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from utils import verify_password, create_access_token, hash_password
import models, schemas
from schemas import UserLogin, Token
from typing import List
from fastapi.security import OAuth2PasswordBearer
from dependancies import get_current_user,verify_admin_user  # fetch user from token


router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# -------------------
# Existing Routes
# -------------------
@router.post("/register")
async def register_user(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).filter(models.User.email == user.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        full_name=user.full_name,
        email=user.email,
        password=hash_password(user.password)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return {"message": "User registered successfully", "user": {"email": new_user.email}}


@router.post("/login", response_model=Token)
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).filter(models.User.email == user.email))
    db_user = result.scalars().first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": db_user.email})
    return {"access_token": token, "token_type": "bearer", "user_type": db_user.type,"email":db_user.email}


# -------------------
# Admin Extra Routes
# -------------------

# Get all active users (admin only)
@router.get("/active", response_model=List[schemas.UserOut])
async def get_active_users(
    db: AsyncSession = Depends(get_db),

):
   

    result = await db.execute(select(models.User))
    users = result.scalars().all()
    return users


# Update user by ID (admin only)
@router.put("/users/{user_id}", response_model=schemas.UserOut)
async def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: AsyncSession = Depends(get_db),
  
):


    result = await db.execute(select(models.User).filter(models.User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_update.full_name:
        user.full_name = user_update.full_name
    if user_update.email:
        user.email = user_update.email
    if user_update.type:
        user.type = user_update.type
 


    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


# Delete user by ID (admin only)
@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not verify_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")

    result = await db.execute(select(models.User).filter(models.User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(user)
    await db.commit()
    return
