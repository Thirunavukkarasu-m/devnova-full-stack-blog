import httpx
from typing import Dict, Any, Optional
from app.core.config import settings


class OAuthService:
    GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
    GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

    GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
    GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
    GITHUB_USER_URL = "https://api.github.com/user"
    GITHUB_EMAILS_URL = "https://api.github.com/user/emails"

    @classmethod
    def get_google_auth_url(cls, redirect_uri: str, state: str = "state") -> str:
        return (
            f"{cls.GOOGLE_AUTH_URL}?"
            f"client_id={settings.GOOGLE_CLIENT_ID}&"
            f"redirect_uri={redirect_uri}&"
            f"response_type=code&"
            f"scope=openid%20email%20profile&"
            f"state={state}&"
            f"access_type=offline"
        )

    @classmethod
    def get_github_auth_url(cls, redirect_uri: str, state: str = "state") -> str:
        return (
            f"{cls.GITHUB_AUTH_URL}?"
            f"client_id={settings.GITHUB_CLIENT_ID}&"
            f"redirect_uri={redirect_uri}&"
            f"scope=user:email&"
            f"state={state}"
        )

    @classmethod
    async def exchange_google_code(cls, code: str, redirect_uri: str) -> Optional[Dict[str, Any]]:
        if settings.GOOGLE_CLIENT_ID == "xxxx" or settings.GOOGLE_CLIENT_SECRET == "xxxx":
            # Simulation for development when keys are placeholders
            return {
                "sub": "google-demo-123456789",
                "email": "google.developer@example.com",
                "given_name": "Google",
                "family_name": "Developer",
                "picture": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
                "name": "Google Developer",
            }
        
        async with httpx.AsyncClient() as client:
            token_resp = await client.post(
                cls.GOOGLE_TOKEN_URL,
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code",
                },
            )
            if token_resp.status_code != 200:
                return None
            token_data = token_resp.json()
            access_token = token_data.get("access_token")

            user_resp = await client.get(
                cls.GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if user_resp.status_code != 200:
                return None
            return user_resp.json()

    @classmethod
    async def exchange_github_code(cls, code: str, redirect_uri: str) -> Optional[Dict[str, Any]]:
        if settings.GITHUB_CLIENT_ID == "xxxx" or settings.GITHUB_CLIENT_SECRET == "xxxx":
            # Simulation for development when keys are placeholders
            return {
                "id": "github-demo-987654321",
                "login": "github_developer",
                "email": "github.developer@example.com",
                "name": "GitHub Developer",
                "avatar_url": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80",
                "bio": "Full-stack developer building on DevNova",
            }

        async with httpx.AsyncClient() as client:
            token_resp = await client.post(
                cls.GITHUB_TOKEN_URL,
                headers={"Accept": "application/json"},
                data={
                    "code": code,
                    "client_id": settings.GITHUB_CLIENT_ID,
                    "client_secret": settings.GITHUB_CLIENT_SECRET,
                    "redirect_uri": redirect_uri,
                },
            )
            if token_resp.status_code != 200:
                return None
            token_data = token_resp.json()
            access_token = token_data.get("access_token")
            if not access_token:
                return None

            user_resp = await client.get(
                cls.GITHUB_USER_URL,
                headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"},
            )
            if user_resp.status_code != 200:
                return None
            user_data = user_resp.json()

            # If user has private email on GitHub, fetch emails endpoint
            if not user_data.get("email"):
                emails_resp = await client.get(
                    cls.GITHUB_EMAILS_URL,
                    headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"},
                )
                if emails_resp.status_code == 200:
                    emails = emails_resp.json()
                    primary_email = next((e["email"] for e in emails if e.get("primary")), None)
                    user_data["email"] = primary_email or (emails[0]["email"] if emails else f"{user_data['login']}@users.noreply.github.com")

            return user_data
