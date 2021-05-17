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


@blueprint.route('/create_poem', methods=['POST'])
def create_poem():
    body = flask.request.get_json()
    user_email = body['userEmail']
    poem_name = body['poemName']
    poem_text = body['poemText']
    generated = body['generated']

    # Check that the user exists
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


@blueprint.route('/get_poems/<any(best, new):poem_type>/<int:num_poems>',
                 defaults={'user_email': None})
@blueprint.route(
    '/get_poems/<any(manual, liked, generated):poem_type>/<int:num_poems>/<user_email>'
)
def get_poems(poem_type, num_poems, user_email):
    """Retreives poems

    Args:
        poem_type (string): one of best, new, manual, or generated
            best: returns poem with the highest likes - dislikes
            new: returns poems with the most recent creation timestamp
            manual: returns poems that the user manually wrote
            liked: returns poems the user has liked
            generated: returns poems that the user generated
        num_poems (int): the number of poems to retrieve. 0 returns all poems
        user_email (string): The email of the user to retrieve poems for.
            Ignored for poem types best and new.

    Returns:
        string: json string for a dictionary with keys for.
            type (string): the type the user queried for with poem_type
            poems (list): a list of poems retrieved form the database.
                Each poem is a dictionary:
                {
                    id: int,
                    user_id: int,
                    creation_timestamp: datetime|null,
                    modified_timestamp: datetime|null,
                    privacy_level: enum(Public, Private),
                    archived: boolean,
                    form: enum(Haiku, Sonent, Tonka)|null,
                    generated: boolean,
                    name: string,
                    text: string,
                    num_likes: number,
                    num_dislikes: number,
                }
                Poems are ordered by most recently modified then created
    """

    # Check that the user exists if the poem type requires a user
    user = None
    if user_email:
        user = models.User.query.filter_by(email=user_email).first()
        if not user:
            raise ValueError(f'Failed to find a user with email: {user_email}')

    # Query the database based on the poem type
    if poem_type == 'best':
        raise NotImplementedError(
            'Retrieving best poems has not yet been implemented')

    elif poem_type == 'new':
        raise NotImplementedError(
            'Retrieving newest poems has not yet been implemented')

    elif poem_type == 'manual':
        query = models.Poem.query.filter_by(
            user_id=user.id, generated=False).order_by(
                models.Poem.modified_timestamp.desc(),
                models.Poem.creation_timestamp.desc(),
            )
        if num_poems > 0:
            query = query.limit(num_poems)
        poems = query.all()

    elif poem_type == 'liked':
        raise NotImplementedError(
            'Retrieving liked poems has not yet been implemented')

    elif poem_type == 'generated':
        raise NotImplementedError(
            'Retrieving generated poems has not yet been implemented')

    else:
        raise ValueError(
            'Poem type must be one of best, new, manual, or generated')

    result = {'type': poem_type, 'poems': poems}
    return json.dumps(result, cls=models.ModelEncoder)
