









const DEBUG = true


var kwarto = {
}


/**
 *              UTILITIES
 */
kwarto.util = {
}
kwarto.util.hex = []
for (let i = 0; i < 16; i++) kwarto.util.hex[i] = i.toString(16)
kwarto.util.hex[-1] = '.'

kwarto.util.shuffle = function(arr) {
  for (let i = 1; i < arr.length; i++) {
    let r = Math.floor(Math.random()*(i + 1))
    let t = arr[r]
    arr[r] = arr[i]
    arr[i] = t
  }
}

kwarto.util.nbsp = []
kwarto.util.nbsp[15] = ''
kwarto.util.nbsp.fill('&nbsp;')

kwarto.util.pad = function(n, l) {
  return kwarto.util.nbsp.concat(n.toString().split('')).slice(-l).join('')
}

kwarto.util.pre = function(m, n) {
  return kwarto.util.pad(m, 8) + kwarto.util.pad(n, 8)
}


kwarto.util.image = function(n) {
  return '<img src="images/' + n + '.svg">'
}

kwarto.util.title = function(t, u) {
  return '<span title="' + t.toUpperCase() + '">' + u + '</span>'
}



/**
 *              PAGE LAYOUT
 */
kwarto.page = {
}
kwarto.page.image = []
for (let i = 0; i < 16; i++) {
  kwarto.page.image[i] = kwarto.util.image(kwarto.util.hex[i])
}

kwarto.page.image['o'] = kwarto.util.image('o')

kwarto.page.image['x'] = kwarto.util.image('x')
kwarto.page.image['y'] = kwarto.util.image('y')


kwarto.page.place = []
for (let i = 0; i < 16; i++) {
  kwarto.page.place[i] =
      kwarto.util.title(kwarto.util.hex[i], kwarto.page.image['o'])
}

kwarto.page.piece = []
for (let i = 0; i < 16; i++) {
  kwarto.page.piece[i] =
      kwarto.util.title(kwarto.util.hex[i], kwarto.page.image[ i ])
}


kwarto.page.board = []
kwarto.page.stock = []
kwarto.page.t_top = document.createElement('table')
kwarto.page.t_bot = document.createElement('table')
kwarto.page.vfill = document.createElement('div')
kwarto.page.debug = document.createElement('div')

var tr, td
for (let i = 0; i < 4; i++) {
  tr = kwarto.page.t_top.insertRow()
  for (let j = 0; j < 4; j++) {
    let k = j + (i << 2)
    kwarto.page.board[k] = td = tr.insertCell()
/*  td.innerHTML = kwarto.page.place[k]  /**/
  }
}
tr = kwarto.page.t_top.insertRow()
kwarto.page.p_top = td = tr.insertCell()

tr = kwarto.page.t_top.insertRow()
var xyzzy = []
for (let j = 0; j < 4; j++) {
  xyzzy[j] = td = tr.insertCell()
}
kwarto.page.stage = xyzzy[0]
kwarto.page.autom = xyzzy[1]
kwarto.page.modes = xyzzy[2]
kwarto.page.reset = xyzzy[3]

tr = kwarto.page.t_top.insertRow()
kwarto.page.p_bot = td = tr.insertCell()

tr = kwarto.page.t_bot.insertRow()
for (let j = 0; j < 16; j++) {
  kwarto.page.stock[j] = td = tr.insertCell()
}
kwarto.page.stuck = td = tr.insertCell()

kwarto.page.debug.className = 'tt'
/*
kwarto.page.debug.style.display = 'none'
 */
for (let i = 0; i < 3; i++) {
  xyzzy[i] = document.createElement('div')
  kwarto.page.debug.appendChild(xyzzy[i])
}
kwarto.page.input = xyzzy[0]
kwarto.page.hints = xyzzy[1]
kwarto.page.meter = xyzzy[2]



/**
 *              POSITION
 */
try {
  let ffi = require('ffi')
  kwarto.lib = ffi.Library('./kwarto',
    {
      'kwarto_set_mode'         :  [ 'int', ['int'] ],
      'kwarto_initialize'       :  [ 'int', ['int'] ],
      'kwarto_reset'            :  [ 'int', [] ],
      'kwarto_input_board'      :  [ 'int', ['string'] ],
      'kwarto_group_masks'      :  [ 'int', [] ],
      'kwarto_solve'            :  [ 'int', ['int'] ],
      'kwarto_nodes'            :  [ 'int', [] ],
    }
  )
}
catch (e) {
  kwarto.lib = {
      'kwarto_set_mode'         :  function(m) { return  0 },
      'kwarto_initialize'       :  function(s) { return  0 },
      'kwarto_reset'            :  function( ) { return  0 },
      'kwarto_input_board'      :  function(b) { return  0 },
      'kwarto_group_masks'      :  function( ) { return  0 },
      'kwarto_solve'            :  function(f) { return  0 },
      'kwarto_nodes'            :  function( ) { return  0 },
  }
}


kwarto.mode = -0


kwarto.pos = {
}
kwarto.pos.board = []
kwarto.pos.board[15] = -1

kwarto.util.board = function() {
  return kwarto.pos.board.map(x => kwarto.util.hex[x]).join('')
}

kwarto.pos.masks =  0
kwarto.pos.stage = -1
kwarto.pos.count =  0  /* == kwarto.pos.board.filter(x => x >= 0).length */

kwarto.pos.autom = -1


kwarto.pos.setup = function() {
  if (kwarto.mode >= 0) return  /* delay */
  let lib = kwarto.lib, pos = kwarto.pos, page = kwarto.page
  lib.kwarto_reset()
  let b = kwarto.util.board()
  page.input.innerHTML = b
  page.meter.innerHTML =
  page.hints.innerHTML = ''
  lib.kwarto_input_board(b)
  let m = pos.masks = lib.kwarto_group_masks()
  if (m == 0) {
    for (let b of page.board) b.style.opacity = 1.
    return
  }
  page.hints.innerHTML = '*' + m.toString(16).padStart(4, '0')
  for (let i = 0; i < 16; m >>= 1, i++)
    page.board[i].style.opacity = (((pos.board[i] >> 4) | m) & 1)*(1.-.5) + .5
}

kwarto.pos.solve = function() {
  let lib = kwarto.lib, pos = kwarto.pos
  if (kwarto.mode >= 0) {
    lib.kwarto_set_mode(kwarto.mode)
    kwarto.mode -= 2
    lib.kwarto_initialize(Date.now() | 0)
    pos.setup()
  }
  if (pos.masks != 0) return
  let page = kwarto.page, hex = kwarto.util.hex
  page.input.innerHTML = kwarto.util.board() + ' !' + hex[pos.stage]
  let d = -Date.now()
  let s = lib.kwarto_solve(pos.stage)
  d += Date.now()
  let p = s & ((1<<4)-1)
  let f = (s << 16) >> (16+4)  /* the little bits . . . */
  let r = s >> 16
  let t = ['-', '=', '+'][Math.sign(r) + 1] + hex[Math.abs(r)] + ' >' + hex[p]
  pos.autom = p
  if (f >= 0 && f != pos.stage && !pos.board.some(x => x == f))
    t += ' !' + hex[f]
  else
    f = -1
  pos.autom |= f << 4
  page.hints.innerHTML = t
  if (d < 100)
    t = ''
  else
/*  t = kwarto.util.pad(Math.round(lib.kwarto_nodes()/d) + ' kHz', 16)  /**/
    t = kwarto.util.pre(d, lib.kwarto_nodes())
  page.meter.innerHTML = t
}



/**
 *              UTILITIES (cont'd)
 */
kwarto.page.perm = []
for (let i = 0; i < 16; i++) kwarto.page.perm[i] = i

kwarto.util.set_stage = function(t) {
  let pos = kwarto.pos
  if (pos.stage >= 0) return
  let page = kwarto.page
  if (t < 0) t = Math.floor(Math.random()*16)  /* begin */
  page.stage.innerHTML = page.image[t]
  page.stock[ page.perm[t] ].innerHTML = ''
  pos.stage = t
  pos.solve()
}

kwarto.util.rem_stage = function( ) {
  let pos = kwarto.pos
  let t = pos.stage
  if (t < 0) return
  pos.stage = -1
  let page = kwarto.page
  page.stage.innerHTML = page.image['o']
  page.stock[ page.perm[t] ].innerHTML = page.piece[t]
  pos.setup()
}

kwarto.util.set_board = function(i) {
  let pos = kwarto.pos
  if (pos.board[i] >= 0) return
/*if (pos.masks != 0) return  /* **/
  let t = pos.stage
  pos.board[i] = t
  pos.stage = -1
  pos.count += 1
  let page = kwarto.page
  page.board[i].innerHTML = page.image[t]
  page.stage.innerHTML = page.image['o']
  pos.setup()
}

kwarto.util.rem_board = function(i) {
  let pos = kwarto.pos
  let t = pos.board[i]
  if (t < 0) return
  pos.board[i] = -1
  pos.count -= 1
  kwarto.page.board[i].innerHTML = kwarto.page.place[i]
  pos.setup()
  kwarto.util.set_stage(t)
}



/**
 *              CONTROLLING
 */
kwarto.page.stage.onclick = kwarto.util.rem_stage


kwarto.page.autom.onclick = function() {
  let pos = kwarto.pos, util = kwarto.util
  if (pos.stage < 0) {
    if (pos.count == 0) util.set_stage(-1)
    return
  }
  let m = pos.autom
  util.set_board(m & ((1<<4)-1))
  if (m < 0) return
  util.set_stage(m >> 4)
}


kwarto.page.modes.onclick = function() {
  if (kwarto.mode < 0) return
  let m = kwarto.mode
  kwarto.page.modes.innerHTML = kwarto.page.image[ ['x', 'y'][m] ]
  kwarto.mode ^= 1
}


for (let i = 0; i < 16; i++) {
  let pos = kwarto.pos, util = kwarto.util
  kwarto.page.board[i].onclick = function() {
    if (pos.stage >= 0)
      util.set_board(i)
    else
      util.rem_board(i)
  }
}


kwarto.page.reset.onclick = function() {
  let pos = kwarto.pos, util = kwarto.util, page = kwarto.page
  pos.board.fill(-1)
  pos.stage = -1
  pos.count =  0
  for (let i = 0; i < 16; i++) {
    page.board[i].innerHTML = page.place[i]
  }
  page.stage.innerHTML = page.image['o']
  let perm = page.perm
  util.shuffle(perm)  /* each onclick has to be set again */
  for (let i = 0; i < 16; i++) {
    let stock = page.stock[ perm[i] ]
    stock.innerHTML = page.piece[i]
    stock.onclick = function() {
/*    if (pos.masks != 0) return  /* **/
      util.set_stage(i)
      if (pos.count == 15)
        util.set_board(pos.board.indexOf(-1))
    }
  }
  pos.setup()
  page.input.innerHTML = ''
}



/**
 *              PAGE DISPLAY
 */
kwarto.page.stage.innerHTML = kwarto.page.image['o']

kwarto.page.autom.innerHTML = kwarto.util.image('r')
kwarto.page.modes.innerHTML = kwarto.util.image('y')
kwarto.page.reset.innerHTML = kwarto.util.image('z')

kwarto.page.p_bot.innerHTML =
kwarto.page.p_top.innerHTML = kwarto.util.image('_')

kwarto.page.vfill.innerHTML =
kwarto.page.stuck.innerHTML = kwarto.util.image('l')


document.body.appendChild(kwarto.page.t_top)
document.body.appendChild(kwarto.page.t_bot)
document.body.appendChild(kwarto.page.vfill)
document.body.appendChild(kwarto.page.debug)


kwarto.page.reset.onclick()
