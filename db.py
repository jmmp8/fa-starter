"""Server endpoints for database interactions."""

import flask
import logging
import pymysql

import db_cred

blueprint = flask.Blueprint('db', __name__, url_prefix='/db')


def connect():
    """Opens and returns a connection to the CloudSQL database"""
    conn = None

    try:
        conn = pymysql.connect(
            host=db_cred.DB_IP,
            user=db_cred.DB_USER,
            password=db_cred.DB_PASSWORD,
            db=db_cred.DB_NAME,
            cursorclass=pymysql.cursors.DictCursor,
        )
    except pymysql.MySQLError as e:
        logging.exception('Error while attempting database connection: %s', e)
        raise e

    return conn


@blueprint.route('/test')
def test():
    conn = connect()
    with conn.cursor() as cursor:
        result = cursor.execute('select * from users')
        users = cursor.fetchall()
        if result > 0:
            return flask.jsonify(users)
    return 'pong!'
