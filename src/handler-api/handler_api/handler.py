"""
É aqui que as mensagens são tratadas. Deve haver uma função principal
com a seguinte assinatura:

    def handle(mensagem: Mensagem) -> str:
        ...

Esta função precisa ser capaz de gerenciar o estado e retornar uma resposta de texto.
"""

from handler_api.message import Message

def handle(message: Message) -> str: # pylint: disable=unused-argument
    """
    Lida com todo tipo de mensagem e retorna uma resposta.

    Argumentos:
        mensagem: A mensagem a ser tratada.

    Retorna:
        A resposta a ser enviada de volta ao usuário. Se retornar
        Nenhum, a mensagem será ignorada.
    """
   
    return "Olá, sou um bot!"
