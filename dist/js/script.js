const App = (() => {
  'use strict'

  // Debounced resize event (width only). [ref: https://paulbrowne.xyz/debouncing]
  function resize(a, b) {
    const c = [window.innerWidth]
    return window.addEventListener('resize', () => {
      const e = c.length
      c.push(window.innerWidth)
      if (c[e] !== c[e - 1]) {
        clearTimeout(b)
        b = setTimeout(a, 150)
      }
    }), a
  }

  // Bootstrap breakPoint checker
  function breakPoint(value) {
    let el, check, cls

    switch (value) {
      case 'xs': cls = 'd-none d-sm-block'; break
      case 'sm': cls = 'd-block d-sm-none d-md-block'; break
      case 'md': cls = 'd-block d-md-none d-lg-block'; break
      case 'lg': cls = 'd-block d-lg-none d-xl-block'; break
      case 'xl': cls = 'd-block d-xl-none'; break
      case 'smDown': cls = 'd-none d-md-block'; break
      case 'mdDown': cls = 'd-none d-lg-block'; break
      case 'lgDown': cls = 'd-none d-xl-block'; break
      case 'smUp': cls = 'd-block d-sm-none'; break
      case 'mdUp': cls = 'd-block d-md-none'; break
      case 'lgUp': cls = 'd-block d-lg-none'; break
    }

    el = document.createElement('div')
    el.setAttribute('class', cls)
    document.body.appendChild(el)
    check = el.offsetParent === null
    el.parentNode.removeChild(el)

    return check
  }

  // Shorthand for Bootstrap breakPoint checker
  function xs() { return breakPoint('xs') }
  function sm() { return breakPoint('sm') }
  function md() { return breakPoint('md') }
  function lg() { return breakPoint('lg') }
  function xl() { return breakPoint('xl') }
  function smDown() { return breakPoint('smDown') }
  function mdDown() { return breakPoint('mdDown') }
  function lgDown() { return breakPoint('lgDown') }
  function smUp() { return breakPoint('smUp') }
  function mdUp() { return breakPoint('mdUp') }
  function lgUp() { return breakPoint('lgUp') }

  // Nav Sub
  function navSub() {
    document.addEventListener('click', e => {
      if (e.target.closest('.nav-sub')) {
        if (e.target.closest('.dropdown-toggle')) {
          const nav = e.target.closest('.nav-sub')
          const el = e.target.closest('.dropdown-toggle')
          if (nav.dataset.accordion != 'false') {
            for (const shown of nav.querySelectorAll('.show')) {
              el != shown && shown.classList.remove('show') // close all dropdowns
            }
          }
          el.classList.toggle('show')
          nav.dispatchEvent(new Event('navsub:update'))
          e.preventDefault()
        }
      }
    })
    for (const nav of document.querySelectorAll('.nav-sub')) {
      for (const el of nav.querySelectorAll('.active')) {
        if (!el.classList.contains('nav-link')) {
          el.closest('.nav-item').querySelector('.nav-link').classList.add('active', 'show') // open dropdown for sub has active
        }
      }
    }
  }

  // Custom scrollbar for sidebar
  function sidebarBodyCustomScrollBar() {
    const sidebarBody = document.querySelector('.sidebar .sidebar-body')
    if (sidebarBody) {
      let psSidebar
      resize(() => {
        if (lgUp()) {
          sidebarBody.classList.contains('ps') ? psSidebar.update() : psSidebar = new PerfectScrollbar(sidebarBody, { wheelPropagation: false })
        } else {
          sidebarBody.classList.contains('ps') && psSidebar.destroy()
        }
      })()

      // Update scrollbar
      sidebarBody.querySelector('.nav-sub').addEventListener('navsub:update', () => {
        lgUp() && psSidebar.update()
      })
    }
  }

  // Toggle sidebar collapse or expand
  function toggleSidebar() {
    document.addEventListener('click', e => {
      if (e.target.closest('[data-toggle="sidebar"]')) {
        lgUp() ? document.body.classList.toggle('sidebar-collapse') : document.body.classList.toggle('sidebar-expand')
        document.querySelector('.sidebar-body').scrollTop = 0
        e.preventDefault()
      }
    })

    void function () {
      // Insert sidebar backdrop
      document.body.insertAdjacentHTML('beforeend', '<div class="sidebar-backdrop" id="sidebarBackdrop" data-toggle="sidebar"></div>')

      // Remember sidebar scroll position
      const sidebar = document.querySelector('.sidebar')
      if (sidebar) {
        const sidebarBody = sidebar.querySelector('.sidebar-body')
        let bodyClass = document.body.classList
        let scrollPosition = 0
        let lock = false
        sidebarBody.addEventListener('scroll', function () {
          !lock && (scrollPosition = this.scrollTop) // save last scroll
        })
        document.addEventListener('click', e => {
          if (e.target.closest('[data-toggle="sidebar"]')) {
            if (!bodyClass.contains('sidebar-collapse') || bodyClass.contains('sidebar-expand')) {
              sidebarBody.scrollTop = scrollPosition // restore position on expanded
            }
          }
        })
        sidebar.addEventListener('mouseenter', () => {
          if (bodyClass.contains('sidebar-collapse') && lgUp()) {
            lock = false
            sidebarBody.scrollTop = scrollPosition // restore on hover
          }
        })
        sidebar.addEventListener('mouseleave', () => {
          if (bodyClass.contains('sidebar-collapse') && lgUp()) {
            lock = true
            sidebarBody.scrollTop = 0 // reset on unhover
          }
        })
      }
    }()
  }

  // Focus to modal content who has 'autofocus' attribute
  function autofocusModal() {
    $('.modal').on('shown.bs.modal', function () {
      const autofocusEl = this.querySelector('[autofocus]')
      autofocusEl && autofocusEl.focus()
    })
  }

  // Functional card toolbar
  function cardToolbar() {
    document.addEventListener('click', e => {
      if (e.target.closest('[data-action]')) {
        const el = e.target.closest('[data-action]')
        const card = el.closest('.card')
        switch (el.dataset.action) {
          case 'fullscreen':
            card.classList.toggle('card-fullscreen')
            if (card.classList.contains('card-fullscreen')) {
              el.innerHTML = '<i class="material-icons">fullscreen_exit</i>'
              document.body.style.overflow = 'hidden'
            } else {
              el.innerHTML = '<i class="material-icons">fullscreen</i>'
              document.body.removeAttribute('style')
            }
            break;
          case 'close':
            card.remove()
            break;
          case 'reload':
            card.insertAdjacentHTML('afterbegin', '<div class="card-loader-overlay"><div class="spinner-border text-white" role="status"></div></div>')
            card.dispatchEvent(new Event('card:reload'))
            break;
          case 'collapse':
            const collapsingTransition = parseFloat(getComputedStyle(document.querySelector('.collapsing'))['transitionDuration']) * 1000
            setTimeout(() => {
              if (document.querySelector(el.dataset.target).matches('.collapse.show')) {
                el.innerHTML = '<i class="material-icons">remove</i>'
              } else {
                el.innerHTML = '<i class="material-icons">add</i>'
              }
            }, collapsingTransition);
            break;
        }
      }
    })
  }

  // Nav section
  function navSection() {
    if (document.querySelector('#navSection')) {
      $('body').scrollspy('dispose')
      $('body').scrollspy({
        target: '#navSection',
        offset: 140,
      })
    }
    document.addEventListener('click', e => {
      if (e.target.closest('#navSection')) {
        const target = document.querySelector(e.target.getAttribute('href'))
        const y = target.getBoundingClientRect().top + window.pageYOffset - ((document.body.dataset.offset || 140) - 1)
        window.scrollTo({ top: y, behavior: 'smooth' })
        e.preventDefault()
      }
    })
  }

  // Set accordion active card
  function accordionActive() {
    $('.collapse.show[data-parent]').closest('.card').addClass('active')
    $(document)
      .on('show.bs.collapse', '.collapse[data-parent]', function () {
        $(this).closest('.card').addClass('active')
      })
      .on('hide.bs.collapse', '.collapse[data-parent]', function () {
        $(this).closest('.card').removeClass('active')
      })
  }

  // Dropdown hover
  function dropdownHover() {
    document.addEventListener('mouseover', e => {
      if (lgUp()) {
        if (e.target.closest('.dropdown-hover')) {
          $('.dropdown-hover').removeClass('show')
          e.target.closest('.dropdown-hover').classList.add('show')
        } else {
          $('.dropdown-hover').removeClass('show')
        }
      }
    })
  }

  // Table with check all & bulk action
  function checkAll() {
    if (document.querySelectorAll('.has-checkAll').length) {
      const activeTr= 'table-active'
      for (const el of document.querySelectorAll('.has-checkAll')) {
        const thCheckbox = el.querySelector('th input[type="checkbox"]')
        const tdCheckbox = el.querySelectorAll('tr > td:first-child input[type="checkbox"]')
        const bulkTarget = el.dataset.bulkTarget
        let activeClass = el.dataset.checkedClass
        activeClass = activeClass ? activeClass : activeTr
        thCheckbox.addEventListener('click', function () {
          for (const cb of tdCheckbox) {
            cb.checked = this.checked
            cb.checked ? cb.closest('tr').classList.add(activeClass) : cb.closest('tr').classList.remove(activeClass)
          }
          bulkTarget && toggleBulkDropdown(bulkTarget, tdCheckbox)
        })
        for (const cb of tdCheckbox) {
          cb.addEventListener('click', function () {
            this.checked ? this.closest('tr').classList.add(activeClass) : this.closest('tr').classList.remove(activeClass)
            bulkTarget && toggleBulkDropdown(bulkTarget, tdCheckbox)
          })
        }
      }
      function toggleBulkDropdown(el, tdCheckbox) {
        let count = 0
        const bulk_dropdown = document.querySelector(el)
        for (const cb of tdCheckbox) {
          cb.checked && count++
        }
        bulk_dropdown.querySelector('.checked-counter') && (bulk_dropdown.querySelector('.checked-counter').textContent = count)
        count != 0 ? bulk_dropdown.removeAttribute('hidden') : bulk_dropdown.setAttribute('hidden', '')
      }
    }
  }

  // Background cover
  function backgroundCover() {
    for (const el of document.querySelectorAll('[data-cover]')) {
      el.style.backgroundImage = `url(${el.dataset.cover})`
    }
  }

  // Toggle inner sidebar
  function innerToggleSidebar() {
    document.addEventListener('click', e => {
      if (e.target.closest('[data-toggle="inner-sidebar"]')) {
        const el = e.target.closest('[data-toggle="inner-sidebar"]')
        const body = document.body
        body.classList.toggle('inner-expand')
        if (body.classList.contains('inner-expand')) {
          el.innerHTML = '<i class="material-icons">close</i>'
        } else {
          el.innerHTML = '<i class="material-icons">arrow_forward_ios</i>'
        }
        e.preventDefault()
      }
    })
  }

  // Scrolling navbar
  function scrollNavbar() {
    if (document.querySelector('.main-navbar')) {
      const navbar = document.querySelector('.main-navbar .navbar-collapse')
      setTimeout(() => {
        resize(() => {
          if (lgUp()) {
            for (const el of document.querySelectorAll('[data-scroll]')) {
              if (navbar.querySelector('.navbar-nav').getBoundingClientRect().width > navbar.getBoundingClientRect().width) {
                el.removeAttribute('hidden')
              } else {
                el.setAttribute('hidden', '')
              }
            }
          }
        })()
      }, 500)
      for (const el of document.querySelectorAll('[data-scroll]')) {
        el.addEventListener('click', e => {
          let width = navbar.getBoundingClientRect().width / 2
          switch (el.dataset.scroll) {
            case 'left':
              navbar.scrollLeft -= width
              break;
            case 'right':
              navbar.scrollLeft += width
              break;
          }
          e.preventDefault()
        })
      }

      // fix dropdown-menu position
      $('.main-navbar .dropdown').on('show.bs.dropdown', function () {
        let margin = document.querySelector('.main-navbar .navbar-collapse').scrollLeft
        this.querySelector('.dropdown-menu').style.marginLeft = -margin + 'px'
      })
    }
  }

  // Feather icon
  function featherIcon() {
    feather.replace()
    const observer = new MutationObserver(() => feather.replace())
    observer.observe(document.querySelector('.main'), { childList: true, subtree: true, })
    observer.observe(document.querySelector('.sidebar'), { childList: true, subtree: true, })
  }

  return {
    resize: callback => resize(callback),
    xs: () => xs(),
    sm: () => sm(),
    md: () => md(),
    lg: () => lg(),
    xl: () => xl(),
    smDown: () => smDown(),
    mdDown: () => mdDown(),
    lgDown: () => lgDown(),
    smUp: () => smUp(),
    mdUp: () => mdUp(),
    lgUp: () => lgUp(),
    navSub: () => navSub(),
    sidebarBodyCustomScrollBar: () => sidebarBodyCustomScrollBar(),
    toggleSidebar: () => toggleSidebar(),
    autofocusModal: () => autofocusModal(),
    color: variant => getComputedStyle(document.body).getPropertyValue('--' + variant).trim(),
    cardToolbar: () => cardToolbar(),
    stopCardLoader: card => {
      let overlay = card.querySelector('.card-loader-overlay')
      overlay.parentNode.removeChild(overlay)
    },
    navSection: () => navSection(),
    accordionActive: () => accordionActive(),
    dropdownHover: () => dropdownHover(),
    checkAll: () => checkAll(),
    backgroundCover: () => backgroundCover(),
    innerToggleSidebar: () => innerToggleSidebar(),
    scrollNavbar: () => scrollNavbar(),
    featherIcon: () => featherIcon(),
  }
})()

bsCustomFileInput.init()
$(() => {
  $('[data-toggle="popover"]').popover()
  $('[data-toggle="tooltip"]').tooltip()
})

App.navSub()
App.sidebarBodyCustomScrollBar()
App.toggleSidebar()
App.autofocusModal()
App.cardToolbar()
App.navSection()
App.accordionActive()
App.dropdownHover()
App.checkAll()
App.backgroundCover()
App.scrollNavbar()
App.featherIcon()

const observer = new MutationObserver(() => {
  App.backgroundCover()
  App.navSection()
  App.accordionActive()
  $('[data-toggle="popover"]').popover()
  $('[data-toggle="tooltip"]').tooltip()
})
observer.observe(document.querySelector('.main'), { childList: true, subtree: true, })
observer.observe(document.querySelector('.sidebar'), { childList: true, subtree: true, })

// Sample colors
const blue   = App.color('blue')
const indigo = App.color('indigo')
const purple = App.color('purple')
const pink   = App.color('pink')
const red    = App.color('red')
const orange = App.color('orange')
const yellow = App.color('yellow')
const green  = App.color('green')
const teal   = App.color('teal')
const cyan   = App.color('cyan')
const gray   = App.color('gray')
const lime   = '#cddc39'

// This is for development, attach breakpoint to document title
/* App.resize(() => {
  if (App.xs()) { document.title = 'xs' }
  if (App.sm()) { document.title = 'sm' }
  if (App.md()) { document.title = 'md' }
  if (App.lg()) { document.title = 'lg' }
  if (App.xl()) { document.title = 'xl' }
})() */