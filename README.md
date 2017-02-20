# swagger-updater [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> update swagger spec file

## Installation

```sh
$ npm install --save swagger-updater
```

## Usage

```js
var updater = require('swagger-updater');

updater({definitions: {...}, paths: {...}}, { filePath: /* relative path to swagger file, defualt to './api/swagger/swagger.yaml' */});
```

## Caveats
- Only support .yaml for now.
- Untested :(

## License

MIT © [Tran Trung Tin]()


[npm-image]: https://badge.fury.io/js/swagger-updater.svg
[npm-url]: https://npmjs.org/package/swagger-updater
[travis-image]: https://travis-ci.org/trungtin/swagger-updater.svg?branch=master
[travis-url]: https://travis-ci.org/trungtin/swagger-updater
[daviddm-image]: https://david-dm.org/trungtin/swagger-updater.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/trungtin/swagger-updater
[coveralls-image]: https://coveralls.io/repos/trungtin/swagger-updater/badge.svg
[coveralls-url]: https://coveralls.io/r/trungtin/swagger-updater
