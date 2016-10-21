# node-registrify
> Fast, simple Service registry for building centralized logging in microservices system.

[![npm package](https://nodei.co/npm/node-registrify.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/node-registrify/)

The project using Nodejs and Hapi framework with Redis for storing info.

### Running project

You need to have installed Node.js and MongoDB 

### Install 

To install enter project folder and run following command:
```
cp .env.example .env
npm install
```

### Config

Edit environment-specific variables in .env file
<pre>
LOG_LEVEL=debug // Log level for bunyan
API_HOST=0.0.0.0 // Server host
API_PORT=60000 // Server port
REDIS_HOST=127.0.0.1 
REDIS_PORT=6379 
REDIS_DB=0 
LOG_MAX_ENTRIES=10 // Max entries for logging in a service
</pre>

### Run server

To run server execute:
```
npm start
```

### REST APIs

##### Ping to server
<pre>
GET /ping
</pre>

##### Register a service
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

##### Delete a service
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

##### Send log to a service
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

##### List all services
<pre>
curl -XGET /services
</pre>

##### List all hosts
<pre>
curl -XGET /hosts
</pre>

##### List all services in given host
<pre>
curl -XGET /services/&lt;host_name&gt;/services
</pre>

##### Get info of given service
<pre>
curl -XGET /services/&lt;service_name&gt;/&lt;host_name>
</pre>

##### List all hosts in given service
<pre>
curl -XGET /services/&lt;service_name&gt;/hosts
</pre>

##### List all logs in given service
<pre>
curl -XGET /services/&lt;service_name&gt;/&lt;host_name&gt;/logs
</pre>
