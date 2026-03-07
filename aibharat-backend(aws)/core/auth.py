# core/auth.py
import requests
from jose import jwt, JWTError
from fastapi import Header, HTTPException
from typing import Optional
import json

# Cognito Configuration
COGNITO_REGION = "us-east-1"
COGNITO_USER_POOL_ID = "us-east-1_0d7fqfHCJ"
COGNITO_APP_CLIENT_ID = "4ei1rgdq284ob76pmvr7arau3a"
COGNITO_CLIENT_SECRET = "13t493i0ajt1q9slp00786air6tatq32oh61qa87uikd3d6bc3pp"
COGNITO_ISSUER = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}"

# Cache for JWKS keys
_jwks_cache = None

def get_cognito_public_keys():
    """Fetch Cognito public keys for JWT verification"""
    global _jwks_cache
    if _jwks_cache:
        return _jwks_cache
    
    jwks_url = f"{COGNITO_ISSUER}/.well-known/jwks.json"
    try:
        response = requests.get(jwks_url, timeout=5)
        _jwks_cache = response.json()
        return _jwks_cache
    except Exception as e:
        print(f"[AUTH] Failed to fetch JWKS: {e}")
        return {"keys": []}

def verify_cognito_token(token: str) -> dict:
    """Verify and decode Cognito JWT token"""
    try:
        # Get the key id from the token header
        headers = jwt.get_unverified_header(token)
        kid = headers.get('kid')
        
        if not kid:
            raise ValueError("No kid in token header")
        
        # Get the public key
        jwks = get_cognito_public_keys()
        key = None
        for k in jwks.get('keys', []):
            if k.get('kid') == kid:
                key = k
                break
        
        if not key:
            raise ValueError("Public key not found in JWKS")
        
        # Verify and decode the token
        payload = jwt.decode(
            token,
            key,
            algorithms=['RS256'],
            audience=COGNITO_APP_CLIENT_ID,
            issuer=COGNITO_ISSUER,
            options={
                "verify_signature": True,
                "verify_aud": True,
                "verify_iss": True,
                "verify_exp": True
            }
        )
        
        return payload
    
    except JWTError as e:
        print(f"[AUTH] JWT Error: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        print(f"[AUTH] Token verification failed: {e}")
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")

async def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    """
    Extract and verify user from JWT token.
    Returns the user's Cognito sub (user_id)
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Missing Authorization header"
        )
    
    # Extract token from "Bearer <token>"
    try:
        parts = authorization.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication scheme. Use 'Bearer <token>'"
            )
        token = parts[1]
    except (ValueError, IndexError):
        raise HTTPException(
            status_code=401,
            detail="Invalid Authorization header format. Use 'Bearer <token>'"
        )
    
    # Verify token and extract user_id
    payload = verify_cognito_token(token)
    user_id = payload.get('sub') or payload.get('username')
    
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID not found in token")
    
    return user_id

async def get_current_user_optional(authorization: Optional[str] = Header(None)) -> str:
    """
    Same as get_current_user but returns guest_user instead of raising error if no token
    """
    if not authorization:
        return "guest_user"
    
    try:
        return await get_current_user(authorization)
    except HTTPException:
        return "guest_user"
