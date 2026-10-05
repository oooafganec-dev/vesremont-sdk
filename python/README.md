# Vesremont Python SDK 0.2.0

Python 3.10+, только стандартная библиотека во время работы.
MIT. Пакет подготовлен к публикации, но пока распространяется непосредственно
Vesremont, а не через PyPI. `pip install vesremont-api` пока не обещается.
После установки серверного архива:

```bash
python -m pip install https://vesremont.com/developers/downloads/vesremont_api-0.2.0-py3-none-any.whl
```

Готовый wheel не требует сборки. Также доступен исходный sdist
`vesremont_api-0.2.0.tar.gz`; для его сборки нужен setuptools 77+.
Runtime-зависимостей нет.

```python
from vesremont_api import VesremontClient, ApiError

api = VesremontClient()
products = api.search("труборез", page=1, per_page=10)
product = api.product(375094)
draft = api.cart_draft(375094, 1)
# draft["share_url"] передаётся покупателю, не в публичные логи.
```

`status`, `search`, `product`, `cart`, `cart_draft` — короткие помощники.
Остальные REST-операции: `request(method, '/path', query={}, body={}, idempotency_key=...)`.
Путь относительно `/api/v1`; GET вызывается без body. `filters` в query — JSON-строка.
Подборку можно дополнить через `cart_draft(..., draft=token)`; token берётся
из query `draft` ранее полученной share_url. Серверные схемы:
https://vesremont.com/openapi.json.

Для личных данных передайте уже полученный REST OAuth token:
`VesremontClient(token=token)`. OAuth-протокол и минимальные scopes описаны
в https://vesremont.com/llms/api.md. Браузерный OAuth мастер есть в Node CLI;
в Python SDK второй мастер не дублируется. Токен не пишется на диск, не входит в URL.

Timeout по умолчанию 15 секунд (параметр `timeout`, до 60). TLS проверяется,
redirects и автоматические повторы отсутствуют; API host фиксирован.
Ответ ограничен 2 MiB, тело запроса — 64 KiB.
`ApiError` содержит `status`, `code`, `request_id`, `retry_after`, без raw body.
После неопределённого исхода записи сначала перечитайте состояние.
Для submit нужны prepare, подтверждение покупателя на Vesremont и стабильный
`idempotency_key`; SDK не обходит эти проверки и не создаёт фиктивных заказов.

Используйте с внешнего ПК/хостинга. Это production API, sandbox не предоставляется.
Наличие SDK не означает включение отключённых операций или завершение приёмки.
