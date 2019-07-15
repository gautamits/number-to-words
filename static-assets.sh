#!/bin/sh
cd build
a=$(find . -name "*.*" | sed 's|\.\/||g' | sed 's|^\.||g' | sed 's|^|"|g' | sed 's|$|"|g' | tr '\n' ',' | sed 's|^|let assets=[|' | sed 's|$|];|g')
sed  -i '' "s|let assets=\[\]|$a|" number-to-words-sw.js
cd ..
