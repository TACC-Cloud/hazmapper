from flask import Flask
from flask import request, redirect, jsonify
import logging
import settings
import uuid
import requests
from urllib.parse import quote
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
        '%s/authorize?client_id=%s&response_type=code&redirect_uri=%s&state=%s' % (
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
    tenant_base_url = "https://agave.designsafe-ci.org"
    code = request.args.get("code", None)
    redirect_uri = "{}://{}/auth/callback".format(request.scheme, request.host)
    print(redirect_uri)
    client_key = "Gm4wyjJXO1WnufAZ21tRhbCwd10a"
    client_sec = "I2qMFCN6_LEp3dNDqJVvxUtqnf8a"
    # body = {
    #     'grant_type': 'authorization_code',
    #     'code': code,
    #     'redirect_uri': redirect_uri,
    #     'client_id': client_key,
    #     'client_secret': client_sec
    # }
    # TODO update to token call in agavepy
    token_url = tenant_base_url + "/token?grant_type=authorization_code&code={}&redirect_uri={}&client_id={}&client_secret={}".format(
        code,
        redirect_uri,
        client_key,
        client_sec
    )
    print(token_url)
    response = requests.post(token_url)
    token_data = response.json()
    print(token_data)
    return jsonify(token_data)




