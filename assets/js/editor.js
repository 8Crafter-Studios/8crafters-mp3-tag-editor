
const importedFiles = []
let currentIndex = -1
let blankImage = ''

let imageBytes = null
let imageType = ''
let mp3tag = null

function loadFile(file){
  const r = new FileReader();
  return new Promise((resolve, reject)=>{
    r.onload = ()=>resolve(r.result)
    r.onerror = reject
    r.readAsArrayBuffer(file)
  })
};

$(document).ready(function () {
  blankImage = $('#cover-preview').attr('src')
  $('#list-wrapper').on('dragenter', function (event) {
    event.preventDefault()
  })

  $('#list-wrapper').on('dragleave', function (event) {
    event.preventDefault()
  })

  $('#list-wrapper').on('dragover', function (event) {
    event.preventDefault()
  })

  $('#list-wrapper').on('drop', function (event) {
    event.preventDefault()
    importFiles(event.originalEvent.dataTransfer.files)
  })

  $('#list-wrapper').click(resetForm)
  $('#clear-cover-art-button').click(()=>{
    imageBytes = "-1"
    imageType = null
    $('#cover-preview').attr('src', blankImage)
    $('#cover-preview').attr('style', "image-rendering: pixelated;")
    $('#cover-art-debug').text("No Debug Info")
  })

  $('#file-audios').on('change', function () {
     console.log(1.1)
    const files = $(this).prop('files')
    importFiles(files)
    $(this).val('')
    console.log(1)
  })

  $('#cover').on('change', async function () {
    const files = $(this).prop('files')
    if (files.length === 0) return false

    const file = files[0]
    const buffer = await loadFile(file)
    imageBytes = new Uint8Array(buffer)
    imageType = file.type
    $('#cover-filename').text(file.name)
    const url = imageURL(imageBytes, file.type)
    $('#cover-preview').attr('src', url)
$('#cover-art-debug').text("Format: "+imageType)
  })

  $('#edit-form').submit(function (event) {
    event.preventDefault()
    if (currentIndex >= 0) writeData()
  })

  $('#download').click(function () {
    const file = importedFiles[currentIndex]
    $(this).attr({
      href: URL.createObjectURL(file),
      download: file.name
    })
  })

  $('#track, #year').on('input', function (event) {
    const validity = $(this).prop('validity')
    const note = $(this).parent().parent().children('.note')

    if (validity.valid) {
      $(note).text('')
      $(note).parent().removeClass('position-relative errored')
    } else {
      $(note).text('Invalid value')
      $(note).parent().addClass('position-relative errored')
    }
  })
})

function importFiles (files) {
  $('#blankslate').remove()
  $('#audio-list').parent().removeClass('d-none')

  const temp = $('#audio-item-template').prop('content')
  for (let i = 0; i < files.length; i++) {
    if (files[i].type.match(/^(audio)\/([a-z0-9\-]+)$/)) {
      const audioItem = $(temp).clone()
      importedFiles.push(files[i])

      $(audioItem).find('[data-temp=\'filename\']').text(files[i].name)
      $(audioItem).find('[data-temp]').removeAttr('data-temp')
      let a = $(audioItem).find('[data-audio]')
      console.log(a)
      console.log(audioItem)
      a.click(audioView)
      console.log(2)

      $('#audio-list').append(audioItem)
    } else {
      const message = 'MIME/Type of a file is not supported. Skipped'
      toast(message, TOAST_WARNING)
    }
  }
}/*

function toast(str, pre = "Toast: "){console.log(pre+str)}
const TOAST_INFO = "Toast Info: "
const TOAST_DANGER = "Toast Danger: "
const TOAST_SUCCESS = "Toast Success: "*/

async function audioView (event) {
  console.log(4)
  event.stopPropagation()
  resetForm()

  currentIndex = $(this).index()
  const audioItem = $(this)
  const file = importedFiles[currentIndex]

  $('#edit-form [disabled]').attr('disabled', null)
  $('#edit-form .disabled').removeClass('disabled')
  $('#cover-file-select-button [disabled]').attr('disabled', null)
  $('#cover-file-select-button .disabled').removeClass('disabled')
  $(audioItem).addClass('flash')
  console.log(6)
try{TOAST_INFO; TOAST_DANGER; TOAST_SUCCESS}catch(e){console.error(e.toString(), e.stack)}
  try{toast('Reading file and tags. Please wait...', TOAST_INFO)}catch(e){console.error(e.toString(), e.stack)}
  console.log(7)
  try{
    mp3tag = new MP3Tag(await loadFile(file))
    mp3tag.read()
   }catch(e){console.error(e.toString(), e.stack)}
  console.log(5)

  if (mp3tag.error === '') {
    displayDetails()
    toast('Details was displayed', TOAST_SUCCESS)
  } else {console.log(mp3tag.error); toast(mp3tag.error, TOAST_DANGER)}
}

function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

function imageURL(data, type){
  try{const r = `data:${type};base64,${_arrayBufferToBase64(data)}`; console.log(r); return r;}catch(e){console.error(e.toString(), e.stack)}
}

function displayDetails () {
  console.log(3)
  const tags = mp3tag.tags
  $('#title').val(tags.title)
  $('#artist').val(tags.artist)
  $('#album').val(tags.album)
  $('#year').val(tags.year)
  $('#track').val(tags.track)
  $('#genre').val(tags.genre)

  if (tags.v2) {
    if (tags.v2.APIC && tags.v2.APIC.length > 0) {
      const image = tags.v2.APIC[0]
      // console.log(9, image, image.data, image.format)
      $('#cover-preview').attr({
        src: imageURL(image.data, image.format),
        style: null
      })
      $('#cover-art-debug').text(`Format: ${image.format??"null"}`)
    }

    if (tags.v2.TCOM) $('#composer').val(tags.v2.TCOM)
    if (tags.v2.USLT && tags.v2.USLT.length > 0) {
      $('#lyrics').val(tags.v2.USLT[0].text)
    }

    if (tags.v2.PCNT) $('#play_count').val(tags.v2.PCNT)
    if (tags.v2.TPOS) $('#disk').val(tags.v2.TPOS)
    if (tags.v2.TRCK) $('#track').val(tags.v2.TRCK)
    if (tags.v2.TOAL) $('#origalbum').val(tags.v2.TOAL)
  }
}

async function writeData () {
  toast('Writing the tags to file', TOAST_INFO)
  writeDetails()

  mp3tag.save()
  if (mp3tag.error === '') {
    const file = importedFiles[currentIndex]
    const modifiedFile = new File([mp3tag.buffer], file.name, {
      type: file.type
    })

    importedFiles[currentIndex] = modifiedFile
    toast('MP3 was modified and ready to download', TOAST_SUCCESS)
  } else toast(mp3tag.error, TOAST_DANGER)
}

async function writeDetails () {
  mp3tag.tags.v1 = mp3tag.tags.v1 || {}
  mp3tag.tags.v2 = mp3tag.tags.v2 || {}

  mp3tag.tags.title = $('#title').val()
  mp3tag.tags.artist = $('#artist').val()
  mp3tag.tags.album = $('#album').val()
  mp3tag.tags.year = $('#year').val()
  mp3tag.tags.track = $('#track').val()
  mp3tag.tags.genre = $('#genre').val()
  mp3tag.tags.v2.TCOM = $('#composer').val()
  mp3tag.tags.v2.TPOS = $('#disk').val()
  mp3tag.tags.v2.TOAL = $('#origalbum').val()
  if($('#play_count').val()===""){
    delete mp3tag.tags.v2.PCNT
  }else{
    mp3tag.tags.v2.PCNT = $('#play_count').val()
  }

  if (imageBytes === "-1") {
    mp3tag.tags.v2.APIC = []
  } else if (imageBytes !== null) {
    mp3tag.tags.v2.APIC = [{
      format: imageType,
      type: 3,
      description: '',
      data: imageBytes
    }]
  }

  const lyrics = $('#lyrics').val()
  if (lyrics !== '') {
    mp3tag.tags.v2.USLT = [{
      language: 'eng',
      descriptor: '',
      text: lyrics
    }]
  }
}

function resetForm () {
  currentIndex = -1
  mp3tag = null
  imageBytes = null

  $('#edit-form').trigger('reset')
  $('#edit-form').find('input, textarea, select, button').attr('disabled', true)
  $('#a-button').attr('disabled', true)
  $('#edit-form .form-group').removeClass('position-relative errored')
  $('#download').attr({ href: null, download: null })
  $('#download').addClass('disabled')
  $('#cover-preview').attr('src', blankImage)
  $('#cover-preview').attr('style', "image-rendering: pixelated;")
  $('#cover-art-debug').text("No Debug Info")
  $('#audio-list').find('.flash').removeClass('flash')
}
