# Vesremont JS/TypeScript SDK и CLI 0.2.0

Node.js 22+. Нет runtime-зависимостей. ESM + TypeScript declarations.
MIT. Пакет подготовлен к публикации, но пока распространяется непосредственно
Vesremont, а не через npm registry. Имя для первой npm-публикации:
`@vesremont_api/api` (scope организации владельца). Публикация ещё не подтверждена.
Source repository: https://github.com/oooafganec-dev/vesremont-sdk/tree/main/javascript.
После установки серверного архива:

```bash
npm install https://vesremont.com/developers/downloads/vesremont-api-0.2.0.tgz
# CLI отдельно, если нужен глобально:
npm install -g https://vesremont.com/developers/downloads/vesremont-api-0.2.0.tgz
vesremont --help
```

```js
import { VesremontClient, ApiError } from '@vesremont_api/api';
const api = new VesremontClient();
const products = await api.search('труборез', { page: 1, per_page: 10 });
const product = await api.product(375094);
const draft = await api.cartDraft(375094, 1);
// Передайте draft.share_url покупателю: открытие переносит подборку в его корзину.
// Чтобы дополнить ту же подборку, передайте draft token из query share_url
// третьим аргументом cartDraft. Не публикуйте ссылку в общедоступных логах.
```

`status`, `search`, `product`, `cart`, `cartDraft` — короткие помощники.
Любая существующая REST-операция доступна через
`request(method, '/path', {query, body, idempotencyKey})`.
Путь относительный к `/api/v1`, без query string; `filters` в query — JSON-строка.
В TypeScript можно указать ожидаемый тип `request<MyResult>(...)`;
это типизация вызывающего кода, не дополнительная runtime-валидация ответа.
Схемы и scopes: https://vesremont.com/openapi.json.

CLI: `status`, `search "труборез"`, `product 375094`, `cart-link 375094 1`.
`cart --login` запрашивает только `cart:read` через текущий OAuth с PKCE S256.
Откройте напечатанную ссылку на том же ПК и подтвердите доступ в браузере.
Callback привязан только к `127.0.0.1:8765`; порт должен быть свободен.
Токен живёт в памяти одной команды и затем отзывается. Refresh/token cache нет.

```bash
vesremont request GET /catalog/filters --query filters-query.json
vesremont request POST /cart/items --body item.json --write --login --scope cart:write
```

`filters-query.json`: `{"section_id":7531}`. `item.json`: `{"product_id":375094,"quantity":1}`.
Второй пример действительно меняет корзину разрешившего доступ покупателя.
Для нескольких связанных запросов используйте один уже полученный REST Bearer
token: SDK `new VesremontClient({token})`, CLI `VESREMONT_ACCESS_TOKEN`.
Не передавайте токен аргументом/URL и не сохраняйте его в репозитории.
CLI не реализует отдельный многошаговый мастер checkout; используется общий API.

Нет автоматических повторов, redirects или смены API host. Таймаут SDK — 15000 мс,
можно задать `timeout` до 60000 мс. Ответ ограничен 2 MiB, тело запроса — 64 KiB.
`ApiError`: `status`, `code`, `requestId`, `retryAfter`; не логирует токены/ответы.
CLI печатает запрошенный JSON: он может содержать личные данные/confirmation token.
При сетевой ошибке записи сначала перечитайте состояние. Для `/orders/submit`
обязателен `idempotencyKey` (CLI `--key`), prepare и подтверждение покупателя
на Vesremont остаются обязательными. Не повторяйте submit с новым ключом.

Запускайте с внешнего ПК, не с сервера Vesremont. Это production API, не sandbox.
SDK не включает отключённые сервером функции и не заменяет внешнюю приёмку.
