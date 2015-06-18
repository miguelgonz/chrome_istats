#!/bin/bash
unamestr=`uname`
APPNAME=istats_log
BUILD_DIR=build
params="--pack-extension=./src --pack-extension-key=./istats_log.pem"

if [[ "$unamestr" == 'Linux' ]]; then
    chrome $params > /dev/null
elif [[ "$unamestr" == 'Darwin' ]]; then
    /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome $params > /dev/null
fi

if [ ! -d $BUILD_DIR ]; then
    mkdir $BUILD_DIR
fi

mv src.crx ${BUILD_DIR}/${APPNAME}.crx > /dev/null
echo "Extension file has been created in ${BUILD_DIR}/${APPNAME}.crx "
