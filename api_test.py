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
                ) OR poem.id = 0;

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
            key=lambda p: p.modified_timestamp or p.creation_timestamp,
            reverse=True)

        # Query for all the manual poems
        url = f'/api/get_poems/manual/0/{user.email}'
        get = self.w.get(url)
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
    def test_get_some_manual_poems(self):
        # First create the user to associate poems with
        user = self.populate_user_data()

        # Create some poems to query for
        num_poems = 4
        half_num_poems = num_poems // 2
        all_poems = self.populate_poem_data(user.id, False, num_poems)
        all_poems.sort(
            key=lambda p: p.modified_timestamp or p.creation_timestamp,
            reverse=True)

        # Query some of the poems
        url = f'/api/get_poems/manual/{half_num_poems}/{user.email}'
        get_partial = self.w.get(url)
        get_partial_resp = json.loads(get_partial.body)
        self.assertEqual(get_partial_resp['type'], 'manual')

        some_manual_poems = get_partial_resp['poems']
        self.assertEqual(len(some_manual_poems), half_num_poems)
        for i in range(half_num_poems):
            poem = all_poems[i]
            manual_poem = some_manual_poems[i]
            self.assertEqual(poem.name, manual_poem['name'])
            self.assertEqual(poem.text, manual_poem['text'])
            self.assertEqual(manual_poem['generated'], False)
            self.assertEqual(manual_poem['user_id'], user.id)

    @with_app_context
    def test_get_manual_poems_error(self):
        with self.assertRaises(ValueError) as context:
            url = f'/api/get_poems/manual/0/{self.test_email}'
            self.w.get(url)
        self.assertTrue(
            'Failed to find a user with email' in str(context.exception))

    @with_app_context
    def test_edit_poem(self):
        user = self.populate_user_data()
        poems = self.populate_poem_data(user.id, False, 1)

        edited_poem = poems[0]
        edited_poem.name = edited_poem.name + ' EDITED'
        edited_poem.text = edited_poem.text + ' EDITED'

        # The webtest library expects a dictionary passed as the request body.
        # Serializing and deserializing the body helps it understand the
        # structure of the Poem
        request_body = json.loads(
            json.dumps({'poem': edited_poem}, cls=models.ModelEncoder))

        edit = self.w.post_json(f'/api/edit_poem/{edited_poem.id}',
                                request_body)
        edit_resp = json.loads(edit.body)
        self.assertTrue(edit_resp['edited'])

        # Make sure the correct fields were modified
        response_poem = edit_resp['poem']
        self.assertEqual(response_poem['user_id'], edited_poem.user_id)
        self.assertEqual(response_poem['creation_timestamp'],
                         str(edited_poem.creation_timestamp))
        self.assertNotEqual(response_poem['modified_timestamp'],
                            edited_poem.modified_timestamp)
        self.assertEqual(response_poem['name'], edited_poem.name)
        self.assertEqual(response_poem['text'], edited_poem.text)

    @with_app_context
    def test_edit_poems_bad_id_error(self):
        with self.assertRaises(ValueError) as context:
            self.w.post_json('/api/edit_poem/0', {})
        self.assertTrue('Failed to find an existing poem with id' in str(
            context.exception))

    @with_app_context
    def test_edit_poems_mismatch_id_error(self):
        user = self.populate_user_data()
        poems = self.populate_poem_data(user.id, False, 1)

        with self.assertRaises(ValueError) as context:
            self.w.post_json(f'/api/edit_poem/{poems[0].id}',
                             {'poem': {
                                 'id': 1
                             }})
        self.assertTrue('does not match expected id' in str(context.exception))


if __name__ == '__main__':
    absltest.main()
