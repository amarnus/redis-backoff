'use strict';

const redis = require('redis');
const redisClient = redis.createClient();
const debug = require('debug')('app:retry');

module.exports = (item='') => {
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
