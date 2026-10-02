from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class TimeSeriesPoint(BaseModel):
    date: str
    count: int


class TopArticle(BaseModel):
    id: int
    title: str
    slug: str
    views: int
    likes_count: int
    comments_count: int


class TopCategory(BaseModel):
    id: int
    name: str
    blogs_count: int


class AuthorAnalyticsResponse(BaseModel):
    total_blogs: int
    published_blogs: int
    draft_blogs: int
    total_views: int
    total_likes: int
    total_comments: int
    followers_count: int
    following_count: int
    views_over_time: List[TimeSeriesPoint]
    likes_over_time: List[TimeSeriesPoint]
    top_articles: List[TopArticle]


class AdminAnalyticsResponse(BaseModel):
    total_users: int
    total_authors: int
    total_admins: int
    total_blogs: int
    published_blogs: int
    draft_blogs: int
    total_comments: int
    total_reports: int
    pending_reports: int
    total_views: int
    total_likes: int
    user_growth: List[TimeSeriesPoint]
    views_trend: List[TimeSeriesPoint]
    top_categories: List[TopCategory]
    top_articles: List[TopArticle]
