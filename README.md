# mModelShare

This open source mModelShare microservice created by the mimik team is an example cross-platform solution for sharing machine learning models across devices. More specifically, this edgeSDK microservice has the following functionality:

1. Uploading the information about the machine learning model on your device to the mModelShare's local database.
2. Retrieving the information regarding specific machine learning models from local database.
3. Retrieving machine learning models from other devices.

# Build Process

The build script **default.yml** is specified under config directory.

1. Install dependencies: ```npm install```
2. Run the build script: ```npm run build```
3. Package to container: ```npm run package```

# Deployment

For **mobile application development**, deployment is programmatically by **Android or iOS Wrappers**, learn more about it:

- Android: [Link](https://developer.mimik.com/resources/documentation/latest/wrappers/android-wrapper)
- iOS: [Link](https://developer.mimik.com/resources/documentation/latest/wrappers/ios-wrapper)

For **microservice development**, things you will need:

- edgeSDK running on the deployment targeted device.
- Obtained edge Acess Token and associate the device from **edgeSDK OAuth Tool**.
- Run the following commands under the same directory of your containerized microservice file:

```
curl -i -H 'Authorization: Bearer <edge Access Token>' -F "image=@<file name>.tar" http://<target IP address>:8083/mcm/v1/images
```

- To run the microservice after successful deployment, with environment variables:

```
curl -i -H 'Authorization: Bearer <edge Access Token>' -d '{"name": <file name>, "image": <image name>, "env": {"MCM.BASE_API_PATH": "<request base path>", "MCM.WEBSOCKET_SUPPORT": "true", "<add your environment variable name>": "<add your environment variable>"} }' http://<target IP address>:8083/mcm/v1/containers
```

- For more information and explanation, you can visit our [mCM container management API references](https://developer.mimik.com/resources/documentation/latest/getting-started/quick-start) and [general guide on packaing, deployment, and exporting microservice](https://developer.mimik.com/resources/documentation/latest/apis/mcm).

