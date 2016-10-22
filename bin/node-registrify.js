#!/usr/bin/env node

;(function () {
  var path = require('path');
  var pkg = require(path.join(__dirname, '../package.json'));
  var program = require('commander');

  program
    .version(pkg.version)
    .option('--server-host [value]', 'Host on which to listen to (defaults to localhost)')
    .option('--server-port [value]', 'Port on which to listen to (defaults to 8000)')
    .option('--redis-host [value]', 'Redis host (defaults to localhost)')
    .option('--redis-port [value]', 'Redis port (defaults to 6379)')
    .option('--redis-db [value]', 'Redis db (defaults to 0)')
    .option('--log-level [value]', 'Log level (defaults to "info")')
    .option('--log-max-entries [value]', 'Log max entries for a service (defaults to 10)')
    .parse(process.argv);

  const NodeRegistrify = require('../index.js');

  NodeRegistrify.init({
    api_host: program.serverHost,
    api_port: program.serverPort,
    redis_host: program.redisHost,
    redis_port: program.redisPort,
    redis_db: program.redisDb,
    log_level: program.logLevel,
    log_max_entries: program.logMaxEntries
  });

  NodeRegistrify.run();
})();