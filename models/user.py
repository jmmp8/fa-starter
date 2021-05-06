from .base import db, BaseModel


class User(BaseModel):
    """Models a row of the user table"""
    email = db.Column(db.String(45), nullable=False, unique=True)
