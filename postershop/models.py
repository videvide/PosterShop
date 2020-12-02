from datetime import datetime
from postershop import db, ma


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(150), nullable=False)
    customer_email_address = db.Column(db.String(150), nullable=False)
    customer_delivery_address = db.Column(db.String(500), nullable=False)
    products = db.Column(db.String, nullable=False)
    order_amount_total = db.Column(db.String(100), nullable=False)
    checkout_session_id = db.Column(db.String(200),
                                    nullable=False,
                                    unique=True)
    payment_intent_id = db.Column(db.String(200), nullable=False, unique=True)

    def __repr__(self):
        return f"Order('Order-id: {self.id}', 'Customer: {self.customer_name}', 'Customer-email: {self.customer_email_address}', 'Customer-address: {self.customer_delivery_address}', 'Products: {self.products}', 'Order-total: {self.order_amount_total}')"


class Poster(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    display_title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    story = db.Column(db.String(500), nullable=True)
    large = db.Column(
        db.String(150), nullable=True
    )  # type, size, title, display_title, bag_title, in_bag, price, stripe_price_id, image
    medium = db.Column(
        db.String(150), nullable=True
    )  # type, size, title, display_title, bag_title, in_bag, price, stripe_price_id, image
    small = db.Column(
        db.String(150), nullable=True
    )  # type, size, title, display_title, bag_title, in_bag, price, stripe_price_id, image
    image = db.Column(db.String(100), nullable=False)

    # later you need to have more images per poster in order to show interior images.
    # also fix the "ai" thing that makes the user being able to take a picture of their home
    # and placing artwork or poster init.

    # \u007b = {
    # \u007d = }
    def __repr__(self):
        return f'"id":{self.id},"title":"{self.title}","display_title":"{self.display_title}","image":"{self.image}","description":"{self.description}","story":"{self.story}","large":{self.large},"medium":{self.medium},"small":{self.small}'


class Artwork(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=True)
    in_bag = db.Column(db.Integer, nullable=True)
    price = db.Column(db.Integer, nullable=True)
    stripe_price_id = db.Column(db.String(100), nullable=True)
    size = db.Column(db.String(100), nullable=True)
    description = db.Column(db.String(500), nullable=True)
    story = db.Column(db.String(500), nullable=True)
    image1 = db.Column(db.String(100), nullable=True)
    image2 = db.Column(db.String(100), nullable=True)
    image3 = db.Column(db.String(100), nullable=True)
    image4 = db.Column(db.String(100), nullable=True)

    def __repr__(self):
        return f'"id":{self.id},"title":"{self.title}","display_title":"{self.display_title}","bag_title":{self.bag_title},"in_bag":{self.in_bag},"price":{self.price},"stripe_price_id":{self.stripe_price_id},"size":{self.size},"description":{self.description},"image":"{self.image}","description":"{self.description}","story":"{self.story}"'


class OrderSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Order
        ordered = True


class PosterSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Poster
        ordered = True


class ArtworkSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Artwork
        ordered = True