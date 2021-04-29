echo "Copying production environment settings"
cp example-prod.env .env

echo "Building"
ng build --prod

echo "Deploying to GCP AppEngine"
gcloud app deploy

echo "Revert to development environment settings"
cp example-dev.env .env
