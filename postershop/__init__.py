import os
import stripe
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow, Schema
from flask_migrate import Migrate
from postershop.config import Config

app = Flask(__name__)
app.config.from_object(Config)
stripe.api_key = app.config['STRIPE_TEST_SK']

db = SQLAlchemy(app)
migrate = Migrate(app, db)
ma = Marshmallow(app)

from postershop import routes
