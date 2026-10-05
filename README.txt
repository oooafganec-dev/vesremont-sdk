Компактные клиенты Vesremont, 0.2.0 — 2026-10-05; лицензия MIT только для клиентов

javascript/ — Node.js SDK, TypeScript declarations, CLI с PKCE.
python/ — SDK на стандартной библиотеке Python.
go/ — module github.com/oooafganec-dev/vesremont-sdk/go; тег go/v0.2.0 опубликован и проверен через Go proxy.
ruby/ — Ruby SDK и gemspec.
registry/ — server.json и инструкция MCP Registry; публикация не подтверждена.

Официальный SDK-only repository, указанный владельцем:
https://github.com/oooafganec-dev/vesremont-sdk
npm organization: vesremont_api; опубликован @vesremont_api/api 0.2.0.
Старое имя @vesremont/api не использовать в новых imports/командах.
Smithery card владельца: https://smithery.ai/servers/oooafganec/Vesremont
Публикация npm/PyPI/RubyGems 0.2.0 подтверждена внешними registry-проверками.
Go: проверены checksum database, коммит, скачивание, offline-тесты и go vet.
Публичная карточка Smithery подтверждена, содержит каталог инструментов и ссылку
на developer-портал. Владелец подтвердил повторную проверку 21 tools / 4 resources.
Публикация в официальном MCP Registry — отдельный неподтверждённый пункт.

Подтверждённые публичные релизы:
https://www.npmjs.com/package/@vesremont_api/api
https://pypi.org/project/vesremont-api/0.2.0/
https://rubygems.org/gems/vesremont-api/versions/0.2.0
https://github.com/oooafganec-dev/vesremont-sdk/releases/tag/go%2Fv0.2.0
https://pkg.go.dev/github.com/oooafganec-dev/vesremont-sdk/go@v0.2.0

SDK по умолчанию работают с настоящим магазином. Отдельный read-only пример
описан на developer-портале; установка клиента не переключает API на него.
Никаких тестовых заказов или параллельного API окружения этот комплект не создаёт.
Полная внешняя приёмка API по согласованию отложена.

Свежая проверка: npm install из registry, CLI --version/--help, PyPI install/import,
Go download с checksum database, offline-тесты и vet, RubyGems install/import — PASS.
Ruby проверен переносимым официальным runtime в одноразовом каталоге, без
установки в систему. Запросы API магазина для этих проверок не выполнялись.

install.sh относится к предыдущей поставке 0.1.0; для 0.2.0 не использовать.
Команды текущей установки выдаются вместе с общим архивом правок сайта.
Node/Python/Go/Ruby на сервер сайта не устанавливаются. API не активируется,
конфигурация PHP/Redis/Nginx не меняется.

Пакеты для внешних клиентов после установки:
https://vesremont.com/developers/downloads/vesremont-api-0.2.0.tgz
https://vesremont.com/developers/downloads/vesremont_api-0.2.0-py3-none-any.whl
https://vesremont.com/developers/downloads/vesremont_api-0.2.0.tar.gz
https://vesremont.com/developers/downloads/vesremont-go-0.2.0.tar.gz
https://vesremont.com/developers/downloads/vesremont-api-0.2.0.gem

JS/Python README содержат команды и примеры. Клиенты запускать с другого ПК,
не с сервера Vesremont. Использование API с записью — реальные изменения.
SDK/CLI не обходят OAuth scopes и подтверждение покупателя.

Локальная сборка пакетов: clients/build-package.ps1 -Python <Python с setuptools 77+> -Ruby <Ruby 3.3+>.
Сборка использует npm pack, setuptools sdist/wheel, gem build и Go source tar;
ничего не публикует в npm/PyPI/RubyGems/Go proxy и не запускает install.sh.
В репозиторий/архив не включаются токены, OAuth cache или ключи Registry.

Статус публикаций и границы проверок: PUBLISHING.md.
Версию 0.2.0 повторно не публиковать; опубликованный Go-тег не переносить.
Подготовленный пакет/прямая download-ссылка не считаются публикацией в реестре.
