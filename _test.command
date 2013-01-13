#!/bin/bash

# Don't forget to make the file executable with: chmod u+x _package.command

BASEDIR=$(dirname $0)
cd $BASEDIR
rm ./_app.nw

cd $BASEDIR/app.nw
zip -r _app.nw . -x _*.*

cd ..
mv ./app.nw/_app.nw .

/Applications/node-webkit.app/Contents/MacOS/node-webkit ./_app.nw
exit