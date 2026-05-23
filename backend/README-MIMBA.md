# MIMBA Laravel API

API base URL:

```text
http://localhost:8000/api
```

Local setup:

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8000
```

MySQL defaults in `.env.example`:

```text
DB_CONNECTION=mysql
DB_DATABASE=mimba
DB_USERNAME=root
DB_PASSWORD=
```

Create the `mimba` database in MySQL before running migrations.
