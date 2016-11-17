const redis = require('redis');
const redisClient = redis.createClient();
const debug = require('debug')('app:retry-manager');
const async = require('async');

setInterval(() => {
    debug('Looking for items to retry-manager...');
    redisClient.multi()
        .zrangebyscore('retry_zset', 0, Date.now())
        .zremrangebyscore('retry_zset', 0, Date.now())
        .exec((err, replies) => {
            if (err) {
                console.error(`Redis Error: ${ e.message }`);
                console.error(err.stack);
                return;
            }
            const items = replies[0];
            debug(`Found ${ items.length } items...`);
            async.map(
                items,
                item => redisClient.rpush('queue_list', item),
                err => {
                    if (err) {
                        console.error('Error requeing retry items...');
                        console.error(`Redis Error: ${ e.message }`);
                        console.error(err.stack);
                        return;
                    }
                }
            );
        });
}, 1000);
