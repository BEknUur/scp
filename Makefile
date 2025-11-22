.PHONY: start-backend start-frontend

start-backend:
	docker compose up --build -d

start-frontend:
	cd frontend && npm run start -- --tunnel