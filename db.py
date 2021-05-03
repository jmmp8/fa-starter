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


def fetch_sql(sql, num_rows=None):
    """Executes a SQL query and returns the results

    Args:
        sql (str): SQL query to run
        num_rows (int, optional): The number of rows to query for.
          Defaults to None, which will fetch all rows.

    Returns:
        List[Dict]: A list or the rows returned by the query as dictionaries.
    """
    conn = connect()
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql)
            if num_rows is not None:
                results = cursor.fetchmany(num_rows)
            else:
                results = cursor.fetchall()
            return results
    finally:
        conn.close()


@blueprint.route('/test')
def test():
    return 'pong!'


@blueprint.route('/create_user/<email>')
def create_user(email):

    return
