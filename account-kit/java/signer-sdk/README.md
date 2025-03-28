# Signer Java SDK


## build package

`mvn build`

## publish package

1. generate javadoc
    ```shell
    mvn javadoc:javadoc
    ```
2. publish package
   `./deploy.sh` to update version number
   `mvn deploy` to deploy to maven repo
