#!/bin/bash

cd themes/guido/static
cleancss style.css > style.min.css
cd ..
git commit -a -m "$1"
git push origin HEAD:master
cd ..
cd ..
git commit -a -m "$1"
git push
hugo
cd public
git commit -a -m "$1"
git push
cd ..
