'use strict';

const redis = require('redis');
const redisClient = redis.createClient();
const debug = require('debug')('app:worker');
const retry = require('./retry');

const work = () => {
    debug('Looking for an item to work on...');
    redisClient.blpop('queue_list', 0, function(err, data) {
        if (!err) {
            let [ key, value ] = data;
            debug(`Found value ${ value }...`);
            retry(value);
            return work();
        }
        else {
            console.log('ERROR: Oops! Cannot retrieve item to work on...');
        }
    });
};

work();
