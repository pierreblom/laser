#!/bin/zsh
set -euo pipefail

project_dir=${0:A:h}
app_path="$project_dir/Laser Link.app"
mkdir -p "$app_path/Contents/MacOS"
mkdir -p "$project_dir/.build/module-cache"
cp "$project_dir/Info.plist" "$app_path/Contents/Info.plist"

xcrun clang \
    -fobjc-arc \
    -fmodules \
    -fmodules-cache-path="$project_dir/.build/module-cache" \
    -mmacosx-version-min=13.0 \
    -framework Cocoa \
    -framework CoreBluetooth \
    "$project_dir/Sources/LaserLinkApp.m" \
    -o "$app_path/Contents/MacOS/LaserLink"

codesign --force --sign - "$app_path"
print "Built: $app_path"
