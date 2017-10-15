









#   Intro

An implementation of the board game
[quarto](https://en.wikipedia.org/wiki/Quarto_(board_game))
written in C, brought to life by [NW.js](https://nwjs.io).


#   Howto

(64-bit instructions, change `x64` to `x86` for 32-bit systems)

*   `build-essential` or similar build tools by an other name will be needed
    (that’s why there’s no windows version yet – `npm install` depends on
    `vcbuild.exe`)

*   download [`node.js`](https://nodejs.org/dist/v8.6.0/node-v8.6.0-linux-x64.tar.xz)
    and extract it to, say, `/home/user/foo/`

*   clone the repo to, say, `/home/user/bar/`,
    then open a terminal and navigate to the `kwarto-nwjs` directory

*   make the node binaries visible:
    `PATH=/home/user/foo/node-v8.6.0-linux-x64/bin:$PATH`

*   `npm install ffi` and `npm install nw` (this will take some time)
    and adjust again: `PATH=/home/user/bar/kwarto-nwjs/node-modules/.bin:$PATH`

*   link (or copy or maybe rename) the appropriate `.so` file to `kwarto.so`

*   `nw .` and hope you’ll find your way around
