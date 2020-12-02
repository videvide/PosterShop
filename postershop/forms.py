from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired, Length, Email, EqualTo, ValidationError
from postershop.models import Order

class DeliveryInfoForm(FlaskForm):
    first_name = StringField('First name', validators=[DataRequired()])
    last_name = StringField('Last name', validators=[DataRequired()])
    phone_number = StringField('Phone number')
    email_address = StringField('Email', validators=[DataRequired(), Email()])
    delivery_address = StringField('Delivery address', validators=[DataRequired()])
    delivery_zip = StringField('Delivery zip', validators=[DataRequired()])
    delivery_city = StringField('Delivery city', validators=[DataRequired()])
    delivery_state = StringField('Delivery state')
    delivery_country = StringField('Delivery country', validators=[DataRequired()])
    submit = SubmitField('Submit')
