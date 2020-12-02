from flask import render_template, url_for, flash, redirect, request, session, jsonify, abort, json
from postershop import app, db, stripe, os, ma
from postershop.models import Order, Poster, PosterSchema, OrderSchema
import smtplib
from jinja2 import Environment, FileSystemLoader
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

env = Environment(loader=FileSystemLoader('%s/templates/' %
                                          os.path.dirname(__file__)))


@app.route("/getposter", methods=['POST'])
def getposter():
    req = request.get_json()
    poster_query = str(Poster.query.filter_by(title=req).first())
    return jsonify(poster_query), 200


@app.route("/getposters")
def getposters():
    posters_query = Poster.query.order_by(Poster.title.asc()).all()
    poster_schema = PosterSchema(many=True)
    posters = poster_schema.dumps(posters_query)
    return jsonify(posters), 200


@app.route("/getpreviewposters", methods=['POST'])
def getpreviewposters():
    req = request.get_json()
    poster1 = Poster.query.filter_by(title=req['1']).first()
    poster2 = Poster.query.filter_by(title=req['2']).first()
    poster3 = Poster.query.filter_by(title=req['3']).first()
    posters = [poster1, poster2, poster3]
    poster_schema = PosterSchema(many=True)
    preview_posters = poster_schema.dumps(posters)
    return preview_posters, 200


@app.route("/")
@app.route("/posters")
def posters():
    posters_query = Poster.query.all()
    poster_schema = PosterSchema(many=True)
    posters = poster_schema.dumps(posters_query)
    return render_template('posters.html', title='Posters', posters=posters)


@app.route("/poster/<string:poster_title>")
def poster(poster_title):
    poster = Poster.query.filter_by(title=poster_title).first()
    poster_large = eval(poster.large)
    poster_medium = eval(poster.medium)
    poster_small = eval(poster.small)
    return render_template('poster.html',
                           title=poster.title,
                           poster=poster,
                           poster_large=poster_large,
                           poster_medium=poster_medium,
                           poster_small=poster_small)


@app.route("/artworks")
def artworks():
    return render_template('artworks.html', title='Artworks')


@app.route("/about")
def about():
    return render_template('about.html', title='About')


@app.route("/info")
def info():
    return render_template('info.html', title='Info')


@app.route("/contact")
def contact():
    return render_template('contact.html', title='Contact')


@app.route("/privacy")
def privacy():
    return render_template('privacy.html', title='Privacy')


@app.route("/bag")
def bag():
    posters_query = Poster.query.all()
    poster_schema = PosterSchema(many=True)
    posters = poster_schema.dumps(posters_query)
    return render_template('bag.html', title='Bag', posters=posters)


@app.route('/create-checkout-session', methods=['GET', 'POST'])
def create_checkout_session():
    lineItems = []
    bagItems = request.json
    for key, value in bagItems.items():
        lineItems.append({
            'price': value['stripe_price_id'],
            'quantity': value['in_bag']
        })
    try:
        session = stripe.checkout.Session.create(
            shipping_address_collection={
                'allowed_countries':
                ['YE', 'YT', 'ZA', 'ZM', 'ZW', 'ZZ', 'SE'],
            },
            payment_method_types=['card'],
            line_items=lineItems,
            mode='payment',
            success_url=url_for('success', _external=True),
            cancel_url=url_for('cancel', _external=True),
        )
        return jsonify(id=session.id)
    except Exception as e:
        return jsonify(error=str(e)), 403


@app.route("/webhook", methods=['POST'])
def webhook():
    print('WEBHOOK CALLED')

    if request.content_length > 1024 * 1024:
        print('REQUEST TO BIG')
        abort(400)
    payload = request.get_data()
    sig_header = request.environ.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = app.config['STRIPE_ENDPOINT_SECRET']
    event = None
    try:
        event = stripe.Webhook.construct_event(payload, sig_header,
                                               endpoint_secret)
    except ValueError as e:
        # If invalid payload
        print('INVALID PAYLOAD')
        return {}, 400
    except stripe.error.SignatureVerificationError as e:
        # If invalid signature
        print('INVALID SIGNATURE')
        return {}, 400

    # handle the checkout.session.completed event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        session_expand = stripe.checkout.Session.retrieve(
            session['id'], expand=['customer', 'line_items', 'payment_intent'])
        #   print(session_expand)
        save_to_db(session_expand)
        fulfill_order(session_expand)
        send_receipt(session_expand)
    return {}


def save_to_db(session_expand):
    customer_shipping_email = session_expand['customer']['email']
    customer_shipping_name = session_expand['shipping']['name']
    customer_shipping_address = dict(session_expand['shipping']['address'])
    customer_shipping_address_string = str(customer_shipping_address)
    line_items = session_expand['line_items']['data']
    line_items_db = []
    for item in line_items:
        line_items_db.append({
            'name': item['description'],
            'id': item['id'],
            'price_id': item['price']['id'],
            'quantity': item['quantity'],
            'unit_amount': item['price']['unit_amount']
        })
    order_amount_total_str = str(
        session_expand['payment_intent']['amount_received'])
    checkout_session_id = session_expand['id']
    payment_intent = session_expand['payment_intent']['id']
    address_dict = customer_shipping_address
    order = Order(customer_name=customer_shipping_name,
                  customer_email_address=customer_shipping_email,
                  customer_delivery_address=customer_shipping_address_string,
                  products=json.dumps(line_items_db),
                  order_amount_total=order_amount_total_str,
                  checkout_session_id=checkout_session_id,
                  payment_intent_id=payment_intent)
    db.session.add(order)
    db.session.commit()
    return print('Order has been saved to db!')


def send_order_email(messageHtml):
    from_email = app.config['FROM_EMAIL']
    password = app.config['FROM_EMAIL_PASS']
    send_to_email = app.config['FROM_EMAIL']
    subject = 'Test Order'
    message = MIMEMultipart('alternative')
    message['From'] = from_email
    message['To'] = send_to_email
    message['Subject'] = subject
    messagePlain = 'Something went wrong during the email transportation. Please contact support.'
    message.attach(MIMEText(messagePlain, 'plain'))
    message.attach(MIMEText(messageHtml, 'html'))
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(from_email, password)
    msgBody = message.as_string()
    server.sendmail(from_email, send_to_email, msgBody)
    server.quit()


def fulfill_order(session_expand):
    customer_info = {}
    customer_info['shipping_email'] = session_expand['customer']['email']
    customer_info['shipping_name'] = session_expand['shipping']['name']
    customer_info['shipping_address'] = dict(
        session_expand['shipping']['address'])
    line_items = session_expand['line_items']['data']
    line_items_info = []
    for item in line_items:
        line_items_info.append({
            'name': item['description'],
            'id': item['id'],
            'price_id': item['price']['id'],
            'quantity': item['quantity'],
            'unit_amount': item['price']['unit_amount']
        })
    order_info = {}
    order_info['checkout_session_id'] = session_expand['id']
    order_info['payment_intent'] = session_expand['payment_intent']['id']
    order_id_query = Order.query.filter_by(
        payment_intent_id=order_info['payment_intent']).first()
    order_info['order_id'] = order_id_query.id
    if customer_info['shipping_address']['line2']:
        customer_info['shipping_address']['line2'] = customer_info[
            'shipping_address']['line2']
    else:
        customer_info['shipping_address']['line2'] = ''
    if customer_info['shipping_address']['postal_code']:
        customer_info['shipping_address']['postal_code'] = customer_info[
            'shipping_address']['postal_code']
    else:
        customer_info['shipping_address']['postal_code'] = ''
    if customer_info['shipping_address']['state']:
        customer_info['shipping_address']['state'] = customer_info[
            'shipping_address']['state']
    else:
        customer_info['shipping_address']['state'] = ''
    template = env.get_template('email_order.html')
    output = template.render(customer_info=customer_info,
                             line_items_info=line_items_info,
                             order_info=order_info)
    send_order_email(output)
    return print('Order has been sent!')


def send_receipt_email(customer_email, messageHtml):
    from_email = app.config['FROM_EMAIL']
    password = app.config['FROM_EMAIL_PASS']
    send_to_email = customer_email
    subject = 'Receipt'
    message = MIMEMultipart('alternative')
    message['From'] = from_email
    message['To'] = send_to_email
    message['Subject'] = subject
    # Attach both plain and HTML versions
    messagePlain = 'Something went wrong during the email receipt transportation. Please contact our support.'
    message.attach(MIMEText(messagePlain, 'plain'))
    message.attach(MIMEText(messageHtml, 'html'))
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(from_email, password)
    msgBody = message.as_string()
    server.sendmail(from_email, send_to_email, msgBody)
    server.quit()


def send_receipt(session_expand):
    customer_info = {}
    customer_info['shipping_email'] = session_expand['customer']['email']
    customer_info['shipping_name'] = session_expand['shipping']['name']
    customer_info['shipping_address'] = dict(
        session_expand['shipping']['address'])
    line_items = session_expand['line_items']['data']
    line_items_info = []
    for item in line_items:
        unit_amount = item['price']['unit_amount']
        quantity = item['quantity']
        amount = unit_amount * quantity
        amount_str = str(amount)
        line_items_info.append({
            'name': item['description'],
            'id': item['id'],
            'price_id': item['price']['id'],
            'quantity': item['quantity'],
            'unit_amount': item['price']['unit_amount'],
            'amount': amount_str[:-2]
        })
    order_info = {}
    order_info['checkout_session_id'] = session_expand['id']
    order_info['payment_intent'] = session_expand['payment_intent']['id']
    order_id_query = Order.query.filter_by(
        payment_intent_id=order_info['payment_intent']).first()
    order_info['order_id'] = order_id_query.id
    order_total = str(session_expand['payment_intent']['amount_received'])
    order_info['order_total'] = order_total[:-2]
    if customer_info['shipping_address']['line2']:
        customer_info['shipping_address']['line2'] = customer_info[
            'shipping_address']['line2']
    else:
        customer_info['shipping_address']['line2'] = ''
    if customer_info['shipping_address']['postal_code']:
        customer_info['shipping_address']['postal_code'] = customer_info[
            'shipping_address']['postal_code']
    else:
        customer_info['shipping_address']['postal_code'] = ''
    if customer_info['shipping_address']['state']:
        customer_info['shipping_address']['state'] = customer_info[
            'shipping_address']['state']
    else:
        customer_info['shipping_address']['state'] = ''
    template = env.get_template('email_receipt.html')
    output = template.render(customer_info=customer_info,
                             line_items_info=line_items_info,
                             order_info=order_info)
    send_receipt_email(customer_info['shipping_email'], output)

    return print('Receipt has been sent!')


@app.route("/success")
def success():
    return render_template('success.html', title='Success')


@app.route("/cancel")
def cancel():
    return render_template('cancel.html', title='Cancel')
