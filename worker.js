'use strict';

const redis = require('redis');
const redisClient = redis.createClient();
const debug = require('debug')('app:work');

const retry = (item='') => {
    let [ rawItem, retryCount ] = item.split(';');
    retryCount = retryCount || 1;
    if (retryCount <= 5) {
        const offset = Math.pow(2, retryCount);
        const requeueAt = Date.now() + (offset * 1000);
        redisClient.zadd('retry_zset', requeueAt, `${ rawItem };${ ++retryCount }`);
    }
    else {
        debug(`Discarding item ${ rawItem }...`);
    }
};

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
