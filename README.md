# Clipps API

Requirements:
- node >= 14.17 ([nodenv recommended](https://github.com/nodenv/nodenv))
- npm >= 6.14

Install dependencies

```shell
$ yarn
```

Create `.env` file with this config:

### `.env`

```
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
APP_KEY=development-app-key-not-for-prod
DRIVE_DISK=local
DB_CONNECTION=pg
PG_HOST=localhost
PG_PORT=5432
PG_USER=lucid
PG_PASSWORD=
PG_DB_NAME=lucid
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CACHE_VIEWS=
```

Run the project

```shell
$ node ace serve --watch
```

More about adonisjs: https://docs.adonisjs.com/guides/introduction

## Database

### Setup

```shell
# run migrations
$ node ace migration:run

# optional: run seeder
$ node ace db:seed
```

## Environments

| environment | url                    |
| --- |------------------------|
| development | http://127.0.0.1:3333  |
| production | https://api.clipps.io/ |

---

Copyright &copy; 2022, TepacheLabs
