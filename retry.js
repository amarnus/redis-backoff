'use strict';

// const debug = require('debug')('app:retry');

/* options
redis_client: redisClient,
retry_zset: retry_zset name,
max_retries: number of tries after which the item will be discarded,
requeue_at: function(retry_count) - given the retry_count returns the offset in ms
extract_retry_count: function(item) - given a raw item, returns the number of times the item has been tried
append_retry_count_info: given the item and retry_count, return a modified item (stringified) that should into redis ()
*/
function retry(item, options) {
    options = options || {};
    // throw error if item or redisClient or retry_zset are not provided
    options.max_retries = options.max_retries || 5;
    if (!options.requeue_at) {
      options.requeue_at = (retryCount) => {
        return Date.now() + (Math.pow(2, retryCount) * 1000);
      }
    }
    if (!options.extract_retry_count) {
      options.extract_retry_count = (item) => {
        let [ rawItem, retryCount ] = item.split(';');
        return retryCount || 0;
      }
    }
    if (!options.append_retry_count_info) {
      options.append_retry_count_info = (rawItem, retryCount) => {
        return `${ rawItem };${ ++retryCount }`;
      }
    }
    const retryCount = options.extract_retry_count(item);
    if (retryCount < options.max_retries) {
        const requeueAt = options.requeue_at(retryCount);
        console.log(requeueAt);
        options.redis_client.zadd(options.retry_zset, requeueAt, options.append_retry_count_info(item, retryCount));
    }
    else {
        debug(`Discarding item ${ rawItem }...`);
    }
};

module.exports = retry;

// Example usage

const redis = require('redis');

retry('myTask1', {
  redis_client: redis.createClient(),
  retry_zset: 'retry_zset',
  max_retries: 5,
  extract_retry_count: function(item) {
    return 3;
  }
});
