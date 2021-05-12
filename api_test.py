"""Tests for db.py"""
import json
from absl.testing import absltest
from datetime import datetime, timedelta
from flask_webtest import TestApp

from app import app

import models
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
        # SQL to wipe the test user data from the testing database
        wipe_user_sql = f"""
            DELETE FROM poem WHERE 
                EXISTS (SELECT 1 FROM user WHERE
                    user.id = poem.user_id 
                    AND user.email = "{self.test_email}"
                );

            DELETE FROM user WHERE user.email = "{self.test_email}";
        """
        db.session.execute(wipe_user_sql)
        db.session.commit()

    def populate_user_data(self):
        user = models.User(email=self.test_email)
        db.session.add(user)
        db.session.commit()
        return user

    def populate_poem_data(self, user_id, generated, num_poems=1):
        results = []
        for i in range(num_poems):
            poem = models.Poem(
                user_id=user_id,
                creation_timestamp=(datetime.now() -
                                    timedelta(minutes=num_poems - i)),
                generated=generated,
                name=f'test poem {i}',
                text=f'poem {i}\ntest\ntext',
            )
            db.session.add(poem)
            results.append(poem)
        db.session.commit()
        return results

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

    @with_app_context
    def test_create_poem(self):
        # First create user to associate the poem with
        user = self.populate_user_data()

        # Call the endpoint
        poem_name = 'test poem'
        poem_text = 'test\nthis is a poem\na very good one'

        request_body = {
            'userEmail': user.email,
            'poemName': poem_name,
            'poemText': poem_text,
            'generated': False
        }

        create = self.w.post_json('/api/create_poem', request_body)
        create_resp = json.loads(create.body)
        self.assertTrue(create_resp['created'])

        poem_query = f"""SELECT * FROM poem WHERE EXISTS
            (SELECT 1 FROM user WHERE 
                user.id=poem.user_id AND 
                user.email="{self.test_email}"
            )
        """
        poem_query_result = db.session.execute(poem_query).all()
        self.assertEqual(len(poem_query_result), 1)
        self.assertEqual(poem_query_result[0].name, poem_name)
        self.assertEqual(poem_query_result[0].text, poem_text)

    @with_app_context
    def test_create_poem_error(self):
        # Call the endpoint without creating the user first
        poem_name = 'test poem'
        poem_text = 'test\nthis is a poem\na very good one'

        request_body = {
            'userEmail': self.test_email,
            'poemName': poem_name,
            'poemText': poem_text,
            'generated': False
        }

        with self.assertRaises(ValueError) as context:
            self.w.post_json('/api/create_poem', request_body)
        self.assertTrue(
            'Failed to find a user with email' in str(context.exception))

    @with_app_context
    def test_get_manual_poems(self):
        # First create the user to associate poems with
        user = self.populate_user_data()

        # Create some poems to query for
        num_poems = 4
        all_poems = self.populate_poem_data(user.id, False, num_poems)
        all_poems.sort(
            key=lambda p: p.modified_timestamp or p.creation_timestamp)

        # Query for all the manual poems
        get = self.w.get(f'/api/get_poems/manual/0/{user.email}')
        get_resp = json.loads(get.body)
        self.assertEqual(get_resp['type'], 'manual')

        all_manual_poems = get_resp['poems']
        self.assertEqual(len(all_manual_poems), len(all_poems))
        for i in range(num_poems):
            poem = all_poems[i]
            manual_poem = all_manual_poems[i]
            self.assertEqual(poem.name, manual_poem['name'])
            self.assertEqual(poem.text, manual_poem['text'])
            self.assertEqual(manual_poem['generated'], False)
            self.assertEqual(manual_poem['user_id'], user.id)

    @with_app_context
    def test_get_manual_poems_error(self):
        with self.assertRaises(ValueError) as context:
            self.w.get(f'/api/get_poems/manual/0/{self.test_email}')
        self.assertTrue(
            'Failed to find a user with email' in str(context.exception))


if __name__ == '__main__':
    absltest.main()
