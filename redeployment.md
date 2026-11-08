# Redeploy Card Wars

For an already configured VPS. For first-time setup, see [deployment.md](deployment.md).

## 1. Build and upload locally

From the project root with Docker running:

```powershell
npm run package
npm run send
```

Run `npm run send` only after packaging succeeds. It uploads the images, Compose file, environment template, and SQL files to `cwtcg:~/cardwars/`.

## 2. Update the VPS

```bash
ssh cwtcg
cd ~/cardwars
sudo docker load -i cte-linux-amd64.tar
sudo docker compose up -d --no-build --pull never --wait
```

Compose replaces containers whose images or configuration changed. Expect a brief interruption while they restart.

## 3. Verify

```bash
sudo docker compose ps
curl --fail https://cwtcg.online/api/health
```

Open **https://cwtcg.online** and check the updated app. If startup fails:

```bash
sudo docker compose logs --tail=100
```

## Keep existing configuration and data

- Keep the VPS `.env`; do not copy `.env.example` over it. Add new variables only when an update requires them.
- Keep the existing HTTPS certificates and renewal setup; there is no need to request certificates again.
- Do not run `docker compose down -v`; it deletes the database volume.
- Uploaded SQL initialization files do not modify an existing database. Back up the database before schema changes and apply migrations separately.
