"""Server endpoints for database interactions."""

import flask
import logging
import json

import models
from models import db

blueprint = flask.Blueprint('api', __name__, url_prefix='/api')


@blueprint.route('/create_user/<email>')
def create_user(email):
    if not email:
        raise ValueError('Cannot create a user without an email')

    user = models.User.query.filter_by(email=email).first()
    created = False

    if not user:
        # There is no information for this user, create a row for them
        user = models.User(email=email)
        db.session.add(user)
        db.session.commit()

        created = True

    result = {'created': created, 'user': user}
    return json.dumps(result, cls=models.ModelEncoder)
