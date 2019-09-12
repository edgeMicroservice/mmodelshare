# mModelShare

This open source mModelShare microservice created by the mimik team is an example cross-platform solution for sharing machine learning models across devices. More specifically, this edgeSDK microservice has the following functionality:

1. Uploading the information about the machine learning model on your device to the mModelShare's local database.

2. Retrieving the information regarding specific machine learning models from local database.

3. Retrieving machine learning models from other devices.

# How to use

Install Dependencies
```
npm install
```

Build the edge microservice
```
npm run build
```

Package the edge microservice for deployment, and mmodelshare-v1.tar will be available under deploy folder
```
npm run package
```

# Folder structure
- **config**: this folder contains cofiguration file used for building and packaing the microservice.
- **deploy**: this folder is where the packaged tar file will be generated.
- **src**: this folder is where all the source code of the microservice resides.
- **swagger**: this folder contains the swagger/openapi API specification.

