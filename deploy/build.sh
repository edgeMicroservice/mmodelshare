cp ../build/index.js ./
sudo docker build -t modelshare-v1 .
sudo docker save -o modelshare-v1.tar modelshare-v1
sudo chmod 666 modelshare-v1.tar
sudo docker rmi modelshare-v1
