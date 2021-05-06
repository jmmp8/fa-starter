"""Tests for db.py"""
import json
from absl.testing import absltest
from flask_webtest import TestApp

from app import app

import api
from models import db


def with_app_context(func):
    def wrapper(test, *args, **kwargs):
        with test.app.app_context():
            func(test, *args, **kwargs)

    return wrapper


class DbTest(absltest.TestCase):
    def setUp(self):
        self.app = app
        self.w = TestApp(self.app, db)

        self.test_email = 'test@gmail.com'

        self.wipe_test_data()

    @with_app_context
    def wipe_test_data(self):
        # SQL to wipe the test user from the testing database
        wipe_user_sql = f"""
            DELETE FROM user WHERE user.email = "{self.test_email}"
        """
        db.session.execute(wipe_user_sql)
        db.session.commit()

    @with_app_context
    def test_create_user(self):
        first_create = self.w.get(f'/api/create_user/{self.test_email}')
        first_create_resp = json.loads(first_create.body)
        self.assertTrue(first_create_resp['created'])

        user_query = f'SELECT * FROM user WHERE user.email="{self.test_email}"'
        user_query_result = db.session.execute(user_query).all()
        self.assertEqual(len(user_query_result), 1)

        second_create = self.w.get(f'/api/create_user/{self.test_email}')
        second_create_resp = json.loads(second_create.body)
        self.assertFalse(second_create_resp['created'])

        self.assertEqual(first_create_resp['user']['id'],
                         second_create_resp['user']['id'])


if __name__ == '__main__':
    absltest.main()
