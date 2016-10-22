# node-registrify
> Fast, simple Service registry for building centralized logging in microservices system.

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
  api_host:   '',
  api_port:   '',
  redis_host: '',
  redis_port: '',
  redis_db:   '',
  log_level: '',
  log_max_entries: ''
});

NodeRegistrify.run();
```

## REST APIs

#### Ping
<pre>
curl -XGET /ping
</pre>

#### Register a service
<pre>
curl -XPUT -F "&lt;meta_key&gt;=&lt;meta_value>"... /services/&lt;service_name&gt;/&lt;host_name>
</pre>

* Example Client PHP codes ([guzzlehttp/guzzle](https://github.com/guzzle/guzzle)):
```php

$client = new HttpClient([
	'base_uri' => self::$serviceUrl,
	'timeout'  => self::REQUEST_TIMEOUT_SECONDS
]);

$client->put(sprintf('/services/%s/%s', $service, gethostname()), [
	'form_params' => [
		'pid' => getmypid()
	]
]);

```

#### Delete a service
<pre>
curl -XDELETE /services/&lt;service_name&gt;/&lt;host_name>
</pre>

* Example Client PHP codes ([guzzlehttp/guzzle](https://github.com/guzzle/guzzle)):
```php

$client = new HttpClient([
	'base_uri' => self::$serviceUrl,
	'timeout'  => self::REQUEST_TIMEOUT_SECONDS
]);

$client->delete(sprintf('/services/%s/%s', $service, gethostname()));

```

#### Send log to a service
<pre>
curl -XPOST -H "Content-Type: text/html" -d "this is a log" /services/&lt;service_name&gt;/&lt;host_name&gt;/log
</pre>

* Example Client PHP codes ([guzzlehttp/guzzle](https://github.com/guzzle/guzzle)):
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
<pre>
curl -XGET /services
</pre>

#### List all hosts
<pre>
curl -XGET /hosts
</pre>

#### List all services in given host
<pre>
curl -XGET /services/&lt;host_name&gt;/services
</pre>

#### Get info of given service
<pre>
curl -XGET /services/&lt;service_name&gt;/&lt;host_name>
</pre>

#### List all hosts in given service
<pre>
curl -XGET /services/&lt;service_name&gt;/hosts
</pre>

#### List all logs in given service
<pre>
curl -XGET /services/&lt;service_name&gt;/&lt;host_name&gt;/logs
</pre>
