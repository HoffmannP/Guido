const PASSWORD = 'Guido'

// init()

function init() {
  if (getCookie('underconstruction') != 'view') {
    document.body.style.display = 'none'
    window.setTimeout(entsperren, 1)
  }
}

function entsperren () {
  if (window.prompt('Passwort bitte:') == PASSWORD) {
    setCookie('underconstruction', 'view', 99)
    document.body.style.display = null
  } else {
    window.alert('Neu laden und mit richtigem Passwort freischalten')
  }
}

function getCookie (cname) {
  var name = cname + '='
  var decodedCookie = window.decodeURIComponent(document.cookie)
  var ca = decodedCookie.split(';')
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) == ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ''
}

function setCookie (cname, cvalue, exdays) {
  var d = new Date()
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
  var expires = 'expires=' + d.toUTCString()
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/'
}
