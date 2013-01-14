#!/bin/bash

# Don't forget to make the file executable with: chmod u+x _package.command

BASEDIR=$(dirname $0)
cd $BASEDIR
rm ./_app.nw

pushd $BASEDIR/app.nw
zip -r -X ../_app.nw . -x _*.*
popd

/Applications/node-webkit.app/Contents/MacOS/node-webkit ./_app.nw
exit