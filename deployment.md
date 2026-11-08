# Deploy Card Wars

Use a fresh **Ubuntu 24.04 x86_64/amd64 VPS**. Your local SSH alias `cwtcg` must connect to a user with `sudo` access. Replace `YOUR_EMAIL` below. Deployment files live in that user's `~/cardwars` directory.

## 1. Point your domain at the VPS

Set DNS **A records** for `cwtcg.online` and `www.cwtcg.online` to the VPS IP. Remove stale AAAA records unless IPv6 also reaches this server. Allow inbound TCP **22, 80, and 443** in your VPS provider's firewall.

For a different domain, replace `cwtcg.online` in `docker/nginx.conf` **before packaging**, and use your domain in the certificate command and `APP_ORIGIN` below.

## 2. Install Docker on the VPS

```bash
ssh cwtcg
sudo apt update
sudo apt install -y docker.io docker-compose-v2 certbot openssl curl ufw nano
sudo systemctl enable --now docker
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

Ubuntu provides the [Docker Compose v2 package](https://packages.ubuntu.com/noble/docker-compose-v2). Node.js is only needed on your local computer.

## 3. Package and upload from your computer

With Node.js and Docker installed locally and Docker running, execute these commands from the project root in a local terminal:

```powershell
npm run package
npm run send
```

The package command produces **`cte-linux-amd64.tar`**, including the API, frontend/assets, and PostgreSQL images. `npm run send` creates `~/cardwars/backend` and uploads the archive, Compose file, `.env.example`, and SQL directory. It does not build images, replace the server's `.env`, or start containers.

## 4. Configure the VPS

Back in your VPS SSH session:

```bash
cd ~/cardwars
sudo docker load -i cte-linux-amd64.tar
cp .env.example .env
chmod 600 .env
openssl rand -hex 32
openssl rand -hex 32
nano .env
```

Set `POSTGRES_PASSWORD` and `SECRET` to the two different generated values. Set `APP_ORIGIN=https://cwtcg.online` without a trailing slash. Keep the other defaults. This is the **root `.env`**, not `backend/.env`.

## 5. Get an HTTPS certificate

Wait until both DNS names resolve to this VPS, then run:

```bash
sudo certbot certonly --standalone --cert-name cwtcg.online \
  -d cwtcg.online -d www.cwtcg.online \
  --email YOUR_EMAIL --agree-tos --non-interactive
```

Do this **before starting the containers**: Certbot needs port 80, and Nginx requires the certificate files to start.

## 6. Start and verify

```bash
cd ~/cardwars
sudo docker compose up -d --no-build --pull never --wait
sudo docker compose ps
curl --fail https://cwtcg.online/api/health
```

Open **https://cwtcg.online**. If startup fails, run `sudo docker compose logs --tail=100`. PostgreSQL initializes from the uploaded SQL files on its first start and stores data in a persistent Docker volume.

## 7. Enable certificate renewal

Configure [Certbot renewal hooks](https://eff-certbot.readthedocs.io/en/stable/using.html#renewing-certificates) to briefly stop the web container for validation and restart it afterward:

```bash
sudo tee -a /etc/letsencrypt/cli.ini > /dev/null <<EOF
pre-hook = docker compose --project-directory "$HOME/cardwars" -f "$HOME/cardwars/docker-compose.yaml" stop web
post-hook = docker compose --project-directory "$HOME/cardwars" -f "$HOME/cardwars/docker-compose.yaml" start web
EOF
sudo systemctl enable --now certbot.timer
sudo certbot renew --dry-run
```

## Deploy updates

Run `npm run package` followed by `npm run send` locally. Then on the VPS:

```bash
cd ~/cardwars
sudo docker load -i cte-linux-amd64.tar
sudo docker compose up -d --no-build --pull never --wait
```

Keep the existing `.env` and database volume. **Do not run `docker compose down -v`**; it deletes the database. Changed initialization SQL does not update an existing database; apply schema migrations separately.
