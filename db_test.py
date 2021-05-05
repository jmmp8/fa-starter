"""Tests for db.py"""
import json
from absl.testing import absltest
from flask_webtest import TestApp

from app import app

import db


class DbTest(absltest.TestCase):
    def setUp(self):
        self.app = app
        self.w = TestApp(self.app)

        self.test_email = 'test@gmail.com'

        # SQL to wipe the test user from the testing database
        self.wipe_user_sql = f"""
            DELETE FROM user WHERE user.email = "{self.test_email}"
        """

        # Wipe any pre-existing information for the test user
        db.modify_sql(self.wipe_user_sql)

    def test_create_user(self):
        first_create = self.w.get(f'/db/create_user/{self.test_email}')
        first_create_resp = json.loads(first_create.body)[0]
        self.assertTrue(first_create_resp['created'])

        user_query = f'SELECT * FROM user WHERE user.email="{self.test_email}"'
        user_query_result = db.execute_sql(user_query)
        self.assertEqual(len(user_query_result), 1)

        second_create = self.w.get(f'/db/create_user/{self.test_email}')
        second_create_resp = json.loads(second_create.body)[0]
        self.assertFalse(second_create_resp['created'])

        self.assertEqual(first_create_resp['id'], second_create_resp['id'])


if __name__ == '__main__':
    absltest.main()
