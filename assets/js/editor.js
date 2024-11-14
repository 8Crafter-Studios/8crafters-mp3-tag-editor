try{exec; console.log(globalThis.execute)}catch(e){console.error(e.toString(), e.stack)}
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
    console.log(1)
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

  $('#apply_selected_image').click(()=>{
    const files = $('#cover').prop('files')
    if (files.length === 0) {
      $('#apply_selected_image').attr('disabled', "");
      return false;
    };

    $('#cover').change()
  })
  $('#file-audios').on('change', function () {
    const files = $(this).prop('files')
    importFiles(files)
    $(this).val('')
    console.log(1)
  })

  $('#cover').on('change', async function () {try{
    const files = $(this).prop('files')
    if (files.length === 0) {
      $('#apply_selected_image').attr('disabled', "");
      return false;
    };
    $('#apply_selected_image').attr('disabled', null);

    const file = files[0]
    const buffer = await loadFile(file)
    imageBytes = new Uint8Array(buffer)
    imageType = file.type
    $('#cover-filename').text(file.name)
    const url = imageURL(imageBytes, file.type)
    $('#cover-preview').attr('src', url)
$('#cover-art-debug').text("Format: "+imageType)}catch(e){console.error(e.toString(), e.stack)}
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
  const allApplyOptionsDiv = $('#allapply').find('#dropdowncontents').find('div')
  Object.values(tagVersionMap).forEach(option=>allApplyOptionsDiv.append(`
        <div class="mcdropdownoption" ontouchstart="" onclick="const checkbox = $(this).find('input[type=\\\'checkbox\\\']'); checkbox.prop('checked', !checkbox.prop('checked'))">
          <input type="checkbox" id="${option.allApplyEnabledId}" class="mctoggle" form="">
          <div class="mctogglecheckbox"></div>
          <label>${option.name2}</label>
        </div>`))

  $('#track, #year, #disk').on('input', function (event) {
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
    console.log(1)
})

async function applySelectedOptionsToAll(){
  const allApplyOptionsDiv = $('#allapply').find('#dropdowncontents').find('div')
  for await(let option of Object.values(tagVersionMap)){
    if(allApplyOptionsDiv.find('#'+option.allApplyEnabledId).prop('checked')==true){
      await writeOptionToAll(option)                              
    }
  }
}

function importFiles (files) {
  console.log(1)
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
      a.click(audioView)

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
  event.stopPropagation()
  resetForm()

  currentIndex = $(this).index()
  const audioItem = $(this)
  const file = importedFiles[currentIndex]

  $('#edit-form [disabled]:not(.no-remove-disabled, #apply_selected_image)').attr('disabled', null)
  $('#edit-form .disabled').removeClass('disabled')
  $('#cover-file-select-button [disabled]').attr('disabled', null)
  $('#cover-file-select-button .disabled').removeClass('disabled')
  if($('#cover').prop('files').length>0){
    $('#apply_selected_image').attr('disabled', null)
  }else{
    $('#apply_selected_image').attr('disabled', "")
  }
  $('#edit-form').find('.mcdropdown').find('#dropdowncontents').find('*').attr('inert', null)
  $('#edit-form').find('.mcdropdown').find('#dropdowncontents').find('*').removeClass('.disabled-toggle-checkbox')
  $(audioItem).addClass('flash')
try{TOAST_INFO; TOAST_DANGER; TOAST_SUCCESS}catch(e){console.error(e.toString(), e.stack)}
  try{toast('Reading file and tags. Please wait...', TOAST_INFO)}catch(e){console.error(e.toString(), e.stack)}
  try{
    mp3tag = new MP3Tag(await loadFile(file))
    mp3tag.read({
      id3v1: true,
      id3v2: true,
      unsupported: true
    })
   }catch(e){console.error(e.toString(), e.stack)}

  if (mp3tag.error === '') {
    displayDetails()
    toast('Details were displayed', TOAST_SUCCESS)
  } else {console.log(mp3tag.error); toast(mp3tag.error, TOAST_DANGER)}
}/*

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
}*/

function logmp3tag(){
  console.log(JSONB.stringify(mp3tag, (key, value)=>value.length>=1000?"Too Long To Display; Length: "+value.length:value, 2, {undefined: true, null: true, NaN: true, bigint: true, Infinity: true, NegativeInfinity: true}))
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
  $('#comment').val(tags.comment)
  if (tags.v1?.comment && tags.v1?.comment?.length > 0) {
    $('#comment').val(tags.v1.comment)
  }
  try{
    $('#raw_tags').val(JSONB.stringify(tags, undefined, 2, {undefined: true, null: true, NaN: true, bigint: true, Infinity: true, NegativeInfinity: true}))
  }catch{
    try{
      $('#raw_tags').val(JSON.stringify(tags, undefined, 2))
    }catch(e){
      console.error(e.toString, e.stack)
    }
  }

  if (tags.v2) {
    if (tags.v2.APIC && tags.v2.APIC.length > 0) {
      const image = tags.v2.APIC[0]
      // console.log(9, image, image.data, image.format)
      $('#cover-preview').attr({
        src: imageURL(image.data, image.format),
        style: null
      })
      $('#cover-art-debug').text(`Format: ${image.format??"null"}`)
      imageBytes=image.data;
      imageType=image.format;
    } else if (tags.v2.PIC && tags.v2.PIC.length > 0) {
      const image = tags.v2.PIC[0]
      // console.log(9, image, image.data, image.format)
      $('#cover-preview').attr({
        src: imageURL(image.data, image.format),
        style: null
      })
      $('#cover-art-debug').text(`Format: ${image.format??"null"}`)
      imageBytes=image.data;
      imageType=image.format;
    }

    if (tags.v2.TCOM) $('#composer').val(tags.v2.TCOM)
    if (tags.v2.USLT && tags.v2.USLT.length > 0) {
      $('#lyrics').val(tags.v2.USLT[0].text)
    } else if (tags.v2.ULT && tags.v2.ULT.length > 0) {
      $('#lyrics').val(tags.v2.ULT[0].text)
    }
    if (tags.v2.COMM && tags.v2.COMM.length > 0) {
      $('#comment').val(tags.v2.COMM[0].text)
    } else if (tags.v2.COM && tags.v2.COM.length > 0) {
      $('#comment').val(tags.v2.COM[0].text)
    }

    if (tags.v2.PCNT??tags.v2.CNT) $('#play_count').val(tags.v2.PCNT??tags.v2.CNT)
    if (tags.v2.TPOS) $('#disk').val(tags.v2.TPOS)
    if (tags.v2.TRCK) $('#track').val(tags.v2.TRCK)
    if (tags.v2.TOAL) $('#origalbum').val(tags.v2.TOAL)
    if (tags.v2.TOPE) $('#origartist').val(tags.v2.TOPE)
    if (tags.v2.TOFN) $('#origfilename').val(tags.v2.TOFN)
    if (tags.v2.TOLY) $('#origlyricist').val(tags.v2.TOLY)
    try{
    if (tags.v2.TORY) $('#origyear').val(tags.v2.TORY)
    if (tags.v2.TDOR) $('#origyear').val(tags.v2.TDOR)}catch(e){console.error(e.toString(), e.stack)}
    if (tags.v2.TPUB) $('#publisher').val(tags.v2.TPUB)
    if (tags.v2.WOAS) $('#wwwaudiosource').val(tags.v2.WOAS)
    try{
      $('#v1Debug').text("v1 Details: "+(JSON.stringify(tags.v1Details)??"N/A"))
      $('#v2Debug').text("v2 Details: "+(JSON.stringify(tags.v2Details)??"N/A"))
      $('#year').val(tags.v2.TDRC??tags.v2.TYER??tags.v2.TYE??tags.v1?.year)
    }catch(e){console.error(e.toString(), e.stack)}

  }
}

const tagVersionMap = {
  cover: {
    v1: undefined,
    v2_2: "PIC",
    v2_3: "APIC",
    v2_4: "APIC",
    name3: "cover art",
    name2: "Cover Art",
    name: "cover",
    frameSyntax: "APIC",
    allApplyEnabledId: "AAECover",
  },
  title: {
    v1: "title",
    v2_2: "TT2",
    v2_3: "TIT2",
    v2_4: "TIT2",
    name3: "title",
    name2: "Title",
    name: "title",
    frameSyntax: "default",
    allApplyEnabledId: "AAETitle",
  },
  artist: {
    v1: "artist",
    v2_2: "TP1",
    v2_3: "TPE1",
    v2_4: "TPE1",
    name3: "artist",
    name2: "Artist",
    name: "artist",
    frameSyntax: "default",
    allApplyEnabledId: "AAEArtist",
  },
  album: {
    v1: "album",
    v2_2: "TAL",
    v2_3: "TALB",
    v2_4: "TALB",
    name3: "album",
    name2: "Album",
    name: "album",
    frameSyntax: "default",
    allApplyEnabledId: "AAEAlbum",
  },
  track: {
    v1: "track",
    v2_2: "TRK",
    v2_3: "TRCK",
    v2_4: "TRCK",
    name3: "track number",
    name2: "Track Number",
    name: "track",
    frameSyntax: "default",
    allApplyEnabledId: "AAETrack",
  },
  disk: {
    v1: undefined,
    v2_2: "TPA",
    v2_3: "TPOS",
    v2_4: "TPOS",
    name3: "disk number",
    name2: "Disk Number",
    name: "disk",
    frameSyntax: "fraction",
    allApplyEnabledId: "AAEDisk",
  },
  genre: {
    v1: "genre",
    v2_2: "TCO",
    v2_3: "TCON",
    v2_4: "TCON",
    name3: "genre",
    name2: "Genre",
    name: "genre",
    frameSyntax: "genre",
    allApplyEnabledId: "AAEGenre",
  },
  year: {
    v1: "year",
    v2_2: "TYE",
    v2_3: "TYER",
    v2_4: "TDRC",
    name3: "year",
    name2: "Year",
    name: "year",
    frameSyntax: "year",
    allApplyEnabledId: "AAEYear",
  },
  composer: {
    v1: undefined,
    v2_2: "TCM",
    v2_3: "TCOM",
    v2_4: "TCOM",
    name3: "composer",
    name2: "Composer",
    name: "composer",
    frameSyntax: "default",
    allApplyEnabledId: "AAEComposer",
  },
  publisher: {
    v1: undefined,
    v2_2: "TPB",
    v2_3: "TPUB",
    v2_4: "TPUB",
    name3: "publisher",
    name2: "Publisher",
    name: "publisher",
    frameSyntax: "default",
    allApplyEnabledId: "AAEPublisher",
  },
  comment: {
    v1: "comment",
    v2_2: "COM",
    v2_3: "COMM",
    v2_4: "COMM",
    name3: "comment",
    name2: "Comment",
    name: "comment",
    frameSyntax: "lang",
    allApplyEnabledId: "AAEComment",
  },
  origalbum: {
    v1: undefined,
    v2_2: "TOT",
    v2_3: "TOAL",
    v2_4: "TOAL",
    name3: "original album",
    name2: "Original Album",
    name: "origalbum",
    frameSyntax: "default",
    allApplyEnabledId: "AAEOrigAlbum",
  },
  origartist: {
    v1: undefined,
    v2_2: "TOA",
    v2_3: "TOPE",
    v2_4: "TOPE",
    name3: "original artist",
    name2: "Original Artist",
    name: "origartist",
    frameSyntax: "default",
    allApplyEnabledId: "AAEOrigArtist",
  },
  origfilename: {
    v1: undefined,
    v2_2: "TOF",
    v2_3: "TOFN",
    v2_4: "TOFN",
    name3: "original file name",
    name2: "Original File Name",
    name: "origfilename",
    frameSyntax: "default",
    allApplyEnabledId: "AAEOrigFileName",
  },
  origlyricist: {
    v1: undefined,
    v2_2: "TOL",
    v2_3: "TOLY",
    v2_4: "TOLY",
    name3: "original lyricist",
    name2: "Original Lyricist",
    name: "origlyricist",
    frameSyntax: "default",
    allApplyEnabledId: "AAELyricist",
  },
  origyear: {
    v1: undefined,
    v2_2: "TOR",
    v2_3: "TORY",
    v2_4: "TDOR",
    name3: "original year",
    name2: "Original Year",
    name: "origyear",
    frameSyntax: "year",
    allApplyEnabledId: "AAEOrigYear",
  },
  wwwaudiosource: {
    v1: undefined,
    v2_2: "WAS",
    v2_3: "WOAS",
    v2_4: "WOAS",
    name3: "audio source URL",
    name2: "Audio Source URL",
    name: "wwwaudiosource",
    frameSyntax: "URL",
    allApplyEnabledId: "AAEWWWAudioSource",
  },
  remixer: {
    v1: undefined,
    v2_2: "TP4",
    v2_3: "TPE4",
    v2_4: "TPE4",
    name3: "remixer",
    name2: "Remixer",
    name: "remixer",
    frameSyntax: "default",
    allApplyEnabledId: "AAERemixer",
  },
  tpe2: {
    v1: undefined,
    v2_2: "TP2",
    v2_3: "TPE2",
    v2_4: "TPE2",
    name3: "release time",
    name2: "Release Time",
    name: "tpe2",
    frameSyntax: "default",
    allApplyEnabledId: "AAETPE2",
  },
  conductor: {
    v1: undefined,
    v2_2: "TP3",
    v2_3: "TPE3",
    v2_4: "TPE3",
    name3: "conductor",
    name2: "Conductor",
    name: "conductor",
    frameSyntax: "default",
    allApplyEnabledId: "AAEConductor",
  },
  lyrics: {
    v1: undefined,
    v2_2: "ULT",
    v2_3: "USLT",
    v2_4: "USLT",
    name3: "lyrics",
    name2: "Lyrics",
    name: "lyrics",
    frameSyntax: "lang",
    allApplyEnabledId: "AAELyrics",
  },
  play_count: {
    v1: undefined,
    v2_2: "CNT",
    v2_3: "PCNT",
    v2_4: "PCNT",
    name3: "play count",
    name2: "Play Count",
    name: "play_count",
    frameSyntax: "number",
    allApplyEnabledId: "AAEPlayCount",
  }, 
  releasetime: {
    v1: undefined,
    v2_2: undefined,
    v2_3: undefined,
    v2_4: "TDRL",
    name3: "release time",
    name2: "Release Time",
    name: "releasetime",
    frameSyntax: "time",
    allApplyEnabledId: "AAEReleaseTime",
  },
};

async function writeOptionToAll (option) {
  toast('Writing the '+option.name3+' to all files', TOAST_INFO)
  let i = 0;
  for await(let file of importedFiles){
  try{
    mp3tag = new MP3Tag(await loadFile(file))
    mp3tag.read({
      id3v1: true,
      id3v2: true,
      unsupported: true
    })

  mp3tag.tags.v1??={comment: ""}
  mp3tag.tags.v2??={}
  value = option.disableV1Value?undefined:option.v1Value??option.value??$('#'+option.name).val()
  if(option.frameSyntax=="APIC"){
    if (imageBytes === "-1") {
      value = []
    } else if (imageBytes !== null) {
      value = [{
        format: imageType,
        type: 3,
        description: '',
        data: imageBytes
      }]
    }else{
      value = []
    }
  }
  v2Value = option.disableV2Value?undefined:option.v2Value??option.value??value
  if(option.frameSyntax=="lang"){
    v2Value = option.v2Value??option.value??[{
      language: option.language??'eng',
      descriptor: option.langDescriptor??'',
      text: value
    }]
  }
  if(!!option.v1){
    mp3tag.tags.v1[option.v1] = value
  }
  if(!!option.v2_2){
    mp3tag.tags.v2[option.v2_2] = v2Value
  }
  if(!!option.v2_3){
    mp3tag.tags.v2[option.v2_3] = v2Value
  }
  if(!!option.v2_4){
    mp3tag.tags.v2[option.v2_4] = v2Value
  }
  toast(`Wrote the ${option.name3} to ${file.name}[${i}]`, TOAST_INFOBULB)
  console.log(((!!mp3tag.tags.v2Details)||(!!mp3tag.tags.v1Details)))
  mp3tag.save(((!!mp3tag.tags.v2Details)||(!!mp3tag.tags.v1Details))?undefined:({
    id3v1: {
      include: $('#inc1').prop('checked')
    },
    id3v2: {
      include: $('#tver').prop('selectedIndex') !== 0,
      version: [undefined, 2, 3, 4][$('#tver').prop('selectedIndex')],
      unsupported: $('#incu').prop('checked')
    }
  }))
  if (mp3tag.error === '') {
    const modifiedFile = new File([mp3tag.buffer], file.name, {
      type: file.type
    })

    importedFiles[i] = modifiedFile
    toast('MP3 was modified and is ready to download', TOAST_SUCCESS)
  } else toast(mp3tag.error, TOAST_DANGER)
    }catch(e){console.error(e.toString(), e.stack)}
    i++;
  }
}


async function writeTitleToAll () {
  toast('Writing the title to all files', TOAST_INFO)
  let i = 0;
  for await(let file of importedFiles){
  try{
    mp3tag = new MP3Tag(await loadFile(file))
    mp3tag.read({
      id3v1: true,
      id3v2: true,
      unsupported: true
    })

  mp3tag.tags.v1??={comment: ""}
  mp3tag.tags.v2??={}
  mp3tag.tags.v1.title = $('#title').val()
  mp3tag.tags.v2.TT2 = $('#title').val()
  mp3tag.tags.v2.TIT2 = $('#title').val()
  toast(`Wrote the title to ${file.name}[${i}]`, TOAST_INFOBULB)
  console.log(((!!mp3tag.tags.v2Details)||(!!mp3tag.tags.v1Details)))
  mp3tag.save(((!!mp3tag.tags.v2Details)||(!!mp3tag.tags.v1Details))?undefined:({
    id3v1: {
      include: $('#inc1').prop('checked')
    },
    id3v2: {
      include: $('#tver').prop('selectedIndex') !== 0,
      version: [undefined, 2, 3, 4][$('#tver').prop('selectedIndex')],
      unsupported: $('#incu').prop('checked')
    }
  }))
  if (mp3tag.error === '') {
    const modifiedFile = new File([mp3tag.buffer], file.name, {
      type: file.type
    })

    importedFiles[i] = modifiedFile
    toast('MP3 was modified and is ready to download', TOAST_SUCCESS)
  } else toast(mp3tag.error, TOAST_DANGER)
    }catch(e){console.error(e.toString(), e.stack)}
    i++;
  }
}

async function writeData () {
  toast('Writing the tags to file', TOAST_INFO)
  writeDetails()

  mp3tag.save({
    id3v1: {
      include: $('#inc1').prop('checked')/*$('#tver').prop('selectedIndex') === 0*/
    },
      id3v2: {
      include: $('#tver').prop('selectedIndex') !== 0,
      version: [undefined, 2, 3, 4][$('#tver').prop('selectedIndex')],
      unsupported: $('#incu').prop('checked')
    }
  })
  if (mp3tag.error === '') {
    const file = importedFiles[currentIndex]
    const modifiedFile = new File([mp3tag.buffer], file.name, {
      type: file.type
    })

    importedFiles[currentIndex] = modifiedFile
    toast('MP3 was modified and is ready to download', TOAST_SUCCESS)
  } else {toast(mp3tag.error, TOAST_DANGER); console.error(mp3tag.error)}
}

async function writeDetails () {
  if($('#tver').prop('selectedIndex') !== 0){
    mp3tag.tags.v2Details.version=[[2, 2, 3, 4][$('#tver').prop('selectedIndex')], 0]
  }
  mp3tag.tags.v1 = mp3tag.tags.v1 || {}
  mp3tag.tags.v2 = mp3tag.tags.v2 || {}

if($('#tver').prop('selectedIndex') === 0){
  mp3tag.tags.v1.title = $('#title').val()
  mp3tag.tags.v1.artist = $('#artist').val()
  mp3tag.tags.v1.album = $('#album').val()
  mp3tag.tags.v1.year = $('#year').val()
  mp3tag.tags.v1.track = $('#track').val()
  mp3tag.tags.v1.genre = $('#genre').val()
  mp3tag.tags.v1.comment = $('#comment').val()
}else if($('#tver').prop('selectedIndex') === 1){
  mp3tag.tags.v2.TT2 = $('#title').val()
  mp3tag.tags.v2.TP1 = $('#artist').val()
  mp3tag.tags.v2.TAL = $('#album').val()
  mp3tag.tags.v2.TYE = $('#year').val()
  mp3tag.tags.v2.TRK = $('#track').val()
  mp3tag.tags.v2.TCO = $('#genre').val()
  mp3tag.tags.v2.TCM = $('#composer').val()
  mp3tag.tags.v2.TPA = $('#disk').val()
  mp3tag.tags.v2.TPB = $('#publisher').val()
  mp3tag.tags.v2.TOT = $('#origalbum').val()
  mp3tag.tags.v2.TOA = $('#origartist').val()
  mp3tag.tags.v2.TOF = $('#origfilename').val()
  mp3tag.tags.v2.TOL = $('#origlyricist').val()
  try{mp3tag.tags.v2.TOR = $('#origyear').val()}catch(e){console.error(e.toString(), e.stack)}
  mp3tag.tags.v2.WAS = $('#wwwaudiosource').val()
  const comment = $('#comment').val()
  if (comment !== '') {
    mp3tag.tags.v2.COM = [{
      language: 'eng',
      descriptor: '',
      text: comment
    }]
  }else{
    delete mp3tag.tags.v2.COM;
  }
  if($('#play_count').val()===""){
    delete mp3tag.tags.v2.CNT
  }else{
    mp3tag.tags.v2.CNT = $('#play_count').val()
  }
  const lyrics = $('#lyrics').val()
  if (lyrics !== '') {
    mp3tag.tags.v2.ULT = [{
      language: 'eng',
      descriptor: '',
      text: lyrics
    }]
  }else{
    delete mp3tag.tags.v2.ULT;
  }
  mp3tag.tags.v2.TP4 = $('#remixer').val()
  mp3tag.tags.v2.TP2 = $('#tpe2').val()
  mp3tag.tags.v2.TP3 = $('#conductor').val()
  if (imageBytes === "-1") {
    mp3tag.tags.v2.PIC = []
  } else if (imageBytes !== null) {
    mp3tag.tags.v2.PIC = [{
      format: imageType,
      type: 3,
      description: '',
      data: imageBytes
    }]
  }
}else if($('#tver').prop('selectedIndex') === 2){
  mp3tag.tags.v2.TIT2 = $('#title').val()
  mp3tag.tags.v2.TPE1 = $('#artist').val()
  mp3tag.tags.v2.TALB = $('#album').val()
  mp3tag.tags.v2.TYER = $('#year').val()
  mp3tag.tags.v2.TRCK = $('#track').val()
  mp3tag.tags.v2.TCON = $('#genre').val()
  mp3tag.tags.v2.TCOM = $('#composer').val()
  mp3tag.tags.v2.TPOS = $('#disk').val()
  mp3tag.tags.v2.TPUB = $('#publisher').val()
  mp3tag.tags.v2.TOAL = $('#origalbum').val()
  mp3tag.tags.v2.TOPE = $('#origartist').val()
  mp3tag.tags.v2.TOFN = $('#origfilename').val()
  mp3tag.tags.v2.TOLY = $('#origlyricist').val()
  try{mp3tag.tags.v2.TORY = $('#origyear').val()}catch(e){console.error(e.toString(), e.stack)}
  mp3tag.tags.v2.WOAS = $('#wwwaudiosource').val()
  if($('#play_count').val()===""){
    delete mp3tag.tags.v2.PCNT
  }else{
    mp3tag.tags.v2.PCNT = $('#play_count').val()
  }
  const lyrics = $('#lyrics').val()
  if (lyrics !== '') {
    mp3tag.tags.v2.USLT = [{
      language: 'eng',
      descriptor: '',
      text: lyrics
    }]
  }
  const comment = $('#comment').val()
  if (comment !== '') {
    mp3tag.tags.v2.COMM = [{
      language: 'eng',
      descriptor: '',
      text: comment
    }]
  }else{
    delete mp3tag.tags.v2.COMM;
  }
  mp3tag.tags.v2.TPE4 = $('#remixer').val()
  mp3tag.tags.v2.TPE2 = $('#tpe2').val()
  mp3tag.tags.v2.TPE3 = $('#conductor').val()
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
}else if($('#tver').prop('selectedIndex') === 3){
  mp3tag.tags.v2.TIT2 = $('#title').val()
  mp3tag.tags.v2.TPE1 = $('#artist').val()
  mp3tag.tags.v2.TALB = $('#album').val()
  mp3tag.tags.v2.TDRC = $('#year').val()
  mp3tag.tags.v2.TRCK = $('#track').val()
  mp3tag.tags.v2.TCON = $('#genre').val()
  mp3tag.tags.v2.TCOM = $('#composer').val()
  mp3tag.tags.v2.TPOS = $('#disk').val()
  mp3tag.tags.v2.TPUB = $('#publisher').val()
  mp3tag.tags.v2.TOAL = $('#origalbum').val()
  mp3tag.tags.v2.TOPE = $('#origartist').val()
  mp3tag.tags.v2.TOFN = $('#origfilename').val()
  mp3tag.tags.v2.TOLY = $('#origlyricist').val()
  try{mp3tag.tags.v2.TDOR = $('#origyear').val()}catch(e){console.error(e.toString(), e.stack)}
  mp3tag.tags.v2.WOAS = $('#wwwaudiosource').val()
  if($('#play_count').val()===""){
    delete mp3tag.tags.v2.PCNT
  }else{
    mp3tag.tags.v2.PCNT = $('#play_count').val()
  }
  const lyrics = $('#lyrics').val()
  if (lyrics !== '') {
    mp3tag.tags.v2.USLT = [{
      language: 'eng',
      descriptor: '',
      text: lyrics
    }]
  }
  const comment = $('#comment').val()
  if (comment !== '') {
    mp3tag.tags.v2.COMM = [{
      language: 'eng',
      descriptor: '',
      text: comment
    }]
    console.log(11)
    console.log(mp3tag.tags.v2.COMM)
  }else{
    delete mp3tag.tags.v2.COMM;
    console.log(12)
    console.log(mp3tag.tags.v2.COMM)
  }
  mp3tag.tags.v2.TPE4 = $('#remixer').val()
  mp3tag.tags.v2.TPE2 = $('#tpe2').val()
  mp3tag.tags.v2.TPE3 = $('#conductor').val()
  mp3tag.tags.v2.TDRL = $('#releasetime').val()
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
}else{
  mp3tag.tags.title = $('#title').val()
  mp3tag.tags.artist = $('#artist').val()
  mp3tag.tags.album = $('#album').val()
  mp3tag.tags.year = $('#year').val()
  mp3tag.tags.track = $('#track').val()
  mp3tag.tags.genre = $('#genre').val()
  mp3tag.tags.v2.TCOM = $('#composer').val()
  mp3tag.tags.v2.TPOS = $('#disk').val()
  mp3tag.tags.v2.TPUB = $('#publisher').val()
  mp3tag.tags.v2.TOAL = $('#origalbum').val()
  mp3tag.tags.v2.TOPE = $('#origartist').val()
  mp3tag.tags.v2.TOFN = $('#origfilename').val()
  mp3tag.tags.v2.TOLY = $('#origlyricist').val()
  try{mp3tag.tags.v2.TORY = $('#origyear').val()}catch(e){console.error(e.toString(), e.stack)}
  try{mp3tag.tags.v2.TDOR = $('#origyear').val()}catch(e){console.error(e.toString(), e.stack)}
  mp3tag.tags.v2.WOAS = $('#wwwaudiosource').val()
  if($('#play_count').val()===""){
    delete mp3tag.tags.v2.PCNT
  }else{
    mp3tag.tags.v2.PCNT = $('#play_count').val()
  }
  const lyrics = $('#lyrics').val()
  if (lyrics !== '') {
    mp3tag.tags.v2.USLT = [{
      language: 'eng',
      descriptor: '',
      text: lyrics
    }]
  }
  const comment = $('#comment').val()
  if (comment !== '') {
    mp3tag.tags.v2.COMM = [{
      language: 'eng',
      descriptor: '',
      text: comment
    }]
  }else{
    delete mp3tag.tags.v2.COMM;
  }
  mp3tag.tags.v2.TPE4 = $('#remixer').val()
  mp3tag.tags.v2.TPE2 = $('#tpe2').val()
  mp3tag.tags.v2.TPE3 = $('#conductor').val()
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
}
  console.log(mp3tag.tags.v1.comment)
  if(typeof mp3tag.tags.v1.comment !== "string"){
    mp3tag.tags.v1.comment=mp3tag.tags.comment??"";
  };
}

function resetForm () {
  currentIndex = -1
  mp3tag = null
  imageBytes = null

  $('#edit-form').trigger('reset')
  $('#edit-form').find('input, textarea, select, button').not('.no-change-disabled').attr('disabled', true)/*
  $('#edit-form').find('.mcdropdown').find('#dropdowncontents').find('*').attr('inert', true)*/
  $('#edit-form').find('.mcdropdown').find('#dropdowncontents').find('*').addClass('.disabled-toggle-checkbox')
  $('#a-button').attr('disabled', true)
  $('#edit-form .form-group').removeClass('position-relative errored')
  $('#download').attr({ href: null, download: null })
  $('#download').addClass('disabled')
  $('#cover-preview').attr('src', blankImage)
  $('#cover-preview').attr('style', "image-rendering: pixelated;")
  $('#cover-art-debug').text("No Debug Info")
  $('#audio-list').find('.flash').removeClass('flash')
  try{
    $('#v1Debug').text("v1 Details: N/A")
    $('#v2Debug').text("v2 Details: N/A")
  }catch(e){console.error(e.toString(), e.stack)}
}
