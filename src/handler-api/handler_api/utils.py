from typing import Any


_no_default = object()

def get_key(dictionary: dict, key: Any, default: Any=_no_default) -> Any:
    """
    Tenta obter uma chave de um dicionário. Se a chave não for encontrada,
    retorna o valor padrão. Se o valor padrão não for especificado,
    gera um KeyError.
    """
    if key in dictionary:
        return dictionary[key]
    if default is not _no_default:
        return default
    raise KeyError(key)
