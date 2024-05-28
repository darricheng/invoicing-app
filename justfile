default:
    just --list --unsorted

dev:
    mprocs

build: full-svelte trash-dist
    cd electron-app && pnpm run build:mac

test-build: full-svelte trash-dist && open
    cd electron-app && pnpm run test-build 
    cd electron-app/dist && unzip 'Invoicing App-1.0.0-arm64-mac.zip' 

full-svelte: build-svelte prep-svelte move-svelte

build-svelte:
    cd svelte-app && pnpm run build

prep-svelte:
    # redirects paths to be relative to current directory so that electron
    # can find the files (as it uses the file:// protocol)
    # see: https://stackoverflow.com/a/54481688 
    sd -F '/_app' './_app' svelte-app/build/index.html

move-svelte:
    #!/usr/bin/env bash
    set -euxo pipefail # https://just.systems/man/en/chapter_44.html#safer-bash-shebang-recipes
    if [ -d "electron-app/out/renderer/" ]; then
        trash electron-app/out/renderer/
    fi
    mkdir -p electron-app/out/renderer
    cp -R svelte-app/build/* electron-app/out/renderer

trash-dist:
    #!/usr/bin/env bash
    set -euxo pipefail # https://just.systems/man/en/chapter_44.html#safer-bash-shebang-recipes
    if [ -d "electron-app/dist/" ]; then
        trash electron-app/dist/ 
    fi

open:
    open electron-app/dist/Invoicing\ App.app

