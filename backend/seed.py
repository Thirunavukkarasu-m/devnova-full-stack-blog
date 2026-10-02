import sys
import os
from datetime import datetime, timedelta, timezone

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import engine, Base, SessionLocal
from app.db.base import *
from app.models.user import User, UserRole
from app.models.profile import Profile
from app.models.category import Category
from app.models.tag import Tag
from app.models.blog import Blog, BlogStatus
from app.models.comment import Comment
from app.models.like import BlogLike, CommentLike
from app.models.bookmark import Bookmark
from app.models.follow import Follow
from app.models.notification import Notification
from app.core.security import get_password_hash


def seed_database():
    print("Creating tables in database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.username == "devnova_admin").first():
            print("Database already contains seed data. Skipping.")
            return

        print("Seeding Users and Profiles...")
        # 1. Admin
        admin = User(
            first_name="DevNova",
            last_name="Admin",
            username="devnova_admin",
            email="admin@devnova.io",
            password_hash=get_password_hash("Password@123"),
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
            profile_image="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
        )
        db.add(admin)
        db.flush()
        db.add(Profile(
            user_id=admin.id,
            bio="Lead Platform Architect & Admin at DevNova. Building tools for the global engineering community.",
            website="https://devnova.io",
            github_profile="https://github.com/devnova-official",
            linkedin_profile="https://linkedin.com/company/devnova",
            location="San Francisco, CA"
        ))

        # 2. Author: Alex Rivera
        alex = User(
            first_name="Alex",
            last_name="Rivera",
            username="alex_rivera",
            email="alex.rivera@devnova.io",
            password_hash=get_password_hash("Password@123"),
            role=UserRole.AUTHOR,
            is_active=True,
            is_verified=True,
            profile_image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
        )
        db.add(alex)
        db.flush()
        db.add(Profile(
            user_id=alex.id,
            bio="Staff Backend Engineer specializing in Python, FastAPI, and high-throughput distributed systems.",
            website="https://alexrivera.dev",
            github_profile="https://github.com/alexrivera",
            linkedin_profile="https://linkedin.com/in/alexrivera-tech",
            location="Seattle, WA"
        ))

        # 3. Author: Sophia Chen
        sophia = User(
            first_name="Sophia",
            last_name="Chen",
            username="sophia_chen",
            email="sophia.chen@devnova.io",
            password_hash=get_password_hash("Password@123"),
            role=UserRole.AUTHOR,
            is_active=True,
            is_verified=True,
            profile_image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
        )
        db.add(sophia)
        db.flush()
        db.add(Profile(
            user_id=sophia.id,
            bio="Principal Frontend Architect & Open-Source Contributor. Exploring the bleeding edge of React and Web APIs.",
            website="https://sophiachen.design",
            github_profile="https://github.com/sophiachen",
            linkedin_profile="https://linkedin.com/in/sophia-chen-eng",
            location="New York, NY"
        ))

        # 4. Author: Marcus Vance
        marcus = User(
            first_name="Marcus",
            last_name="Vance",
            username="marcus_vance",
            email="marcus.vance@devnova.io",
            password_hash=get_password_hash("Password@123"),
            role=UserRole.AUTHOR,
            is_active=True,
            is_verified=True,
            profile_image="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
        )
        db.add(marcus)
        db.flush()
        db.add(Profile(
            user_id=marcus.id,
            bio="Data Infrastructure Specialist & PostgreSQL DBA. Tuning databases for extreme throughput and zero latency.",
            website="https://marcusvance.io",
            github_profile="https://github.com/marcusvance",
            linkedin_profile="https://linkedin.com/in/marcus-vance-dba",
            location="Austin, TX"
        ))

        # 5. Regular User: Elena Rostova
        elena = User(
            first_name="Elena",
            last_name="Rostova",
            username="elena_r",
            email="elena.rostova@devnova.io",
            password_hash=get_password_hash("Password@123"),
            role=UserRole.USER,
            is_active=True,
            is_verified=True,
            profile_image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80"
        )
        db.add(elena)
        db.flush()
        db.add(Profile(
            user_id=elena.id,
            bio="Junior Full-Stack Developer learning FastAPI and React. Passionate about AI agents and clean code.",
            location="Boston, MA"
        ))

        # 2. Categories
        print("Seeding Categories...")
        categories_data = [
            ("FastAPI", "fastapi", "High performance, easy to learn, fast to code, ready for production APIs with Python 3.8+.", "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80"),
            ("React", "react", "The library for web and native user interfaces. Build component-driven frontend architectures.", "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80"),
            ("Python", "python", "Modern Python language features, asynchronous programming, profiling, and best practices.", "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80"),
            ("PostgreSQL", "postgresql", "The world's most advanced open-source relational database. Query tuning, indexing, and architecture.", "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80"),
            ("AI & Machine Learning", "ai-machine-learning", "Generative AI, LLM orchestration, vector databases, and real-world intelligent systems.", "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80"),
            ("DevOps & Cloud", "devops-cloud", "CI/CD pipelines, Docker containers, Kubernetes orchestration, and cloud infrastructure.", "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=600&q=80"),
            ("Web Development", "web-development", "Modern frontend and backend standards, security protocols, and responsive UX architectures.", "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=600&q=80"),
            ("Architecture", "architecture", "System design, microservices decomposition, concurrency models, and resilient system engineering.", "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80"),
        ]

        cat_dict = {}
        for name, slug, desc, img in categories_data:
            cat = Category(name=name, slug=slug, description=desc, image=img)
            db.add(cat)
            db.flush()
            cat_dict[slug] = cat

        # 3. Tags
        print("Seeding Tags...")
        tag_names = ["fastapi", "python", "react", "postgresql", "docker", "devops", "ai", "architecture", "jwt", "sql", "performance", "systemdesign"]
        tag_dict = {}
        for tname in tag_names:
            tag = Tag(name=tname, slug=tname)
            db.add(tag)
            db.flush()
            tag_dict[tname] = tag

        # 4. Blogs
        print("Seeding Technical Blogs...")
        now = datetime.now(timezone.utc)

        blogs_data = [
            {
                "author": alex,
                "category": cat_dict["fastapi"],
                "tags": [tag_dict["fastapi"], tag_dict["python"], tag_dict["jwt"]],
                "title": "Architecting Production-Ready REST APIs with FastAPI and Pydantic V2",
                "slug": "architecting-production-ready-rest-apis-with-fastapi-and-pydantic-v2",
                "excerpt": "A comprehensive deep dive into building enterprise-grade, asynchronous REST APIs with FastAPI, Pydantic V2 schemas, dependency injection, and secure JWT authentication.",
                "cover_image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
                "content": """## Introduction

FastAPI has emerged as the premier framework for building modern Python APIs. Coupled with the Rust-powered core of **Pydantic V2**, it delivers remarkable request validation throughput alongside an ergonomic developer experience.

In this guide, we examine how to structure enterprise-grade APIs designed for long-term scalability and strict maintainability.

### 1. Project Directory Decoupling

A clean separation of concerns ensures your API remains testable and decoupled from underlying persistence layers:

```
app/
├── core/         # Settings, security, token encoding
├── db/           # Session management & connection pooling
├── models/       # SQLAlchemy relational entities
├── schemas/      # Pydantic input & output validation
├── routers/      # HTTP request routing & status codes
└── services/     # Business logic & external integrations
```

### 2. Pydantic V2 Serialization Mastery

Pydantic V2 introduces a 5x to 15x performance increase over V1. Always configure your response models with `from_attributes = True` to enable seamless ORM serialization:

```python
from pydantic import BaseModel, Field, EmailStr

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    is_active: bool

    class Config:
        from_attributes = True
```

### 3. Asynchronous Concurrency and Connection Pooling

When interacting with relational databases like PostgreSQL, leverage connection pooling to prevent exhaustion under heavy concurrency:

- Set pool size between 10 and 20 connections per worker.
- Use `max_overflow` for burst traffic handling.
- Always utilize context managers or FastAPI's dependency system (`yield db`) to guarantee connections return to the pool immediately upon request completion.

### Conclusion

By adhering to strict schema separation and decoupled architecture, your FastAPI application is equipped to scale seamlessly to millions of requests per day.
""",
                "status": BlogStatus.PUBLISHED,
                "reading_time": 6,
                "views": 3420,
                "published_at": now - timedelta(days=5),
            },
            {
                "author": sophia,
                "category": cat_dict["react"],
                "tags": [tag_dict["react"], tag_dict["performance"]],
                "title": "Building Scalable Real-Time React Applications with Modern Hooks and Context",
                "slug": "building-scalable-real-time-react-applications-with-modern-hooks-and-context",
                "excerpt": "Discover how to eliminate redundant re-renders, structure scalable global state with React Context, and build responsive, accessible web interfaces.",
                "cover_image": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
                "content": """## The Modern React Landscape

State management in React has evolved significantly. While external libraries like Redux and Zustand have their place, modern React provides robust primitives for managing client state cleanly and efficiently.

### 1. Selective Context Splitting

The most common performance pitfall with React Context is storing rapidly updating state alongside static configuration. Always split state and dispatch into separate contexts:

```javascript
const AuthStateContext = createContext(null);
const AuthDispatchContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <AuthStateContext.Provider value={user}>
      <AuthDispatchContext.Provider value={setUser}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
}
```

This prevents components that only need to trigger actions from re-rendering whenever user state changes.

### 2. Centralized Axios Interceptors

Ensure your HTTP requests are handled uniformly across your application with robust Axios interceptors:

- Automatically attach Bearer tokens.
- Intercept 401 Unauthorized responses to trigger seamless token refreshes.
- Transform backend validation errors into actionable user notifications.

### Summary

Simplicity and composability are the hallmarks of great React engineering. Master the native primitives before reaching for heavy third-party abstractions.
""",
                "status": BlogStatus.PUBLISHED,
                "reading_time": 5,
                "views": 2840,
                "published_at": now - timedelta(days=4),
            },
            {
                "author": marcus,
                "category": cat_dict["postgresql"],
                "tags": [tag_dict["postgresql"], tag_dict["sql"], tag_dict["performance"]],
                "title": "PostgreSQL Indexing Deep-Dive: B-Tree, GIN, and Partial Indexes for Microsecond Queries",
                "slug": "postgresql-indexing-deep-dive-b-tree-gin-and-partial-indexes",
                "excerpt": "Explore internal PostgreSQL indexing mechanisms. Learn how to write composite, expression, and partial indexes that turn slow table scans into sub-millisecond lookups.",
                "cover_image": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80",
                "content": """## Why Indexes Matter at Scale

When tables grow past tens of thousands of rows, sequential scans will saturate disk I/O and degrade database responsiveness. Understanding how the PostgreSQL query planner evaluates indexes is critical for any backend developer.

### 1. B-Tree Indexes and Composite Column Ordering

B-Tree is the default index type in PostgreSQL, ideal for equality and range queries (`=`, `<`, `<=`, `>`, `>=`, `BETWEEN`).

When creating a composite index:
```sql
CREATE INDEX idx_blogs_author_status_created 
ON blogs (author_id, status, created_at DESC);
```

Always put high-cardinality equality columns first (`author_id`), followed by low-cardinality filter columns (`status`), and range/sorting columns last (`created_at DESC`).

### 2. Partial Indexes: Saving Disk and Memory

Why index rows that are never queried? If 90% of your blogs are published and your admin dashboard frequently queries drafts:

```sql
CREATE INDEX idx_blogs_drafts_author 
ON blogs (author_id) 
WHERE status = 'DRAFT';
```

This partial index takes up a tiny fraction of RAM and delivers blazing fast lookups without bloating memory.

### Key Takeaway

Always run `EXPLAIN (ANALYZE, BUFFERS)` before and after creating indexes to verify that PostgreSQL chooses Index Scans over expensive Sequential Scans.
""",
                "status": BlogStatus.PUBLISHED,
                "reading_time": 7,
                "views": 4120,
                "published_at": now - timedelta(days=3),
            },
            {
                "author": alex,
                "category": cat_dict["ai-machine-learning"],
                "tags": [tag_dict["ai"], tag_dict["python"], tag_dict["architecture"]],
                "title": "Autonomous AI Agents in Python: Building Resilient Tool Calling Systems",
                "slug": "autonomous-ai-agents-in-python-building-resilient-tool-calling-systems",
                "excerpt": "How to design production-ready AI agents with Python, structured function calling, schema validation, and defensive execution sandboxes.",
                "cover_image": "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80",
                "content": """## The Rise of Agentic Workflows

Large language models are transforming from text generators into autonomous agents capable of interacting with external APIs, databases, and operating systems.

### Core Architectural Pillars

1. **Structured Outputs**: Using JSON schemas to constrain model outputs.
2. **Deterministic Tool Dispatching**: Mapping model decisions safely to Python callables.
3. **Execution Sandboxing**: Isolating destructive operations and enforcing security boundaries.

### Designing Safe Tools with Pydantic

Wrap every agent tool with strict type annotations:

```python
from pydantic import BaseModel, Field

class SearchQuery(BaseModel):
    query: str = Field(..., description="The technical term to look up")
    limit: int = Field(5, le=20, description="Maximum results to return")
```

This ensures the agent cannot pass malformed parameters into internal application services.
""",
                "status": BlogStatus.PUBLISHED,
                "reading_time": 8,
                "views": 5190,
                "published_at": now - timedelta(days=2),
            },
            {
                "author": sophia,
                "category": cat_dict["devops-cloud"],
                "tags": [tag_dict["docker"], tag_dict["devops"]],
                "title": "Zero-Downtime Deployment Strategies with Docker, Kubernetes, and GitHub Actions",
                "slug": "zero-downtime-deployment-strategies-with-docker-kubernetes-and-github-actions",
                "excerpt": "A step-by-step blueprint for setting up CI/CD pipelines, multi-stage Docker container builds, rolling updates, and health-check probes.",
                "cover_image": "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1200&q=80",
                "content": """## Continuous Delivery for Mission-Critical Systems

Modern technology companies cannot afford maintenance windows. Deployments must happen seamlessly in the background while users interact with live services.

### 1. Optimized Multi-Stage Docker Builds

Keep your final runtime container lightweight and secure:

```dockerfile
# Build Stage
FROM python:3.11-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Final Runtime
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY app ./app
ENV PATH=/root/.local/bin:$PATH
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. Readiness and Liveness Probes

Configure Kubernetes to verify that your FastAPI application is initialized before routing production traffic:

```yaml
readinessProbe:
  httpGet:
    path: /api/health
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 10
```

Deploy with confidence knowing users will never encounter connection drops during rollouts!
""",
                "status": BlogStatus.PUBLISHED,
                "reading_time": 6,
                "views": 1950,
                "published_at": now - timedelta(days=1),
            },
            {
                "author": marcus,
                "category": cat_dict["architecture"],
                "tags": [tag_dict["architecture"], tag_dict["systemdesign"]],
                "title": "From Monolith to Modular Microservices: Lessons from Scaling to 10M Daily Requests",
                "slug": "from-monolith-to-modular-microservices-lessons-from-scaling",
                "excerpt": "Real-world trade-offs in distributed systems. When to decompose your monolith, how to manage database boundaries, and avoiding distributed transactions.",
                "cover_image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
                "content": """## The Reality of Distributed Architectures

Microservices promise independent deployability and team autonomy, but introduce network latency, eventual consistency, and operational complexity.

### Before You Split: The Modular Monolith

Start by strictly defining domain boundaries within a single codebase:
- Isolate domain models into bounded contexts.
- Forbid cross-module database foreign keys.
- Communicate across domains through clean interfaces rather than direct internal state mutations.

When traffic scales, extracting a well-defined domain into a standalone microservice becomes straightforward and risk-free.
""",
                "status": BlogStatus.PUBLISHED,
                "reading_time": 9,
                "views": 3720,
                "published_at": now - timedelta(hours=8),
            },
        ]

        created_blogs = []
        for b_data in blogs_data:
            b = Blog(
                author_id=b_data["author"].id,
                category_id=b_data["category"].id,
                title=b_data["title"],
                slug=b_data["slug"],
                excerpt=b_data["excerpt"],
                content=b_data["content"],
                cover_image=b_data["cover_image"],
                status=b_data["status"],
                reading_time=b_data["reading_time"],
                views=b_data["views"],
                published_at=b_data["published_at"],
            )
            b.tags = b_data["tags"]
            db.add(b)
            db.flush()
            created_blogs.append(b)

        # 5. Follows
        print("Seeding Follows...")
        db.add(Follow(follower_id=elena.id, following_id=alex.id))
        db.add(Follow(follower_id=elena.id, following_id=sophia.id))
        db.add(Follow(follower_id=sophia.id, following_id=marcus.id))
        db.add(Follow(follower_id=alex.id, following_id=sophia.id))

        # 6. Likes & Bookmarks
        print("Seeding Likes and Bookmarks...")
        for b in created_blogs:
            db.add(BlogLike(blog_id=b.id, user_id=elena.id))
            db.add(BlogLike(blog_id=b.id, user_id=admin.id))
            if b.author_id != sophia.id:
                db.add(BlogLike(blog_id=b.id, user_id=sophia.id))

        db.add(Bookmark(blog_id=created_blogs[0].id, user_id=elena.id))
        db.add(Bookmark(blog_id=created_blogs[1].id, user_id=elena.id))
        db.add(Bookmark(blog_id=created_blogs[2].id, user_id=sophia.id))

        # 7. Comments
        print("Seeding Comments & Discussions...")
        c1 = Comment(
            blog_id=created_blogs[0].id,
            user_id=elena.id,
            content="This is by far the most thorough explanation of Pydantic V2 ORM mode I have read. Thank you!",
        )
        db.add(c1)
        db.flush()

        c1_reply = Comment(
            blog_id=created_blogs[0].id,
            user_id=alex.id,
            parent_id=c1.id,
            content="Glad you found it helpful Elena! Pydantic V2's performance jump really transforms FastAPI workloads.",
        )
        db.add(c1_reply)
        db.flush()

        c2 = Comment(
            blog_id=created_blogs[2].id,
            user_id=alex.id,
            content="Partial indexing saved our production database when table size hit 50GB. Excellent write-up Marcus.",
        )
        db.add(c2)
        db.flush()

        db.add(CommentLike(comment_id=c1.id, user_id=alex.id))
        db.add(CommentLike(comment_id=c2.id, user_id=marcus.id))

        # 8. Notifications
        print("Seeding Notifications...")
        db.add(Notification(
            user_id=alex.id,
            actor_id=elena.id,
            blog_id=created_blogs[0].id,
            type="like",
            message=f"@{elena.username} liked your article '{created_blogs[0].title}'",
            is_read=False,
        ))
        db.add(Notification(
            user_id=alex.id,
            actor_id=elena.id,
            blog_id=created_blogs[0].id,
            type="comment",
            message=f"@{elena.username} commented on your article '{created_blogs[0].title}'",
            is_read=False,
        ))
        db.add(Notification(
            user_id=alex.id,
            actor_id=elena.id,
            type="follow",
            message=f"@{elena.username} started following you.",
            is_read=True,
        ))

        db.commit()
        print("Database seeded successfully with rich, realistic tech content!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
