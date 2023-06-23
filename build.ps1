docker build . -t full-twitchapp
kubectl delete -f full-service.yaml
kubectl apply -f full-service.yaml