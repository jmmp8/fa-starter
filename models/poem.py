from enum import Enum

from .base import db, BaseModel


class PoemPrivacyLevel(Enum):
    PUBLIC = "public"
    PRIVATE = "private"


class PoemForm(Enum):
    HAIKU = "haiku"
    SONNET = "sonnet"
    TONKA = "tonka"


class Poem(BaseModel):
    """Models a row of the poem table"""
    user_id = db.Column(db.Integer, nullable=False)
    creation_timestamp = db.Column(db.DateTime, nullable=False)
    modified_timestamp = db.Column(db.DateTime)
    privacy_level = db.Column(db.Enum(PoemPrivacyLevel),
                              nullable=False,
                              default=PoemPrivacyLevel.PUBLIC.value)
    archived = db.Column(db.Boolean, nullable=False, default=False)
    form = db.Column(db.Enum(PoemForm))
    generated = db.Column(db.Boolean, nullable=False, default=False)
    name = db.Column(db.String(45), nullable=False)
    text = db.Column(db.String(8000), nullable=False)
    num_likes = db.Column(db.Integer, nullable=False, default=0)
    num_dislikes = db.Column(db.Integer, nullable=False, default=0)
