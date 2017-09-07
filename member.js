/* global sjcl, Dropbox */

function MemberArea (form, parameter) {
  var self = this
  self.form = document.querySelector(form)

  decryptToken(getCookie('pwintern'))
  .then(loadFiles)
  .catch(enableLogin)

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

  function decryptToken (password) {
    return new Promise(function (resolve, reject) {
      try {
        resolve(sjcl.decrypt(
          password,
          encryptionSetting(parameter.split(':'))
        ))
      } catch (error) {
        reject(error)
      }
    })
  }

  function encryptionSetting (parameter) {
    return JSON.stringify({
      'iv': parameter[0],
      'v': 1,
      'iter': 10000,
      'ks': 128,
      'ts': 64,
      'mode': 'ccm',
      'adata': '',
      'cipher': 'aes',
      'salt': parameter[1],
      'ct': parameter[2]
    })
  }

  function enableLogin () {
    self.form.classList.remove('hidden')
    self.form.addEventListener('submit', insteadDo(login))
  }

  function insteadDo (fkt) {
    return function (event) {
      event.preventDefault()
      fkt()
      return false
    }
  }

  function login () {
    hideErrors()
    decryptToken(readPassword())
    .catch(wrongPassword)
    .then(loadFiles)
  }

  function hideErrors () {
    self.form.querySelectorAll('.error')
    .forEach(function (el) { el.classList.add('hidden') })
  }

  function readPassword () {
    var password = self.form.querySelector('[name="password"]').value
    setCookie('pwintern', password, 30)
    return password
  }

  function setCookie (cname, cvalue, exdays) {
    var d = new Date()
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
    var expires = 'expires=' + d.toUTCString()
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/'
  }

  function loadFiles (token) {
    return fetchEntrylist(token)
    .then(filterFiles)
    .then(prepareFilelist)
    .then(renderFilelist)
    .catch(internalError)
  }

  function fetchEntrylist (token) {
    self.dbx = new Dropbox({accessToken: token})
    return self.dbx.filesListFolder({path: ''})
  }

  function filterFiles (response) {
    if (response.has_more) {
      throw 'Too many entries'
    }
    return response.entries
    .filter(function (entry) { return entry['.tag'] === 'file' })
  }

  function prepareFilelist (files) {
    self.form.classList.add('hidden')
    self.memberArea = document.querySelector('div.member-area')
    self.memberArea.classList.remove('hidden')
    self.filelist = memberArea.querySelector('ul.filelist')
    self.filelist.innerHTML = ''
    self.memberArea.querySelector('button').addEventListener('click', logout)
    return files
  }

  function logout () {
    self.form.classList.remove('hidden')
    self.memberArea.classList.add('hidden')
    setCookie('pwintern', '', -1)
  }

  function renderFilelist (files) {
    if (files.length === 0) {
      self.filelist.innerHTML = '<li><em class="blass">keine Dateien gefunden</em></li>'
      return []
    }
    files.forEach(listFile)
  }

  function listFile (file) {
    var li = document.createElement('li')
    li.innerHTML = '<li><a href="' + file.path_lower + '" data-path="' + file.path_lower + '">' + file.name + ' (' + filesize(file.size) + ')</a></li>'
    li.addEventListener('click', downloadFile)
    self.filelist.appendChild(li)
  }

  function filesize (size) {
    var exponent = Math.floor(Math.log(size) / Math.log(1024))
    var suffix = ['B', 'KB', 'MB'][exponent]
    var unitSize = size / Math.pow(1024, exponent)
    var roundSize = unitSize >= 10 ? Math.round(unitSize) : Math.round(unitSize * 10) / 10
    return roundSize + ' ' + suffix
  }

  function downloadFile (event) {
    if (event.target.dataset.blob) {
      return true
    }
    event.preventDefault()
    self.dbx.filesDownload({path: event.target.dataset.path})
    .then(handleDownload.bind(null, event.target))
    .catch(internalError)
    return false
  }

  function handleDownload (target, response) {
    target.href = window.URL.createObjectURL(response.fileBlob)
    target.download = response.name
    target.dataset.blob = true
    // target.click()
  }

  function wrongPassword (error) {
    self.form.querySelector('.password.error').classList.remove('hidden')
    self.form.querySelector('[name="password"]').value = ''
    self.form.querySelector('[name="password"]').focus()
    throw error
  }

  function internalError (error) {
    console.error(error)
    if (!self.form.querySelector('.error:not(.hidden)')) {
      self.form.querySelector('.internal.error').classList.remove('hidden')
    }
  }
}
