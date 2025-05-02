#!/bin/bash

# Create project root directory
# mkdir -p media-app
# cd media-app

# Create all subdirectories
mkdir -p frontend/src backend/src/routes kubernetes terraform .github/workflows

# Create root files
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/media
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - S3_BUCKET=media-app-bucket
    depends_on:
      - mongo
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
volumes:
  mongo-data:
EOF

cat > prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['backend:3000']
EOF

cat > README.md << 'EOF'
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
EOF

# Create frontend files
cat > frontend/package.json << 'EOF'
{
  "name": "frontend",
  "version": "1.0.0",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "axios": "^1.4.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  }
}
EOF

cat > frontend/Dockerfile << 'EOF'
FROM node:16 AS build
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

cat > frontend/src/App.js << 'EOF'
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [media, setMedia] = useState([]);
  const [file, setFile] = useState(null);
  const [playing, setPlaying] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3000/media')
      .then(res => setMedia(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);
    await axios.post('http://localhost:3000/media', formData);
    const res = await axios.get('http://localhost:3000/media');
    setMedia(res.data);
    setFile(null);
  };

  const playSong = (url) => {
    if (playing) playing.pause();
    const audio = new Audio(url);
    audio.play();
    setPlaying(audio);
  };

  return (
    <div>
      <h1>Media App</h1>
      <input type="file" accept="image/*,audio/*" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={!file}>Upload</button>
      <h2>Media List</h2>
      <ul>
        {media.map(item => (
          <li key={item._id}>
            {item.type === 'image' ? (
              <img src={item.url} alt={item.name} width="100" />
            ) : (
              <button onClick={() => playSong(item.url)}>{item.name}</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
EOF

cat > frontend/src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
EOF

# Create backend files
cat > backend/package.json << 'EOF'
{
  "name": "backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node src/index.js",
    "test": "echo 'No tests specified' && exit 0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.4.0",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "aws-sdk": "^2.1390.0"
  }
}
EOF

cat > backend/Dockerfile << 'EOF'
FROM node:16
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
EOF

cat > backend/src/index.js << 'EOF'
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const mediaRoutes = require('./routes/media');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/media', mediaRoutes);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'));

app.listen(3000, () => console.log('Backend running on port 3000'));
EOF

cat > backend/src/routes/media.js << 'EOF'
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const AWS = require('aws-sdk');

const upload = multer({ storage: multer.memoryStorage() });
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const mediaSchema = new mongoose.Schema({
  name: String,
  url: String,
  type: String,
  createdAt: { type: Date, default: Date.now }
});
const Media = mongoose.model('Media', mediaSchema);

router.get('/', async (req, res) => {
  const media = await Media.find();
  res.json(media);
});

router.post('/', upload.single('file'), async (req, res) => {
  const file = req.file;
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: `${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ACL: 'public-read',
  };
  const result = await s3.upload(params).promise();
  const media = new Media({
    name: file.originalname,
    url: result.Location,
    type: file.mimetype.startsWith('image') ? 'image' : 'audio',
  });
  await media.save();
  res.json(media);
});

module.exports = router;
EOF

# Create Kubernetes files
cat > kubernetes/frontend-deployment.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: DOCKER_USERNAME/media-app-frontend:latest
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
EOF

cat > kubernetes/backend-deployment.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: DOCKER_USERNAME/media-app-backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: MONGODB_URI
          value: "YOUR_MONGODB_ATLAS_URI"
        - name: AWS_ACCESS_KEY_ID
          value: "YOUR_AWS_ACCESS_KEY_ID"
        - name: AWS_SECRET_ACCESS_KEY
          value: "YOUR_AWS_SECRET_ACCESS_KEY"
        - name: S3_BUCKET
          value: "media-app-bucket-us-east-1"
---
apiVersion: v1
kind: Service
metadata:
  name: backend
spec:
  selector:
    app: backend
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
EOF

# Create Terraform files
cat > terraform/main.tf << 'EOF'
provider "aws" {
  region = var.region
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"
  name    = "media-app-vpc"
  cidr    = "10.0.0.0/16"
  azs     = ["${var.region}a", "${var.region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  enable_nat_gateway = true
  single_nat_gateway = true
}

module "eks" {
  source          = "terraform-aws-modules/eks/aws"
  version         = "19.15.3"
  cluster_name    = "media-app-cluster"
  cluster_version = "1.27"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets
  eks_managed_node_groups = {
    default = {
      min_size     = 1
      max_size     = 3
      desired_size = 2
      instance_types = ["t3.medium"]
    }
  }
}

resource "aws_s3_bucket" "media" {
  bucket = "media-app-bucket-${var.region}"
}

resource "aws_s3_bucket_ownership_controls" "media" {
  bucket = aws_s3_bucket.media.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "media" {
  bucket                  = aws_s3_bucket.media.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "media" {
  bucket = aws_s3_bucket.media.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.media.arn}/*"
      }
    ]
  })
}
EOF

cat > terraform/variables.tf << 'EOF'
variable "region" {
  default = "us-east-1"
}
EOF

cat > terraform/outputs.tf << 'EOF'
output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "s3_bucket_name" {
  value = aws_s3_bucket.media.bucket
}
EOF

# Create GitHub Actions file
cat > .github/workflows/ci-cd.yml << 'EOF'
name: CI/CD Pipeline
on:
  push:
    branches:
      - main
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
      - name: Install frontend dependencies
        run: cd frontend && npm install
      - name: Build frontend
        run: cd frontend && npm run build
      - name: Test backend
        run: cd backend && npm install && npm test
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      - name: Build and push Docker images
        run: |
          docker build -t ${DOCKER_USERNAME}/media-app-frontend:latest ./frontend
          docker build -t ${DOCKER_USERNAME}/media-app-backend:latest ./backend
          docker push ${DOCKER_USERNAME}/media-app-frontend:latest
          docker push ${DOCKER_USERNAME}/media-app-backend:latest
        env:
          DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
      - name: Deploy to EKS
        run: |
          aws eks update-kubeconfig --region us-east-1 --name media-app-cluster
          kubectl apply -f kubernetes/
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
.env
EOF

echo "All directories and files created successfully in media-app/!"