unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     machine=Linux;;
    Darwin*)    machine=Mac;;
    MINGW*)     machine=MinGW;;
    *)          machine="UNKNOWN:${unameOut}"
esac

if [ ${machine} == "Mac" ] || [ ${machine} == "Linux" ]; then
  cp ../build/index.js ./
  sudo docker build -t modelshare-v1 .
  sudo docker save -o modelshare-v1.tar modelshare-v1
  sudo chmod 666 modelshare-v1.tar
  sudo docker rmi modelshare-v1       
elif [ ${machine} == "MinGW" ]; then
  cp ../build/index.js ./
  docker build -t modelshare-v1 .
  docker save -o modelshare-v1.tar modelshare-v1
  chmod 666 modelshare-v1.tar
  docker rmi modelshare-v1
fi
