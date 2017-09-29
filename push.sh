#!/bin/bash

cd themes/guido
cleancss style.css > style.min.css
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
