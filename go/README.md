# Vesremont Go SDK 0.2.0

Go 1.22+, стандартная библиотека, MIT.
Модуль `github.com/oooafganec-dev/vesremont-sdk/go` находится в подкаталоге
`go` официального репозитория. Vanity import на домене магазина не нужен.
Первая публикация требует загрузки исходников и тега `go/v0.2.0`; пока тег
и установка через публичный proxy не подтверждены, `go get` не обещается.
До публикации скачайте и распакуйте архив с внешнего ПК:

```bash
curl -fLO https://vesremont.com/developers/downloads/vesremont-go-0.2.0.tar.gz
tar -xzf vesremont-go-0.2.0.tar.gz
go mod edit -require=github.com/oooafganec-dev/vesremont-sdk/go@v0.2.0
go mod edit -replace=github.com/oooafganec-dev/vesremont-sdk/go=./vesremont-go-0.2.0
```

```go
import (
    "context"
    "time"
    vesremont "github.com/oooafganec-dev/vesremont-sdk/go"
)
// Внутри вашей функции:
api, err := vesremont.New("", 15*time.Second)
// Проверьте err, затем:
products, err := api.Search(context.Background(), "труборез", map[string]string{"per_page": "10"})
```

`Status`, `Search`, `Product`, `Cart`, `CartDraft` и общий `Request` возвращают
`json.RawMessage`; обрабатывайте каждый `error`. Форматы ответов и scopes:
https://vesremont.com/openapi.json. Для личных операций передайте уже полученный
REST OAuth token в `New`; OAuth мастер не дублируется (есть в Node CLI).
`Options` принимает `Query`, JSON object `Body` и `IdempotencyKey`.

Фиксированный HTTPS origin, штатная проверка TLS, timeout 1..60 секунд,
нет application retries и redirects; тело до 64 KiB, ответ до 2 MiB.
HTTP transport Go может восстановить безопасный идемпотентный запрос при
ошибке переиспользованного соединения (GET или запрос со стабильным
Idempotency-Key); прикладной цикл повторов SDK не добавляет.
`ApiError` содержит HTTP status, code, request ID и Retry-After, не сырой ответ.
Prepare, подтверждение покупателя и стабильный ключ submit остаются обязательными.
При неопределённом исходе записи перечитайте состояние. Не логируйте токены,
личные ответы или share_url. Это production API, не sandbox; используйте только
публично включённые интерфейсы. Никакие credentials не сохраняются на диск.
