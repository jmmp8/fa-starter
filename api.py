"""Server endpoints for database interactions."""

import flask
import logging
import json
from datetime import datetime

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


@blueprint.route(
    '/create_poem/<user_email>/<poem_name>/<poem_text>/<int:generated>')
def create_poem(user_email, poem_name, poem_text, generated):
    generated = bool(generated)

    # check that the user exists
    user = models.User.query.filter_by(email=user_email).first()
    if not user:
        raise ValueError(f'Failed to find a user with email: {user_email}')

    poem = models.Poem(user_id=user.id,
                       creation_timestamp=datetime.now(),
                       generated=generated,
                       name=poem_name,
                       text=poem_text)
    db.session.add(poem)
    db.session.commit()

    result = {'created': True, 'poem': poem}
    return json.dumps(result, cls=models.ModelEncoder)
