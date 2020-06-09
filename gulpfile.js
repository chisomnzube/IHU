const { src, dest, watch, series, parallel } = require('gulp')
const autoprefixer = require('gulp-autoprefixer')
const fileinclude = require('gulp-file-include')
const liveServer = require('live-server')
const cleanCSS = require('gulp-clean-css')
const concat = require('gulp-concat')
const rename = require('gulp-rename')
const uglify = require('gulp-terser')
const cache = require('gulp-cached')
const sass = require('gulp-sass')
const all = require('gulp-all')

const dist = 'dist/'
const distHTML = `${dist}html/`
const distHTMLTOPNAV = `${dist}html-topnav/`
const distAJAX = `${dist}ajax/`
const distCSS = `${dist}css/`
const distJS = `${dist}js/`
const pluginsFolder = 'plugins/'

function htmlTask() {
  return src('src/html/*.html').pipe(cache('html')).pipe(fileinclude()).pipe(dest(distHTML))
}
function htmlTopnavTask() {
  return src('src/html-topnav/*.html').pipe(cache('html-topnav')).pipe(fileinclude()).pipe(dest(distHTMLTOPNAV))
}
function ajaxTask() {
  return src('src/ajax/*.html').pipe(cache('ajax')).pipe(fileinclude()).pipe(dest(distAJAX))
}
function clearHtmlCache(cb) {
  delete cache.caches['html']
  cb()
}
function clearHtmlTopnavCache(cb) {
  delete cache.caches['html-topnav']
  cb()
}
function clearAjaxCache(cb) {
  delete cache.caches['ajax']
  cb()
}

function _css(file) {
  return src(`src/scss/${file}.scss`, { sourcemaps: true })
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(dest(distCSS, { sourcemaps: '.' }))
}
function cssTask() {
  return all(
    _css('style'),
    _css('sidebar-dark'),
    _css('sidebar-blue'),
    _css('sidebar-cyan'),
    _css('sidebar-gray'),
    _css('sidebar-green'),
    _css('sidebar-pink'),
    _css('sidebar-purple'),
    _css('sidebar-red'),
    _css('sidebar-royal'),
    _css('sidebar-ash'),
    _css('sidebar-crimson'),
    _css('sidebar-namn'),
    _css('sidebar-frost'),
    _css('sidebar-white'),
  )
}
function cssMinTask() {
  return src([`${distCSS}**/*.css`, `!${distCSS}**/*.min.css`])
    .pipe(cleanCSS({ level: { 1: { specialComments: 0 } } }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(distCSS))
}

function jsTask() {
  return src('src/js/*.js')
    .pipe(dest(distJS))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(distJS))
}
function copyJS() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/jquery/dist/jquery.slim.js',
    'node_modules/jquery/dist/jquery.slim.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.bundle.js',
    'node_modules/bootstrap/dist/js/bootstrap.bundle.js.map',
    'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js.map',
  ]).pipe(dest(distJS))
}

function pluginsTask() {
  return all(
    // Bootstrap 4 custom file input
    src('node_modules/bs-custom-file-input/dist/**/*').pipe(dest(`${pluginsFolder}bs-custom-file-input`)),

    // Material icons
    src('node_modules/material-design-icons-iconfont/dist/**/*').pipe(dest(`${pluginsFolder}material-design-icons-iconfont`)),
    src('node_modules/material-design-icons-iconfont/dist/material-design-icons.css')
      .pipe(cleanCSS()).pipe(rename({ suffix: '.min' })).pipe(dest(`${pluginsFolder}material-design-icons-iconfont`)),

    // Fontawesome free
    src('node_modules/@fortawesome/fontawesome-free/css/**/*').pipe(dest(`${pluginsFolder}fontawesome-free/css`)),
    src('node_modules/@fortawesome/fontawesome-free/webfonts/**/*').pipe(dest(`${pluginsFolder}fontawesome-free/webfonts`)),

    // Feather icons
    src('node_modules/feather-icons/dist/**/*').pipe(dest(`${pluginsFolder}feather-icons`)),

    // Perfect scrollbar
    src([
      'node_modules/perfect-scrollbar/dist/perfect-scrollbar.js',
      'node_modules/perfect-scrollbar/dist/perfect-scrollbar.js.map',
      'node_modules/perfect-scrollbar/dist/perfect-scrollbar.min.js',
      'node_modules/perfect-scrollbar/dist/perfect-scrollbar.min.js.map',
      'node_modules/perfect-scrollbar/css/perfect-scrollbar.css',
    ]).pipe(dest(`${pluginsFolder}perfect-scrollbar`)),
    src('node_modules/perfect-scrollbar/css/perfect-scrollbar.css')
      .pipe(cleanCSS()).pipe(rename({ suffix: '.min' }))
      .pipe(dest(`${pluginsFolder}perfect-scrollbar`)),

    // Chart.js
    src('node_modules/chart.js/dist/*.js').pipe(dest(`${pluginsFolder}chart.js`)),

    // jQuery Sparkline
    src([
      'node_modules/jquery-sparkline/jquery.sparkline.js',
      'node_modules/jquery-sparkline/jquery.sparkline.min.js',
    ]).pipe(dest(`${pluginsFolder}jquery-sparkline`)),

    // jqvmap
    src('node_modules/jqvmap/dist/**/*').pipe(dest(`${pluginsFolder}jqvmap`)),

    // Swiper
    src([
      'node_modules/swiper/css/swiper.css',
      'node_modules/swiper/css/swiper.min.css',
      'node_modules/swiper/js/swiper.js',
      'node_modules/swiper/js/swiper.min.js',
    ]).pipe(dest(`${pluginsFolder}/swiper`)),

    // Bootbox
    src('node_modules/bootbox/dist/bootbox.min.js').pipe(dest(`${pluginsFolder}bootbox`)),

    // Noty
    src('node_modules/noty/lib/*.js').pipe(dest(`${pluginsFolder}noty`)),
    src('node_modules/noty/lib/noty.css').pipe(dest(`${pluginsFolder}noty`))
      .pipe(cleanCSS()).pipe(rename({ suffix: '.min' })).pipe(dest(`${pluginsFolder}noty`)),
    src('node_modules/noty/lib/themes/*.css').pipe(dest(`${pluginsFolder}noty/themes`))
      .pipe(cleanCSS()).pipe(rename({ suffix: '.min' })).pipe(dest(`${pluginsFolder}noty/themes`)),

    // Sortablejs
    src([
      'node_modules/sortablejs/Sortable.js',
      'node_modules/sortablejs/Sortable.min.js',
    ]).pipe(dest(`${pluginsFolder}sortablejs`)),

    // Datatables
    src('node_modules/datatables.net/js/**/*').pipe(dest(`${pluginsFolder}datatables`)),
    src('node_modules/datatables.net-bs4/css/**/*').pipe(dest(`${pluginsFolder}datatables`)),
    src('node_modules/datatables.net-bs4/js/**/*').pipe(dest(`${pluginsFolder}datatables`)),

    // Datatables Responsive
    src('node_modules/datatables.net-responsive/js/**/*').pipe(dest(`${pluginsFolder}datatables`)),
    src('node_modules/datatables.net-responsive-bs4/css/**/*').pipe(dest(`${pluginsFolder}datatables`)),
    src('node_modules/datatables.net-responsive-bs4/js/**/*').pipe(dest(`${pluginsFolder}datatables`)),

    // Concat Datatable bootstrap4 responsive for easy to use
    // ref: https://datatables.net/extensions/responsive/examples/styling/bootstrap4.html
    src([
      'node_modules/datatables.net/js/jquery.dataTables.js',
      'node_modules/datatables.net-bs4/js/dataTables.bootstrap4.js',
      'node_modules/datatables.net-responsive/js/dataTables.responsive.js',
      'node_modules/datatables.net-responsive-bs4/js/responsive.bootstrap4.js'
    ])
      .pipe(concat('jquery.dataTables.bootstrap4.responsive.js'))
      .pipe(dest(`${pluginsFolder}datatables`))
      .pipe(rename('jquery.dataTables.bootstrap4.responsive.min.js'))
      .pipe(uglify())
      .pipe(dest(`${pluginsFolder}datatables`)),

    // Autosize
    src([
      'node_modules/autosize/dist/autosize.js',
      'node_modules/autosize/dist/autosize.min.js',
    ]).pipe(dest(`${pluginsFolder}autosize`)),

    // Input Mask
    src([
      'node_modules/inputmask/dist/jquery.inputmask.js',
      'node_modules/inputmask/dist/jquery.inputmask.min.js',
    ]).pipe(dest(`${pluginsFolder}inputmask`)),

    // Flatpickr
    src('node_modules/flatpickr/dist/**/*').pipe(dest(`${pluginsFolder}flatpickr`)),

    // Clock Picker
    src('node_modules/clockpicker/dist/**/*').pipe(dest(`${pluginsFolder}clockpicker`)),

    // Bootstrap Color Picker
    src([
      'node_modules/bootstrap-colorpicker/dist/css/*.css',
      'node_modules/bootstrap-colorpicker/dist/js/*.js',
    ]).pipe(dest(`${pluginsFolder}bootstrap-colorpicker`)),

    // Bootstrap-select
    src('node_modules/bootstrap-select/dist/css/**/*').pipe(dest(`${pluginsFolder}bootstrap-select`)),
    src('node_modules/bootstrap-select/dist/js/**/*').pipe(dest(`${pluginsFolder}bootstrap-select`)),

    // Bootstrap Touchspin
    src('node_modules/bootstrap-touchspin/dist/*.*').pipe(dest(`${pluginsFolder}bootstrap-touchspin`)),

    // noUiSlider
    src('node_modules/nouislider/distribute/**/*').pipe(dest(`${pluginsFolder}nouislider`)),

    // Summernote
    src(['node_modules/summernote/dist/**/*', '!node_modules/summernote/dist/*.zip']).pipe(dest(`${pluginsFolder}summernote`)),

    // Markdown it
    src([
      'node_modules/markdown-it/dist/markdown-it.js',
      'node_modules/markdown-it/dist/markdown-it.min.js',
    ]).pipe(dest(`${pluginsFolder}markdown-it`)),

    // Fullcalendar
    src([
      'node_modules/@fullcalendar/core/main.css',
      'node_modules/@fullcalendar/core/main.min.css',
      'node_modules/@fullcalendar/core/main.js',
      'node_modules/@fullcalendar/core/main.min.js',
      'node_modules/@fullcalendar/core/locales-all.js',
      'node_modules/@fullcalendar/core/locales-all.min.js',
    ]).pipe(dest(`${pluginsFolder}fullcalendar/core`)),
    src([
      'node_modules/@fullcalendar/daygrid/main.css',
      'node_modules/@fullcalendar/daygrid/main.min.css',
      'node_modules/@fullcalendar/daygrid/main.js',
      'node_modules/@fullcalendar/daygrid/main.min.js',
    ]).pipe(dest(`${pluginsFolder}fullcalendar/daygrid`)),
    src([
      'node_modules/@fullcalendar/timegrid/main.css',
      'node_modules/@fullcalendar/timegrid/main.min.css',
      'node_modules/@fullcalendar/timegrid/main.js',
      'node_modules/@fullcalendar/timegrid/main.min.js',
    ]).pipe(dest(`${pluginsFolder}fullcalendar/timegrid`)),
    src([
      'node_modules/@fullcalendar/list/main.css',
      'node_modules/@fullcalendar/list/main.min.css',
      'node_modules/@fullcalendar/list/main.js',
      'node_modules/@fullcalendar/list/main.min.js',
    ]).pipe(dest(`${pluginsFolder}fullcalendar/list`)),
    src([
      'node_modules/@fullcalendar/bootstrap/main.css',
      'node_modules/@fullcalendar/bootstrap/main.min.css',
      'node_modules/@fullcalendar/bootstrap/main.js',
      'node_modules/@fullcalendar/bootstrap/main.min.js',
    ]).pipe(dest(`${pluginsFolder}fullcalendar/bootstrap`)),
    src([
      'node_modules/@fullcalendar/interaction/main.js',
      'node_modules/@fullcalendar/interaction/main.min.js',
    ]).pipe(dest(`${pluginsFolder}fullcalendar/interaction`)),

    // Photoswipe
    src('node_modules/photoswipe/dist/photoswipe.css').pipe(dest(`${pluginsFolder}photoswipe`)).pipe(cleanCSS()).pipe(rename({ suffix: '.min' })).pipe(dest(`${pluginsFolder}photoswipe`)),
    src('node_modules/photoswipe/dist/default-skin/*.*').pipe(dest(`${pluginsFolder}photoswipe/photoswipe-default-skin`)),
    src('node_modules/photoswipe/dist/default-skin/default-skin.css').pipe(cleanCSS()).pipe(rename({ suffix: '.min' })).pipe(dest(`${pluginsFolder}photoswipe/photoswipe-default-skin`)),
    src('node_modules/photoswipe/dist/*.js').pipe(dest(`${pluginsFolder}photoswipe`)),

    // Smartwizard
    src('node_modules/smartwizard/dist/**/*').pipe(dest(`${pluginsFolder}smartwizard`)),

  )
}

function serveTask() {
  liveServer.start({
    port: 4441,
    noCssInject: true,
    watch: [
      `${distCSS}style.min.css`,
      `${distHTML}*.html`,
      `${distHTMLTOPNAV}*.html`,
      `${distAJAX}*.html`,
      `${distJS}*.js`,
      'dist/docs/*.html',
    ]
  })
  // if you use Windows, and experience random reload issue while using live-server,
  // please open cmd as Administrator, and run the following command
  // "fsutil behavior set disablelastaccess 1" without quotes
  // then restart your computer
  // Ref: https://github.com/nodejs/node/issues/21643
}

function watchTask() {
  watch('src/html/*.html', htmlTask)
  watch('src/html-topnav/*.html', htmlTopnavTask)
  watch('src/ajax/*.html', ajaxTask)
  watch(['src/html/include/*.html', 'src/html/content/*.*'], series(clearHtmlCache, htmlTask, clearHtmlTopnavCache, htmlTopnavTask, clearAjaxCache, ajaxTask))
  watch('src/html-topnav/include/*.html', series(clearHtmlTopnavCache, htmlTopnavTask))
  watch('src/ajax/include/*.html', series(clearAjaxCache, ajaxTask))
  watch('src/scss/**/*.scss', series(cssTask, cssMinTask))
  watch('src/js/*.js', jsTask)
}

exports.default = series(htmlTask, cssTask, cssMinTask, copyJS, jsTask, parallel(serveTask, watchTask))
exports.watch = parallel(serveTask, watchTask)
exports.copyJS = copyJS
exports.plugins = pluginsTask