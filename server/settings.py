import os

class Config(object):
    DEBUG = False
    TESTING = False

class ProductionConfig(Config):
    DS_CLIENT_KEY = "1234"

class DevelopmentConfig(Config):
    DEBUG = True
    DS_CONSUMER_KEY = "wcZIa9kEYL220uqfAecCRui7ti0a"
    DS_CONSUMER_SECRET = "dnRJOyi443M7PuTs7MAjCIfkFAMa"



APP_ENV = os.environ.get('APP_ENV', '').lower()
if APP_ENV == 'prod':
    settings = ProductionConfig
else:
    settings = DevelopmentConfig
