import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_get_categories():
    response = client.get("/api/categories")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert any(c["slug"] == "fastapi" for c in data)


def test_get_tags():
    response = client.get("/api/tags")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any(t["name"] == "fastapi" for t in data)


def test_list_blogs():
    response = client.get("/api/blogs")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "meta" in data
    assert len(data["items"]) > 0


def test_filter_blogs_by_category():
    response = client.get("/api/blogs?category=fastapi")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) > 0
    assert data["items"][0]["category"]["slug"] == "fastapi"


def test_search_blogs():
    response = client.get("/api/blogs?search=Pydantic")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) > 0
    assert "Pydantic" in data["items"][0]["title"] or "Pydantic" in data["items"][0]["content"]


def test_user_registration_and_login():
    import uuid
    unique_user = f"tester_{uuid.uuid4().hex[:6]}"
    email = f"{unique_user}@example.com"

    # Register
    reg_payload = {
        "first_name": "Test",
        "last_name": "Developer",
        "username": unique_user,
        "email": email,
        "password": "SecurePassword123!",
        "confirm_password": "SecurePassword123!",
        "bio": "Software test account"
    }
    reg_resp = client.post("/api/auth/register", json=reg_payload)
    assert reg_resp.status_code == 201
    reg_data = reg_resp.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["username"] == unique_user

    # Login
    login_payload = {
        "username_or_email": unique_user,
        "password": "SecurePassword123!"
    }
    login_resp = client.post("/api/auth/login", json=login_payload)
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert "access_token" in login_data
    token = login_data["access_token"]

    # Verify /me endpoint
    me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == email


def test_admin_login_and_access():
    login_resp = client.post("/api/auth/login", json={
        "username_or_email": "devnova_admin",
        "password": "Password@123"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Access admin analytics
    admin_resp = client.get("/api/admin/analytics", headers=headers)
    assert admin_resp.status_code == 200
    admin_data = admin_resp.json()
    assert "total_users" in admin_data
    assert "total_blogs" in admin_data


def test_blog_crud_and_engagement():
    # Login as author Alex
    login_resp = client.post("/api/auth/login", json={
        "username_or_email": "alex_rivera",
        "password": "Password@123"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create Blog
    blog_payload = {
        "title": "Comprehensive Unit Testing in FastAPI Applications",
        "content": "Writing robust automated test suites with Pytest and HTTPX ensures zero regressions across modern microservices and production web APIs.",
        "excerpt": "A guide to comprehensive unit testing in FastAPI.",
        "category_id": 1,
        "tags": ["fastapi", "python"],
        "status": "PUBLISHED"
    }
    create_resp = client.post("/api/blogs", json=blog_payload, headers=headers)
    assert create_resp.status_code == 201
    created_blog = create_resp.json()
    blog_id = created_blog["id"]
    blog_slug = created_blog["slug"]

    # 2. Get Blog Detail
    get_resp = client.get(f"/api/blogs/{blog_slug}")
    assert get_resp.status_code == 200
    assert get_resp.json()["title"] == blog_payload["title"]

    # 3. Like Blog
    like_resp = client.post(f"/api/blogs/{blog_id}/like", headers=headers)
    assert like_resp.status_code == 200
    assert "is_liked" in like_resp.json()

    # 4. Bookmark Blog
    bm_resp = client.post(f"/api/blogs/{blog_id}/bookmark", headers=headers)
    assert bm_resp.status_code == 200
    assert "is_bookmarked" in bm_resp.json()

    # 5. Comment on Blog
    comment_payload = {"content": "Great automated test breakdown!"}
    comm_resp = client.post(f"/api/comments/blog/{blog_id}", json=comment_payload, headers=headers)
    assert comm_resp.status_code == 201
    assert comm_resp.json()["content"] == comment_payload["content"]

    # 6. Update Blog
    update_payload = {"title": "Comprehensive Unit Testing in FastAPI (Updated Edition)"}
    update_resp = client.put(f"/api/blogs/{blog_id}", json=update_payload, headers=headers)
    assert update_resp.status_code == 200
    assert update_resp.json()["title"] == update_payload["title"]

    # 7. Delete Blog
    del_resp = client.delete(f"/api/blogs/{blog_id}", headers=headers)
    assert del_resp.status_code == 200

    # Verify deleted
    verify_resp = client.get(f"/api/blogs/{blog_id}")
    assert verify_resp.status_code == 404
