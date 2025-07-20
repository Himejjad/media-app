# 🎵 Media Storage and Playback Application

A modern, scalable microservices-based application for uploading, storing, and playing media files (images and audio). Built with React, Node.js, and deployed on AWS infrastructure using containerization and orchestration technologies.

![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)
![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB)
![Backend](https://img.shields.io/badge/Backend-Node.js-339933)
![Database](https://img.shields.io/badge/Database-MongoDB-47A248)
![Storage](https://img.shields.io/badge/Storage-AWS%20S3-FF9900)
![Container](https://img.shields.io/badge/Container-Docker-2496ED)
![Orchestration](https://img.shields.io/badge/Orchestration-Kubernetes-326CE5)

## 🚀 Features

- **📸 Media Upload**: Upload images and audio files through an intuitive React interface
- **🎵 Audio Playback**: Stream and play audio files directly in the browser
- **🖼️ Image Display**: View uploaded images with thumbnail previews
- **☁️ Cloud Storage**: Secure file storage using AWS S3 with public read access
- **📊 Metadata Management**: Store and retrieve file metadata using MongoDB
- **🔄 Real-time Updates**: Automatic refresh of media library after uploads
- **🐳 Containerized**: Fully containerized application with Docker
- **☸️ Kubernetes Ready**: Production-ready Kubernetes deployments
- **📈 Monitoring**: Prometheus integration for application monitoring
- **🏗️ Infrastructure as Code**: Terraform configurations for AWS resources

## 🏛️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│  (Node.js)      │◄──►│   (MongoDB)     │
│   Port: 80      │    │   Port: 3000    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │   File Storage  │
         │              │    (AWS S3)     │
         │              └─────────────────┘
         │
         ▼
┌─────────────────┐
│   Monitoring    │
│  (Prometheus)   │
└─────────────────┘
```

### Components Overview

- **Frontend**: React application served via Nginx, handles file uploads and media display
- **Backend**: Express.js API server with MongoDB integration and AWS S3 file handling
- **Database**: MongoDB for storing media metadata and application data
- **Storage**: AWS S3 bucket for secure and scalable file storage
- **Infrastructure**: AWS EKS cluster with VPC, subnets, and managed node groups

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | React 18, Axios | User interface and API communication |
| **Backend** | Node.js, Express.js | REST API and business logic |
| **Database** | MongoDB, Mongoose | Data persistence and metadata storage |
| **File Storage** | AWS S3 | Scalable media file storage |
| **Containerization** | Docker | Application packaging |
| **Orchestration** | Kubernetes | Container orchestration |
| **Infrastructure** | Terraform | Infrastructure as Code |
| **Monitoring** | Prometheus | Application metrics and monitoring |
| **Web Server** | Nginx | Static file serving and reverse proxy |

## 📋 Prerequisites

Before running this application, ensure you have:

- **Docker & Docker Compose** (for local development)
- **Node.js 16+** (for local development without Docker)
- **AWS Account** (for S3 storage and EKS deployment)
- **MongoDB Atlas Account** or local MongoDB instance
- **kubectl** (for Kubernetes deployment)
- **Terraform** (for infrastructure provisioning)

## 🚀 Quick Start

### Local Development with Docker Compose

1. **Clone the repository**
   ```bash
   git clone https://github.com/Himejjad/media-app.git
   cd media-app
   ```

2. **Configure environment variables**
   ```bash
   # Create .env file with your credentials
   cp .env.example .env
   # Edit .env with your MongoDB URI, AWS credentials, and S3 bucket name
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:3000
   - MongoDB: localhost:27017

### Local Development without Docker

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## ☸️ Production Deployment

### AWS Infrastructure Setup

1. **Deploy AWS resources with Terraform**
   ```bash
   cd terraform
   terraform init
   terraform plan
   terraform apply
   ```

   This creates:
   - VPC with public/private subnets
   - EKS cluster with managed node groups
   - S3 bucket for media storage
   - Security groups and IAM roles

2. **Configure kubectl**
   ```bash
   aws eks update-kubeconfig --region us-east-1 --name media-app-cluster
   ```

3. **Deploy to Kubernetes**
   ```bash
   kubectl apply -f kubernetes/backend-deployment.yaml
   kubectl apply -f kubernetes/frontend-deployment.yaml
   ```

4. **Get LoadBalancer URL**
   ```bash
   kubectl get services frontend
   ```

## 📡 API Documentation

### Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/media` | Retrieve all media files | None | Array of media objects |
| POST | `/media` | Upload a new media file | FormData with 'file' field | Media object with S3 URL |

### Example Requests

**Get all media files:**
```bash
curl -X GET http://localhost:3000/media
```

**Upload a media file:**
```bash
curl -X POST \
  -F "file=@path/to/your/file.jpg" \
  http://localhost:3000/media
```

### Response Format

```json
{
  "_id": "64a1b2c3d4e5f6789012345",
  "name": "example.jpg",
  "url": "https://s3.amazonaws.com/bucket/1234567890-example.jpg",
  "type": "image",
  "createdAt": "2023-07-20T10:30:00.000Z"
}
```

## 📊 Monitoring

The application includes Prometheus monitoring configuration:

- **Metrics endpoint**: Backend exposes metrics on port 3000
- **Prometheus config**: Located in `prometheus.yml`
- **Grafana integration**: Can be added for visualization

To access monitoring:
```bash
# Deploy Prometheus to Kubernetes
kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/bundle.yaml
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | None |
| `AWS_ACCESS_KEY_ID` | AWS access key | Yes | None |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | Yes | None |
| `S3_BUCKET` | S3 bucket name | Yes | None |
| `PORT` | Backend server port | No | 3000 |

### Docker Compose Override

Create a `docker-compose.override.yml` for local customization:

```yaml
version: '3.8'
services:
  backend:
    environment:
      - NODE_ENV=development
    volumes:
      - ./backend:/app
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 Development

### Project Structure
```
media-app/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── index.js        # Main server file
│   │   └── routes/
│   │       └── media.js    # Media routes
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   └── index.js       # React entry point
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── kubernetes/             # K8s deployment files
├── terraform/              # Infrastructure as Code
├── docker-compose.yml      # Local development
└── prometheus.yml         # Monitoring configuration
```

### Adding New Features

1. **Backend**: Add new routes in `backend/src/routes/`
2. **Frontend**: Create new components in `frontend/src/components/`
3. **Database**: Update schemas in `backend/src/models/`

## 🚨 Security Considerations

⚠️ **Important**: This is a demo application. For production use:

- Use AWS Secrets Manager or Kubernetes Secrets for credentials
- Implement authentication and authorization
- Add input validation and sanitization
- Enable HTTPS/TLS
- Implement rate limiting
- Add CORS configuration
- Use environment-specific configurations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have any questions or need help:

- Create an [Issue](https://github.com/Himejjad/media-app/issues)
- Check the [Wiki](https://github.com/Himejjad/media-app/wiki) for detailed documentation
- Contact: [your-email@example.com]

## 🔗 Related Resources

- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [React Documentation](https://reactjs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

Made with ❤️ by [Himejjad](https://github.com/Himejjad)
