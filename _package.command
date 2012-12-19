#!/bin/bash

# Don't forget to make the file executable with: chmod u+x _package.command

BASEDIR=$(dirname $0)
cd $BASEDIR

rm _app.nw
zip -r _app.nw . -x *.command*
/Applications/node-webkit.app/Contents/MacOS/node-webkit ./_app.nw
exit