# Media Storage and Playback Application

A microservices-based app for storing pictures/songs and playing songs.

## Features
- Upload media via React.
- Store in S3, metadata in MongoDB.
- Play songs.
- CI/CD, Terraform, Docker, Kubernetes, Prometheus.

## Setup
1. Clone: `git clone <repo-url>`.
2. Local: `docker-compose up --build`.
3. AWS: Follow Terraform/Kubernetes steps.

## Architecture
- Frontend: React on EKS.
- Backend: Node.js/Express.
- Storage: S3, MongoDB.
- CI/CD: GitHub Actions.
- Monitoring: Prometheus.

## Usage
- Access: `http://<frontend-url>`.
- API: `/media` (GET, POST).

## License
MIT
