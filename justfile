default:
    just --list --unsorted

dev: check-port
    mprocs --config mprocs.dev.yaml

livedev: check-port
    mprocs --config mprocs.livedev.yaml

build: full-svelte trash-dist
    cd electron-app && pnpm run build:mac

test-build: full-svelte trash-dist && open
    cd electron-app && pnpm run test-build 
    cd electron-app/dist && unzip 'Invoicing App-1.0.0-arm64-mac.zip' 

full-svelte: build-svelte prep-svelte move-svelte

build-svelte:
    cd svelte-app && pnpm run build

prep-svelte:
    # change paths to be relative to current directory so that electron
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

# exit if port 5173 is already in use 
check-port:
    #!/usr/bin/env bash
    set -euxo pipefail # https://just.systems/man/en/chapter_44.html#safer-bash-shebang-recipes
    # lsof returns nothing if the port is not in use, which is false so the script withon doesn't run
    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
        echo "ERROR: Port 5173 is already in use"
        exit 1
    fi

