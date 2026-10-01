# Package CardWars for Linux AMD64

From the repository root, run:

```sh
npm run package
```

Requires npm, bsdtar (the `tar` included with Windows and macOS), Docker Engine
28 or newer (API 1.48+), and Buildx. GNU tar does not support the `@archive`
syntax used here; on Linux, use bsdtar for the packaging command.
Docker Desktop must use Linux containers. Building needs internet access for
base images and npm packages that are not already cached. Packaging does not
require a `.env` file or running containers.

The command builds and loads `cardwars-api:latest` and `cardwars-web:latest` for
`linux/amd64`, pulls that platform's `postgres:18-alpine`, then saves all three
images to **`cte-linux-amd64.tar.gz`** in the repository root. Windows' built-in
tar handles gzip compression, so a separate gzip installation is unnecessary.

All packaging commands are defined directly in `package.json`. Docker first
writes a temporary `cte-linux-amd64.tar`; `tar -czf` repacks its entries using
`@cte-linux-amd64.tar`, keeping the image manifest at the archive root so Docker
can load it directly. A short inline Node command removes the uncompressed
file after success. Allow disk space for both files while packaging. Both files
are excluded from Git and Docker builds.

The archive contains Docker images only. It does not include database data,
credentials, Compose configuration, or SQL files. Packaging updates the local
image tags but does not restart running containers. Packaging overwrites the
previous archive. The command prints the tar version before starting the builds.

## Load and run on the destination

Copy these files to the destination, preserving the paths shown:

```text
cte-linux-amd64.tar.gz
docker-compose.yaml
.env.example
backend/sql/databases.sql
backend/sql/schema.sql
backend/sql/data.sql
```

Create a root `.env` from `.env.example` and set separate random values for
`POSTGRES_PASSWORD` and `SECRET`. Configure `APP_ORIGIN`, `WEB_PORT`, and
`WEB_BIND_ADDRESS` for that machine. The default URL is `http://localhost:8080`;
public deployment requires HTTPS because authentication cookies are Secure.

From that directory on a Linux AMD64 Docker host, run:

```sh
docker load -i cte-linux-amd64.tar.gz
docker compose up -d --no-build --pull never --wait
```

No Dockerfile or application source is needed on the destination. The explicit
image names in Compose match the tags restored by `docker load`. The PostgreSQL
volume persists across `docker compose down`; adding `-v` deletes that data.
SQL scripts initialize only a new database. Existing database contents are not
transferred by this package. Active games still live in API process memory.

Docker documents [saving selected image platforms](https://docs.docker.com/reference/cli/docker/image/save/)
and [loading compressed image archives](https://docs.docker.com/reference/cli/docker/image/load/).
The [bsdtar manual](https://man.freebsd.org/cgi/man.cgi?query=bsdtar&sektion=1)
documents the `@archive` syntax for copying entries into a compressed archive.
