# node-registrify
> Fast, simple Service registry for Client-side service discovery in microservices system.

[![npm package](https://nodei.co/npm/node-registrify.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/node-registrify/)

The project using Nodejs and Hapi framework with Redis for storing info.

## Installation

``` bash
  $ [sudo] npm install node-registrify -g
```

## Usage
There are two ways to use node-registrify: through the command line or by using in your code.

### Command Line Usage
You can use node-registrify to run scripts continuously.

**Example**
```
node-registry --server-host localhost --server-port 8000
```

**Options**
```
  $ node-registrify --help
  Usage: node-registrify [options]
  
  options:
  -h, --help                 output usage information
  -V, --version              output the version number
  --server-host [value]      Host on which to listen to (defaults to localhost)
  --server-port [value]      Port on which to listen to (defaults to 8000)
  --redis-host [value]       Redis host (defaults to localhost)
  --redis-port [value]       Redis port (defaults to 6379)
  --redis-db [value]         Redis db (defaults to 0)
  --log-level [value]        Log level (defaults to "info")
  --log-max-entries [value]  Log max entries for a service (defaults to 10)
```

### Using In Your Code
``` js
const NodeRegistrify = require('node-registrify');

NodeRegistrify.init({
  api_host:   'localhost',
  api_port:   '8000',
  redis_host: 'localhost',
  redis_port: '6379',
  redis_db:   0,
  log_level: 'info',
  log_max_entries: 10
});

NodeRegistrify.run();
```

## REST APIs

#### Ping
```
curl -XGET /ping
```

#### Register a service
```
curl -XPUT -F "<meta_key>=<meta_value>"... /services/<service_name>/<host_name>
```

* Example Client PHP codes (with [guzzlehttp/guzzle](https://github.com/guzzle/guzzle)):
```php

$client = new HttpClient([
	'base_uri' => self::$serviceUrl,
	'timeout'  => self::REQUEST_TIMEOUT_SECONDS
]);

$client->put(sprintf('/services/%s/%s', $service, gethostname()), [
	'form_params' => [
	    'id' => 'redis',
		'pid' => getmypid(),
		'ip' => '192.168.1.2',
		'port' => 6379
	]
]);

```

#### Delete a service
```
curl -XDELETE /services/<service_name>/<host_name>
```

* Example Client PHP codes (with [guzzlehttp/guzzle](https://github.com/guzzle/guzzle)):
```php

$client = new HttpClient([
	'base_uri' => self::$serviceUrl,
	'timeout'  => self::REQUEST_TIMEOUT_SECONDS
]);

$client->delete(sprintf('/services/%s/%s', $service, gethostname()));

```

#### Send log to a service
```
curl -XPOST -H "Content-Type: text/html" -d "this is a log" /services/<service_name>/<host_name>/log
```

* Example Client PHP codes (with [guzzlehttp/guzzle](https://github.com/guzzle/guzzle)):
```php

$client = new HttpClient([
	'base_uri' => self::$serviceUrl,
	'timeout'  => self::REQUEST_TIMEOUT_SECONDS
]);

$client->post(sprintf('/services/%s/%s/log', $service, gethostname()), [
	'headers' => [
		'Content-type' => 'text/html; charset=utf-8',
	],
	'body' => $message
]);
```

#### List all services
```
curl -XGET /services
```

#### List all hosts
```
curl -XGET /hosts
```

#### List all services in given host
```
curl -XGET /services/<host_name>/services
```

#### Get info of given service in a host
```
curl -XGET /services/<service_name>/<host_name>
```

#### Get info of given service
```
curl -XGET /services/<service_name>
```

#### List all hosts in given service
```
curl -XGET /services/<service_name>/hosts
```

#### List all logs in given service
```
curl -XGET /services/<service_name>/<host_name>/logs
```
