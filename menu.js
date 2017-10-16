document.querySelector('nav')
.addEventListener('click', function (clickEvent) {
  clickEvent.currentTarget.classList.toggle('open')
  clickEvent.stopPropagation()
})

document.addEventListener('click', function (clickEvent) {
  document.querySelector('nav').classList.remove('open')
})
