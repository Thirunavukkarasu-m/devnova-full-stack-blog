import re
import math
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.blog import Blog, BlogStatus
from app.models.tag import Tag


class BlogService:
    @staticmethod
    def calculate_reading_time(content: str) -> int:
        if not content:
            return 1
        # Strip HTML/markdown tags
        clean_text = re.sub(r"<[^>]+>", " ", content)
        words = clean_text.strip().split()
        word_count = len(words)
        minutes = math.ceil(word_count / 200)
        return max(1, minutes)

    @staticmethod
    def generate_slug(db: Session, title: str, blog_id: Optional[int] = None) -> str:
        # Convert to lowercase and replace non-alphanumeric chars with hyphen
        base_slug = re.sub(r"[^\w\s-]", "", title.lower()).strip()
        base_slug = re.sub(r"[-\s]+", "-", base_slug)
        if not base_slug:
            base_slug = "post"

        slug = base_slug
        counter = 1
        while True:
            query = db.query(Blog).filter(Blog.slug == slug)
            if blog_id:
                query = query.filter(Blog.id != blog_id)
            existing = query.first()
            if not existing:
                break
            slug = f"{base_slug}-{counter}"
            counter += 1

        return slug

    @staticmethod
    def sync_tags(db: Session, tag_names: List[str]) -> List[Tag]:
        tags = []
        for name in tag_names:
            clean_name = name.strip().lstrip("#").strip()
            if not clean_name:
                continue
            slug = re.sub(r"[^\w\s-]", "", clean_name.lower()).strip()
            slug = re.sub(r"[-\s]+", "-", slug)

            tag = db.query(Tag).filter(Tag.slug == slug).first()
            if not tag:
                tag = Tag(name=clean_name, slug=slug)
                db.add(tag)
                db.flush()
            tags.append(tag)
        return tags
