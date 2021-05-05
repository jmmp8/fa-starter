"""Contains python classes that model database objects"""
import json


class BaseModel:
    def __init__(self, id):
        self.id = id


class User(BaseModel):
    """Models a row of the user table"""
    def __init__(self, id, email):
        """Models a row from the user table.

        Args:
            id (int): table primary key
            email (string): the user's email address
        """
        super().__init__(id)

        self.email = email


class ModelEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, BaseModel):
            return o.__dict__

        return super().default(o)
