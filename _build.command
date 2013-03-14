#!/bin/bash

# Don't forget to make the file executable with: chmod u+x _build.command

BASEDIR=$(dirname $0)
cd $BASEDIR
rm ./build/Bridget.nw
rm -R ./build/Bridget.app

pushd $BASEDIR/app.nw
zip -r -X -q ../build/Bridget.nw . -x _*.*
popd

cp -R /Applications/node-webkit.app ./build/Bridget.app

cp -R ./custom_package_Contents/ ./build/Bridget.app/Contents/
cp -R ./app.nw ./build/Bridget.app/Contents/Resources

# Build for OSX 10.6
rm -R ./build/Bridget-10.6.app
cp -R /Applications/node-webkit-10.6.app ./build/Bridget-10.6.app
cp -R ./custom_package_Contents/ ./build/Bridget-10.6.app/Contents/
cp -R ./app.nw ./build/Bridget-10.6.app/Contents/Resources

open ./build/Bridget.app
exit
