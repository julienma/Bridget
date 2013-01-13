#!/bin/bash

# Don't forget to make the file executable with: chmod u+x _build.command

BASEDIR=$(dirname $0)
cd $BASEDIR
rm ./build/Bridget.nw
rm -R ./build/Bridget.app

#cd $BASEDIR/app.nw
zip -r -q ./build/Bridget.nw ./app.nw/ -x _*.*

#cd ..
#mv ./app.nw/Bridget.nw .

cp -R /Applications/node-webkit.app ./build/Bridget.app

cp -R ./custom_package_Contents/ ./build/Bridget.app/Contents/
cp -R ./app.nw ./build/Bridget.app/Contents/Resources

open ./build/Bridget.app
exit
