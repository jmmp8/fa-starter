# Example Angular-on-Flask Starter

To get started:

- Follow instructions in example.env
- Run `npm install` from this folder
- Run `python -m pip install -r requirements.txt`
  - Use python3
  - You may use a [venv](https://docs.python.org/3/library/venv.html).

To run in development mode:

- Set FLASK_ENV to development in .env
- `python -m flask run`
- `ng serve`
- navigate to http://localhost:5000 (or whatever your flask instance is)

To run in production mode:

- Set FLASK_ENV to production in .env
- `ng build --prod`
- `npm start`
- navigate to http://localhost:8000 (or whatever your flask instance is)

## Project Requirements document

https://docs.google.com/document/d/1HsJqFBf08IhsVV0BiPsAR-zH5l9pEDSpzUcPsZCVxYQ/edit?usp=sharing

