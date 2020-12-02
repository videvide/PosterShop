import os


class Config:
    # tänk på att dessa variabel namn är olika från config.json namnen på prod servern
    # den filen heter /etc/config.json
    SECRET_KEY = os.environ.get('poster_shop_sk')
    STRIPE_PUBLIC_KEY = os.environ.get('stripe_test_pk')
    # SQLALCHEMY_DATABASE_URI = "sqlite:///" # detta är vid migrations komplikationer
    SQLALCHEMY_DATABASE_URI = os.environ.get('poster_shop_db_uri')
    STRIPE_TEST_SK = os.environ.get('stripe_test_sk')
    FROM_EMAIL = os.environ.get('from_email')
    FROM_EMAIL_PASS = os.environ.get('from_email_pass')
    STRIPE_ENDPOINT_SECRET = os.environ.get('stripe_endpoint_secret')