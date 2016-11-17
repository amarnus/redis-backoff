# redis-backoff

![Demo](screenshot.png)

## Setup

```shell
$ yarn install
$ DEBUG=app:*
$ node retry-manager.js
$ node worker.js
$ redis-cli rpush queue_list my_item
```
