# Upload the packaged images and deployment files using the cwtcg SSH alias.
send:
	ssh cwtcg "mkdir -p ~/cardwars/backend"
	scp cte-linux-amd64.tar docker-compose.yaml .env.example cwtcg:~/cardwars/
	scp -r backend/sql cwtcg:~/cardwars/backend/
