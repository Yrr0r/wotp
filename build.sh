echo "Running build script"

# build js code
webpack --mode=production ./src/index.mjs

# embed js into html
jscode=`cat ./dist/main.js`
htmlcode=`cat ./page.html`
keyword="//SCRIPTINSERTKEYWORD"
echo JS Code: ${#jscode}, htmlcode: ${#htmlcode}, keyword: $keyword

htmlcode=${htmlcode/${keyword}/${jscode}}
echo Combined: ${#htmlcode}

# write combined file
printf "%s" "$htmlcode" > ./web/index.html

# move favicon
cp ./favicon.ico ./web/favicon.ico
