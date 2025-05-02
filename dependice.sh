#!/bin/bash

# Exit on error
set -e

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Update package lists
echo "Updating package lists..."
sudo apt-get update -y
sleep 5

# Install Git
if command_exists git; then
    echo "Git is already installed."
else
    echo "Installing Git..."
    sudo apt-get install -y git
fi
git --version
sleep 5

# Install Node.js (v16)
if command_exists node; then
    echo "Node.js is already installed."
    node -v
else
    echo "Installing Node.js v16..."
    curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
node -v
sleep 5

# Install Docker
if command_exists docker; then
    echo "Docker is already installed."
else
    echo "Installing Docker..."
    sudo apt-get install -y docker.io
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
fi
docker --version
sleep 5

# Install AWS CLI
if command_exists aws; then
    echo "AWS CLI is already installed."
else
    echo "Installing AWS CLI..."
    sudo apt-get install -y unzip
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
fi
aws --version
sleep 5

# Install Terraform
if command_exists terraform; then
    echo "Terraform is already installed."
else
    echo "Installing Terraform..."
    curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
    sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
    sudo apt-get update && sudo apt-get install -y terraform
fi
terraform -version
sleep 5

# Install kubectl
if command_exists kubectl; then
    echo "kubectl is already installed."
else
    echo "Installing kubectl..."
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    chmod +x kubectl
    sudo mv kubectl /usr/local/bin/
fi
kubectl version --client
sleep 5

# Install Helm
if command_exists helm; then
    echo "Helm is already installed."
else
    echo "Installing Helm..."
    curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
fi
helm version
sleep 5

# Install Python (optional)
if command_exists python3; then
    echo "Python3 is already installed."
else
    echo "Installing Python3..."
    sudo apt-get install -y python3 python3-pip
fi
python3 --version
sleep 5

echo "All dependencies installed successfully!"
echo "Note: Log out and back in to apply Docker group changes, or run 'newgrp docker'."