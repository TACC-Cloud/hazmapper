from flask import Flask
from flask import request, redirect
import logging
import settings
import uuid
import requests

logging.basicConfig(
    format='%(asctime)s :: %(levelname)s :: [%(filename)s:%(lineno)d] :: %(message)s',
    level=logging.INFO
)

logger = logging.getLogger('geowebapp')
app = Flask(__name__)

@app.route("/login")
def login_redirect():

    tenant_base_url = "https://agave.designsafe-ci.org"
    client_key = "Gm4wyjJXO1WnufAZ21tRhbCwd10a"
    redirect_uri = "http://geowebapp.local/auth/callback"
    authorization_url = (
        '%s/authorize?scope=openid&client_id=%s&response_type=code&redirect_uri=%s&state=%s' % (
        tenant_base_url,
        client_key,
        redirect_uri,
        uuid.uuid4().hex
    ))
    print(authorization_url)
    return redirect(authorization_url)

@app.route("/auth/callback/")
def auth_callback():
    logger.info(request)
    return redirect("/")




