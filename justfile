default:
    echo 'Hello, world!'
dev:
    mprocs

build:
    cd electron-app && pnpm run build:mac

build-svelte:
    cd svelte-app && pnpm run build
    trash electron-app/out/renderer
    mkdir -p electron-app/out/renderer
    cp -R svelte-app/build/* electron-app/out/renderer

test-app:
    #!/usr/bin/env bash
    cd electron-app 
    if [ -d "dist/" ]; then
        echo 'Trashing old dist folder...'
        trash dist/ 
    fi
    echo 'Creating build...'
    pnpm run test-build 
    cd dist 
    echo 'Unzipping and opening app'
    unzip 'Invoicing App-1.0.0-arm64-mac.zip' 
    open Invoicing\ App.app/

open:
    open electron-app/dist/Invoicing\ App.app

