<div align="center">
  <img src="logo.png" alt="worktop" height="220" />
</div>

<div align="center">
  <a href="https://npmjs.org/package/kleur">
    <img src="https://badgen.now.sh/npm/v/kleur" alt="version" />
  </a>
  <a href="https://github.com/lukeed/kleur/actions?query=workflow%3ACI">
    <img src="https://github.com/lukeed/kleur/workflows/CI/badge.svg?event=push" alt="CI" />
  </a>
  <a href="https://npmjs.org/package/kleur">
    <img src="https://badgen.now.sh/npm/dm/kleur" alt="downloads" />
  </a>
  <a href="https://packagephobia.now.sh/result?p=kleur">
    <img src="https://packagephobia.now.sh/badge?p=kleur" alt="install size" />
  </a>
</div>

<div align="center">The next generation web framework for Cloudflare Workers</div>

## Features

* Super [lightweight](https://npm.anvaka.com/#/view/2d/worktop)
* First-class TypeScript support
* Custom Middleware Support<sup>*</sup>
* Well-organized submodules for à la carte functionality<sup>*</sup>
* Includes Router with all pattern definitions
* Familiar Request-Response handler API
* Supports `async`/`await` handlers
* Fully treeshakable

> <sup>*</sup>_Work In Progress! (ASAP)_

## Install

```
$ npm install --save worktop
```

## Usage

> Check out [`/examples`](/examples) for a list of working demos!

```ts
import { Router } from 'worktop';
import { uid as toUID } from 'uid';
import { read, write } from 'worktop/kv';
import type { KV } from 'worktop/kv';

declare var DATA: KV.Namespace;

interface Message {
  id: string;
  text: string;
  // ...
}

// Initialize
const API = new Router();


API.add('GET', '/messages/:id', async (req, res) => {
	// Pre-parsed `req.params` object
	const key = `messages::${req.params.id}`;

	// Assumes JSON (can override)
	const message = await read<Message>(DATA, key);

	// Alter response headers directly
	res.setHeader('Cache-Control', 'public, max-age=60');

	// Smart `res.send()` helper
	// ~> automatically stringifies JSON objects
	// ~> auto-sets `Content-Type` & `Content-Length` headers
	res.send(200, message);
});


API.add('POST', '/messages', async (req, res) => {
	try {
		// Smart `req.body` helper
		// ~> parses JSON header as JSON
		// ~> parses form-like header as FormData, ...etc
		var input = await req.body<Message>();
	} catch (err) {
		return res.send(400, 'Error parsing request body');
	}

	if (!input || !input.text.trim()) {
		return res.send(422, { text: 'required' });
	}

	const value: Message = {
		id: toUID(16),
		text: input.text.trim(),
		// ...
	};

	// Assumes JSON (can override)
	const key = `messages::${value.id}`;
	const success = await write<Message>(DATA, key, value);
	//    ^ boolean

	// Alias for `event.waitUntil`
	// ~> setup background task (does NOT delay response)
	req.extend(
		fetch('https://.../logs', {
			method: 'POST',
			headers: { 'content-type': 'application/json '},
			body: JSON.stringify({ success, value })
		})
	);

	if (success) res.send(201, value);
	else res.send(500, 'Error creating record');
});


API.add('GET', '/alive', (req, res) => {
	res.end('OK'); // Node.js-like `res.end`
});


// Attach "fetch" event handler
// ~> uses `Cache` for request-matching, when permitted
addEventListener('fetch', API.listen);
```

## API

### Module: `worktop`

> [View `worktop` API documentation](/src/router.d.ts)
<!-- > [View `worktop` API documentation](/docs/module.router.md) -->

The main module – focused on routing. <br>This is core of most applications. Exports the `Router` class.

### Module: `worktop/kv`

> [View `worktop/kv` API documentation](/src/kv.d.ts)
<!-- > [View `worktop/kv` API documentation](/docs/module.kv.md) -->

The `worktop/kv` submodule contains all classes and utilities related to [Workers KV](https://www.cloudflare.com/products/workers-kv/).

### Module: `worktop/cache`

> [View `worktop/cache` API documentation](/src/cache.d.ts)
<!-- > [View `worktop/cache` API documentation](/docs/module.cache.md) -->

The `worktop/cache` submodule contains all utilities related to [Cloudflare's Cache](https://developers.cloudflare.com/workers/learning/how-the-cache-works).

### Module: `worktop/request`

> [View `worktop/request` API documentation](/src/request.d.ts)
<!-- > [View `worktop/request` API documentation](/docs/module.request.md) -->

The `worktop/request` submodule contains the `ServerRequest` class, which provides an interface similar to the request instance(s) found in most other Node.js frameworks.

> **Note:** This module is used internally and will (very likely) never be imported by your application.

### Module: `worktop/response`

> [View `worktop/response` API documentation](/src/response.d.ts)
<!-- > [View `worktop/response` API documentation](/docs/module.response.md) -->

The `worktop/response` submodule contains the `ServerResponse` class, which provides an interface similar to the [`IncomingMessage`](https://nodejs.org/api/http.html#http_class_http_incomingmessage) (aka, "response") object that Node.js provides.

> **Note:** This module is used internally and will (very likely) never be imported by your application.


## License

MIT © [Luke Edwards](https://lukeed.com)
