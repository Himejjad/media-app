#!/bin/bash

# Media App Development Setup Script
echo "🎵 Setting up Media App development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    cp .env.example .env
    print_warning "Please edit .env file with your AWS credentials and S3 bucket name"
    echo "📝 Required environment variables:"
    echo "   - AWS_ACCESS_KEY_ID"
    echo "   - AWS_SECRET_ACCESS_KEY"
    echo "   - AWS_REGION"
    echo "   - S3_BUCKET"
    echo ""
    read -p "Press Enter to continue once you've updated the .env file..."
fi

# Create frontend .env file if it doesn't exist
if [ ! -f frontend/.env ]; then
    print_warning "Frontend .env file not found. Creating from template..."
    cp frontend/.env.example frontend/.env
fi

# Create backend .env file if it doesn't exist
if [ ! -f backend/.env ]; then
    print_warning "Backend .env file not found. Creating from template..."
    cp backend/.env.example backend/.env
fi

# Build and start services
print_status "Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 10

# Check service health
print_status "Checking service health..."

# Check backend health
if curl -f http://localhost:3000/health &> /dev/null; then
    print_status "Backend is healthy"
else
    print_warning "Backend might not be ready yet. Check logs with: docker-compose logs backend"
fi

# Check frontend
if curl -f http://localhost/health &> /dev/null; then
    print_status "Frontend is healthy"
else
    print_warning "Frontend might not be ready yet. Check logs with: docker-compose logs frontend"
fi

# Check MongoDB
if docker-compose exec -T mongo mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
    print_status "MongoDB is healthy"
else
    print_warning "MongoDB might not be ready yet. Check logs with: docker-compose logs mongo"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📱 Access your application:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:3000"
echo "   Backend Health: http://localhost:3000/health"
echo "   MongoDB: localhost:27017"
echo ""
echo "🔧 Development commands:"
echo "   View logs: docker-compose logs -f [service]"
echo "   Stop services: docker-compose down"
echo "   Rebuild: docker-compose up --build"
echo "   Clean restart: docker-compose down && docker-compose up --build"
echo ""
echo "🗃️  Optional MongoDB Admin Interface:"
echo "   Run: docker-compose --profile admin up -d mongo-express"
echo "   Access: http://localhost:8081 (admin/admin123)"
echo ""
print_warning "Remember to check your .env file and ensure AWS credentials are correct!"
