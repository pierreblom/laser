#!/bin/zsh
set -euo pipefail

project_dir=${0:A:h}
cd "$project_dir/browser"
exec python3 -m http.server 8766 --bind 127.0.0.1
