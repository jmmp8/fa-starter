"""Contains base class for SQLAlchemy models objects and custom JSON encoder"""

import json
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class BaseModel(db.Model):
    __abstract__ = True

    id = db.Column(db.Integer, primary_key=True, nullable=False)

    def as_dict(self):
        return {
            col.name: getattr(self, col.name)
            for col in self.__table__.columns
        }


class ModelEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, BaseModel):
            return o.as_dict()
        return super().default(o)
