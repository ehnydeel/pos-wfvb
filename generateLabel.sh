#!/bin/sh
read -p "Enter Label-Name: " labelname
convert -background white -size 638x295 -set colorspace sRGB -gravity Center -weight 200 -pointsize 125 label:"${labelname}" -rotate 90 ${labelname}.png
echo "${labelname}.png was generated"
