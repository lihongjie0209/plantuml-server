#!/bin/bash
# Push PlantUML Server to Docker Hub

echo "Please make sure you are logged in to Docker Hub first:"
echo "docker login"
echo ""

read -p "Enter your Docker Hub username: " DOCKER_USERNAME
if [ -z "$DOCKER_USERNAME" ]; then
    echo "Username cannot be empty!"
    exit 1
fi

IMAGE_NAME="plantuml-server"
TAG="latest"
FULL_IMAGE_NAME="$DOCKER_USERNAME/$IMAGE_NAME:$TAG"

echo ""
echo "Tagging image as $FULL_IMAGE_NAME..."
docker tag $IMAGE_NAME:$TAG $FULL_IMAGE_NAME

if [ $? -ne 0 ]; then
    echo "Failed to tag image!"
    exit 1
fi

echo ""
echo "Pushing image to Docker Hub..."
docker push $FULL_IMAGE_NAME

if [ $? -ne 0 ]; then
    echo "Failed to push image!"
    exit 1
fi

echo ""
echo "Successfully pushed to Docker Hub!"
echo "Image: $FULL_IMAGE_NAME"
echo ""
echo "You can now pull it with:"
echo "docker pull $FULL_IMAGE_NAME"
