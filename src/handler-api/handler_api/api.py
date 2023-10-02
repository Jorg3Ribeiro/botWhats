"""
A API para lidar com mensagens.

Possui apenas três pontos finais:

    /
    - GET: informa que o servidor está instalado e funcionando

    /send
    - POST: Envia uma mensagem para um usuário.
        - Leva um corpo JSON com os seguintes campos:
            - chat_id: O ID do usuário para o qual enviar a mensagem.
            - mensagem: A mensagem a ser enviada.
        - Retorna um corpo JSON com os seguintes campos:
            - sucesso: Se a mensagem foi enviada com sucesso.

    /message
    - POST: Recebe uma mensagem de um usuário, trata-a e entrega uma resposta.
        - Leva um corpo JSON com o formato definido na classe Message.
        - Retorna um corpo JSON com os seguintes campos:
            - text: O texto a ser enviado de volta ao usuário.
"""

from flask import Flask, request
import requests

from handler_api.handler import handle
from handler_api.message import Message
from handler_api.settings import SEND_MESSAGE_URL
from handler_api.utils import get_key


app = Flask(__name__)

@app.route("/")
def it_works():
    return "Esta Funcionando!"


@app.route("/send", methods=["POST"])
def send_message():

    body = request.get_json()

    try:
        chat_id = get_key(body, "chat_id")
        message = get_key(body, "message")
    except KeyError:
        return "O corpo deve ser um JSON com os seguintes campos: chat_id, mensagem", 400

    response = requests.post(
        SEND_MESSAGE_URL,
        json={"to": chat_id, "text": message}
    )

    if response.status_code == 200:
        return {"success": True}
    return {"error": False}


@app.route("/message", methods=["POST"])
def handle_message():
    """
    Recebe uma mensagem de um usuário, trata-a e entrega uma resposta.
    """
    # Analisa a mensagem, que é o corpo da solicitação.
    body = request.get_json()
    message = Message(body)

    # Lidando com a mensagem.
    text = handle(message)

    # Devolvendo a resposta.
    return {"text": text}
