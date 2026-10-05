# Vesremont Ruby SDK 0.2.0

Ruby 3.3+, MIT, без сторонних runtime-зависимостей. Это настоящий gem,
но он пока не опубликован в RubyGems. После установки серверных файлов:

```bash
curl -fLO https://vesremont.com/developers/downloads/vesremont-api-0.2.0.gem
gem install ./vesremont-api-0.2.0.gem --local
```

```ruby
require 'vesremont_api'
api = Vesremont::Client.new
products = api.search('труборез', per_page: 10)
product = api.product(375094)
draft = api.cart_draft(375094, 1)
```

`status`, `search`, `product`, `cart`, `cart_draft` и общий
`request(method, path, query: {}, body: nil, idempotency_key: nil)`.
Путь относительно `/api/v1`, GET без body; JSON body — Hash.
Личные операции: `Vesremont::Client.new(token: token)` с уже полученным REST
OAuth token и минимальными scopes. OAuth мастер не дублируется (есть в Node CLI).
Схемы сервера: https://vesremont.com/openapi.json.

TLS проверяется; host фиксирован, redirects/автоматические повторы запрещены.
Timeout 15 секунд по умолчанию, максимум 60; тело до 64 KiB, ответ до 2 MiB.
`Vesremont::ApiError` содержит `status`, `code`, `request_id`, `retry_after` без
raw response. Не логируйте token, share_url и личные ответы. Для submit нужны
prepare, подтверждение покупателя и стабильный ключ; при сетевой ошибке сначала
перечитайте состояние. Это production API, не sandbox. Запускать с внешнего ПК,
не с сервера Vesremont. SDK не включает выключенные серверные интерфейсы.
