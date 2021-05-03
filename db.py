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


def execute_procedure(procedure_name, arguments):
    """Executed a stored procedure on the database

    Args:
        procedure_name (str): the name of the stored procedure to execute
        arguments (Dict): dictionary of arguments to pass the stored procedure

    Returns:
        List[Dict]: List of dictionaries representing the results
          returned by the procedure
    """
    conn = connect()
    try:
        with conn.cursor() as cursor:
            cursor.callproc(procedure_name, args=arguments)
            return cursor.fetchall()
    finally:
        conn.commit()
        conn.close()


def execute_sql(sql, num_rows=None):
    """Executes a SQL query and returns the results

    This function is specifically for retrieving data.
    Modifications will not be commited.

    Args:
        sql (str): SQL query to run
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
            return results
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
    return flask.jsonify(execute_procedure('create_user', [email]))
