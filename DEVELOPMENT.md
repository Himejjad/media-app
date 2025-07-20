# 🎵 Media Storage & Playback - Development Guide

## 🚀 Quick Start

1. **Clone and Setup**
   ```bash
   git clone <your-repo-url>
   cd media-app
   ./setup.sh
   ```

2. **Manual Setup (if needed)**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   
   # Edit .env with your AWS credentials
   # Start services
   docker-compose up --build
   ```

## 🔧 Development Commands

### Docker Commands
```bash
# Start all services
docker-compose up

# Start with rebuild
docker-compose up --build

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Restart specific service
docker-compose restart [service-name]

# Clean restart (removes volumes)
docker-compose down -v && docker-compose up --build
```

### Local Development (without Docker)

#### Backend
```bash
cd backend
npm install
npm run dev  # Uses nodemon for auto-reload
```

#### Frontend
```bash
cd frontend
npm install
npm start    # Development server with hot reload
```

## 🏗️ Project Structure

```
media-app/
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── App.js             # Main component with Material-UI
│   │   └── index.js           # App entry point
│   ├── public/
│   ├── nginx.conf             # Production Nginx config
│   └── Dockerfile
├── backend/                    # Node.js backend
│   ├── src/
│   │   ├── index.js           # Express server
│   │   ├── routes/            # API routes
│   │   ├── models/            # Database models
│   │   ├── middleware/        # Custom middleware
│   │   └── utils/             # Utility functions
│   └── Dockerfile
├── kubernetes/                 # K8s deployment files
├── terraform/                  # Infrastructure as Code
├── docker-compose.yml          # Local development
└── setup.sh                   # Automated setup script
```

## 🎨 Frontend Features

### Modern UI/UX
- **Material-UI** components for professional design
- **Responsive design** works on all devices
- **Drag & drop** file upload interface
- **Real-time feedback** with snackbar notifications
- **Animations** with Framer Motion
- **Loading states** and progress indicators

### Key Components
- **Statistics Dashboard**: Visual overview of media files
- **Media Grid**: Responsive grid layout for files
- **Upload Dialog**: Modal with drag-and-drop functionality
- **Audio Player**: Built-in audio playback controls
- **Image Gallery**: Optimized image display

## 🚀 Backend Features

### Professional Architecture
- **Express.js** with proper middleware stack
- **Security**: Helmet, CORS, rate limiting
- **Validation**: Joi schema validation
- **Error Handling**: Centralized error management
- **Logging**: Morgan HTTP request logging
- **Compression**: Gzip compression enabled

### API Endpoints
- `GET /media` - List all media (with pagination)
- `POST /media` - Upload media files (multi-file support)
- `GET /media/:id` - Get specific media file
- `DELETE /media/:id` - Delete media file
- `GET /media/stats/summary` - Media statistics
- `GET /health` - Health check endpoint

### Advanced Features
- **Image Processing**: Sharp integration for optimization
- **File Validation**: Type, size, and security checks
- **S3 Integration**: Secure cloud storage
- **Database Indexing**: Optimized MongoDB queries
- **Multi-file Upload**: Handle multiple files simultaneously

## 🔐 Security Features

### Backend Security
- **Helmet.js**: Security headers
- **Rate Limiting**: Prevent abuse
- **File Validation**: Strict file type checking
- **Input Sanitization**: Clean user inputs
- **Error Handling**: No sensitive data exposure

### Infrastructure Security
- **Non-root containers**: Docker security best practices
- **Health checks**: Container monitoring
- **Resource limits**: Prevent resource exhaustion

## 📊 Monitoring

### Health Checks
- **Backend**: `/health` endpoint with DB and S3 status
- **Database**: Connection status monitoring
- **S3**: Bucket accessibility check

### Logging
- **HTTP Requests**: Morgan logging
- **Error Tracking**: Detailed error logs
- **Container Logs**: Docker logging drivers

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Run tests in Docker
docker-compose exec backend npm test
docker-compose exec frontend npm test
```

## 🚀 Deployment

### Production Checklist
- [ ] Update environment variables
- [ ] Configure proper secrets management
- [ ] Set up SSL/TLS certificates
- [ ] Configure CDN for static assets
- [ ] Set up monitoring and alerting
- [ ] Configure database backups
- [ ] Set up CI/CD pipeline

### Kubernetes Deployment
```bash
# Apply configurations
kubectl apply -f kubernetes/

# Check deployments
kubectl get pods
kubectl get services
```

### Terraform Infrastructure
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find and kill process using port
   lsof -ti:3000 | xargs kill -9
   ```

2. **Permission Denied**
   ```bash
   # Fix Docker permissions
   sudo chmod 666 /var/run/docker.sock
   ```

3. **MongoDB Connection Issues**
   ```bash
   # Reset MongoDB data
   docker-compose down -v
   docker-compose up mongo
   ```

4. **S3 Upload Failures**
   - Check AWS credentials in .env
   - Verify S3 bucket permissions
   - Ensure bucket exists and is accessible

### Debug Commands
```bash
# Check service status
docker-compose ps

# View detailed logs
docker-compose logs --tail=50 backend

# Execute commands in containers
docker-compose exec backend bash
docker-compose exec mongo mongosh

# Check environment variables
docker-compose exec backend printenv
```

## 🔄 Updates and Maintenance

### Update Dependencies
```bash
# Backend
cd backend && npm update

# Frontend  
cd frontend && npm update

# Rebuild containers
docker-compose build --no-cache
```

### Database Maintenance
```bash
# Backup database
docker-compose exec mongo mongodump --out /backup

# Restore database
docker-compose exec mongo mongorestore /backup
```

## 📚 Learning Resources

- [React Documentation](https://reactjs.org/docs/)
- [Material-UI Guide](https://mui.com/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Guide](https://kubernetes.io/docs/)

## 💡 Tips for Success

1. **Always check logs first** when debugging issues
2. **Use environment variables** for configuration
3. **Test locally** before deploying to production
4. **Keep dependencies updated** for security
5. **Use proper error handling** in your code
6. **Monitor your application** in production
7. **Backup your data** regularly
