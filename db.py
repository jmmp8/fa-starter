"""Server endpoints for database interactions."""

import flask
import logging
import pymysql
import json

import db_cred
import models

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


def execute_sql(sql, model=None, num_rows=None):
    """Executes a SQL query and returns the results

    This function is specifically for retrieving data.
    Modifications will not be commited.

    Args:
        sql (str): SQL query to run
        model (type, optional): If supplied, attempts to
        num_rows (int, optional): The number of rows to query for.
          Defaults to None, which will fetch all rows.

    Returns:
        List[Dict]: List of dictionaries representing the results
          returned by the query
    """
    conn = connect()
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql)
            if num_rows is not None:
                results = cursor.fetchmany(num_rows)
            else:
                results = cursor.fetchall()

            # If a model was provided, try to convert
            # each result into the model's type
            if model:
                results = [model(**r) for r in results]

            return results

    except TypeError as te:
        logging.error('Model failed to convert: %s', te)
        return []
    finally:
        conn.close()


def modify_sql(sql):
    """Executes a SQL query and returns the number of modified rows

    This function is specifically for modifying data, not for retrieving data.

    Args:
        sql (str): SQL query to run

    Returns:
        int: the number of rows modified
    """
    conn = connect()
    try:
        with conn.cursor() as cursor:
            return cursor.execute(sql)
    finally:
        conn.commit()
        conn.close()


@blueprint.route('/create_user/<email>')
def create_user(email):
    if not email:
        raise ValueError('Cannot create a user without an email')

    # Check if the user already exists
    get_user_sql = f"""
        SELECT * FROM user WHERE user.email = "{email}"
    """

    results = execute_sql(get_user_sql, models.User)

    created = False
    if not results:
        # There was no information for this user
        # create a row for them
        create_user_sql = f"""
            INSERT INTO user (email) VALUES ("{email}")
        """
        modify_sql(create_user_sql)

        results = execute_sql(get_user_sql, models.User)
        created = True

    # If the user is still not defined, throw an error
    if not results:
        raise ValueError(f'Failed to retrieve or create User: {email}')

    val = {
        'created': created,
        'user': results[0],
    }
    return json.dumps(val, cls=models.ModelEncoder)
