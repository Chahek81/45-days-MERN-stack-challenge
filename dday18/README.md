# Day 18 — API Deployment & Production (MERN)

This repository contains a production-ready API scaffold focused on deployment patterns: Docker, Docker Compose, and Kubernetes. The app is a small Express server with Prometheus metrics, health checks, and basic middleware.

## Quick overview
- App entry (dev): `src/index.js`
- Production bundle: `dist/index.js` (built by `npm run build`)
- Docker image: `day18-api:latest`
- Exposed port: `3000`
- Endpoints:
  - `/health` — health check
  - `/api/hello` — example API
  - `/metrics` — Prometheus metrics

## Prerequisites
- Node.js (>=16) and npm
- Docker (Desktop or Engine)
- Docker Compose or Docker Compose plugin
- kubectl and a Kubernetes cluster (optional)

## Local development
Install dependencies and run with hot-reload:

```powershell
npm install
npm run dev
# Open http://localhost:3000/health
```

Build and run production bundle locally:

```powershell
npm install
npm run build
npm start
```

## Docker
Build image (option A: npm script):

```powershell
npm run docker:build
# or directly
docker build -t day18-api:latest .
```

Run container:

```powershell
docker run --rm -p 3000:3000 --name day18-api `
  -e NODE_ENV=production -e PORT=3000 `
  day18-api:latest
```

## Docker Compose (production)
Start the production compose (api + redis):

```powershell
docker compose -f docker-compose.prod.yml up -d --build
# follow logs
docker compose -f docker-compose.prod.yml logs -f api
# stop
docker compose -f docker-compose.prod.yml down
```

## Kubernetes (local cluster)
Apply manifests:

```powershell
# If using a local k8s that can see local images (Docker Desktop) you can:
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Port-forward to access service at localhost:8080
kubectl port-forward svc/day18-api 8080:80
# then open http://localhost:8080/health
```

If using `kind`, load the image into the cluster after building:

```powershell
# build locally
docker build -t day18-api:latest .
# load into kind (replace cluster name if required)
kind load docker-image day18-api:latest --name kind
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

If deploying to a remote k8s cluster, push the image to a registry and update `k8s/deployment.yaml` image field.

## Troubleshooting
- Check container logs: `docker logs -f <container>` or `docker compose logs -f api`.
- K8s pod issues: `kubectl logs <pod>` and `kubectl describe pod <pod>`.
- Image pull errors: ensure the image is available to cluster (load to kind, use local-registry, or push to remote registry).

## Next steps (optional)
- Convert Dockerfile to multi-stage (done)
- Add GitHub Actions workflow to build/test/push images
- Add health-checking sidecars, Nginx ingress, and production-grade monitoring (ELK/Promtail/Prometheus)

---

If you want, I can:
- Commit a GitHub Actions workflow to build and publish the image (to Docker Hub or GHCR)
- Add a sample `k8s/ingress.yaml` and `nginx` config for reverse proxy
- Implement the middleware items from the todo (JWT scaffolding, Redis integration, validation)

Tell me which next step you'd like me to do and I'll implement it.