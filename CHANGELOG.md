# Changelog

## 1.0.0 (2026-11-16)


### Features

* **booking:** гонка 409 - сообщение API и перезагрузка сетки, 404 - путь к типам ([74fc649](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/74fc64927194813efa9e533bb8147add178b81df))
* **booking:** проверка пересечений и валидация брони - 400, 404, 409, вплотную 201 ([c4c3342](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/c4c3342ce24f54f3e5c4ae7c07de7303e75f7bf3))
* **booking:** страница записи - календарь 14 дней и сетка слотов дня ([3b1828f](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/3b1828f314dac2a8bc32919fddff860a9da328a8))
* **booking:** форма гостя с валидацией по контракту без отправки ([c8f1377](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/c8f13770b9a66cb92ab3c1d59a289a5906d89e78))
* **booking:** экран успеха с деталями встречи и путём к типам ([b33a5e3](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/b33a5e3aece19d5d157b3a21e5d1c880aa469012))
* **booking:** эндпоинт бронирования - 201 с данными встречи и появление в предстоящих ([0ef78ca](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/0ef78ca027e974ee0ecda494d8b81d620d044643))
* **booking:** эндпоинт свободных слотов - окно 14 дней и сетка рабочего дня ([fd99b22](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/fd99b228b286f218462acfec3e73dc2a975b532c))
* **calc:** подготовлен короткий сценарий в README.md ([001c4ab](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/001c4ab732ff1210c1f5b7f8aa794a8bc29ab49e))
* **contract:** 409 при удалении типа встречи с будущими встречами ([14a3fe3](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/14a3fe3fa468f067e9434323a062c39a382a1e86))
* **contract:** typespec-контракт, генерация openapi и sdk ([2bfcc79](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/2bfcc79b405d0c04f65595331589115642b54e50))
* **deploy:** docker-образ, бекенд раздаёт статику фронтенда ([fa09bca](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/fa09bca3e5ce41963360e7b9c5865bf9926276f5))
* **frontend:** задекларировать маршрут /admin заглушкой ([4014e62](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/4014e62880581235aa09a964a261a1debde0a5c7))
* **frontend:** публичная страница и заглушка потока записи ([62e8117](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/62e8117192bed94175e9b809c17dcbbbaed3b276))
* **frontend:** страница 404 для неизвестных маршрутов ([#6](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/issues/6)) ([d10045a](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/d10045a4283fc07c75036cac1297d49349e11de7))
* **panel:** CRUD типов встреч на панели владельца через SDK-адаптер ([bbd75ba](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/bbd75bae865802da43364fbe1abd1cfa19d24d8b))
* **panel:** GET /api/meetings - предстоящие встречи по возрастанию начала ([74473c7](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/74473c7098a163770ee904f648d443c8dc95b37d))
* **panel:** публичная страница получает типы через SDK-адаптер publicApi ([3d360d2](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/3d360d2893507d555923312cbf54a50162bfa7fb))
* **panel:** секция предстоящих встреч в панели с временем в поясе владельца ([387c6a0](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/387c6a08326469bd310afeb3977e0197ba00af8d))
* **panel:** хранилище в памяти и CRUD типов встреч на бекенде ([29a749f](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/29a749fe622f1d29242355b611bd4e45b0f098c2))


### Bug Fixes

* **booking:** POST принимает только валидный свободный слот - 400 вместо 201 ([822540f](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/822540f747f1ac42c622cd577f021c7daf9a17a0))
* **booking:** передавать инъецированное now в /api/meetings и удаление типа ([#13](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/issues/13)) ([891ab2c](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/891ab2c40cbe1e5e083d28769ba227ff4ed8f985))
* **booking:** сброс выбора слота и перезагрузка сетки только при 409 ([04ffb19](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/04ffb195982a51d64926c81792b870741d373cc0))
* **contract:** [@server](https://github.com/server) с относительным корнем - SDK строил неверный baseUrl ([e324456](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/e324456364807bb4367c6adb51a442e0bbcf2ca6))
* **contract:** 400 в контракте, общие модели полей, окно в описании слотов ([1fa3b11](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/1fa3b11068a820775aa862b39f168de71fe2accb))
* **deploy:** healthcheck по PORT; конфигурация MCP Render и порядок подключения ([#15](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/issues/15)) ([d22b7b8](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/d22b7b8371929682b59bd76c62eb5ae6d18a115e))
* **deploy:** строгий префикс /api в SPA-fallback ([ebc9001](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/ebc9001ea77089895c3f3463da1a04edb279684e))
* **panel:** typeTitle вычисляется при чтении, а не хранится в записи встречи ([866221f](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/866221ff574d63aead5a525492104b7e7bd8bdc8))
* **panel:** нормализация времени начала при записи и общий предикат предстоящей встречи ([0285aa3](https://github.com/noname093pxg1gq678/ai-for-developers-project-386/commit/0285aa3829141c5c84ba50d97255f57e970ee870))
