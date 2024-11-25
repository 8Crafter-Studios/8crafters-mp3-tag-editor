const TOAST_SUCCESS = ['Toast--success', '<img width="75%" src="/assets/images/realms_green_check.png" style="image-rendering: pixelated;">'/*'<svg aria-hidden="true" class="octicon octicon-check" viewBox="0 0 16 16" version="1.1" width="16" height="16"><path fill-rule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path></svg>'*/]
const TOAST_INFO = ['', '<img width="50%" src="/assets/images/UpdateGlyph.png" style="image-rendering: pixelated;">'/*'<svg aria-hidden="true" class="octicon octicon-info" viewBox="0 0 16 16" version="1.1" width="16" height="16"><path fill-rule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm6.5-.25A.75.75 0 017.25 7h1a.75.75 0 01.75.75v2.75h.25a.75.75 0 010 1.5h-2a.75.75 0 010-1.5h.25v-2h-.25a.75.75 0 01-.75-.75zM8 6a1 1 0 100-2 1 1 0 000 2z"></path></svg>'*/]
const TOAST_INFOBULB = ['', '<img width="50%" src="/assets/images/infobulb.png" style="image-rendering: pixelated;">'/*'<svg aria-hidden="true" class="octicon octicon-info" viewBox="0 0 16 16" version="1.1" width="16" height="16"><path fill-rule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm6.5-.25A.75.75 0 017.25 7h1a.75.75 0 01.75.75v2.75h.25a.75.75 0 010 1.5h-2a.75.75 0 010-1.5h.25v-2h-.25a.75.75 0 01-.75-.75zM8 6a1 1 0 100-2 1 1 0 000 2z"></path></svg>'*/]
const TOAST_DANGER = ['Toast--error', '<img width="50%" src="/assets/images/ErrorGlyph.png" style="image-rendering: pixelated;">'/*'<svg aria-hidden="true" class="octicon octicon-stop" viewBox="0 0 16 16" version="1.1" width="16" height="16"><path fill-rule="evenodd" d="M4.47.22A.75.75 0 015 0h6a.75.75 0 01.53.22l4.25 4.25c.141.14.22.331.22.53v6a.75.75 0 01-.22.53l-4.25 4.25A.75.75 0 0111 16H5a.75.75 0 01-.53-.22L.22 11.53A.75.75 0 010 11V5a.75.75 0 01.22-.53L4.47.22zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5H5.31zM8 4a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 4zm0 8a1 1 0 100-2 1 1 0 000 2z"></path></svg>'*/]
const TOAST_WARNING = ['Toast--warning', '<img width="50%" src="/assets/images/WarningGlyph.png" style="image-rendering: pixelated;">'/*'<svg aria-hidden="true" class="octicon octicon-alert" viewBox="0 0 16 16" version="1.1" width="16" height="16"><path fill-rule="evenodd" d="M8.22 1.754a.25.25 0 00-.44 0L1.698 13.132a.25.25 0 00.22.368h12.164a.25.25 0 00.22-.368L8.22 1.754zm-1.763-.707c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0114.082 15H1.918a1.75 1.75 0 01-1.543-2.575L6.457 1.047zM9 11a1 1 0 11-2 0 1 1 0 012 0zm-.25-5.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z"></path></svg>'*/]
const TOAST_NONE = TOAST_INFO
let toastCounter = 0
let MessageFormDataCounter = 0

function toast(message, type = TOAST_NONE, duration = 3000) {
  const temp = $('#toast-template').prop('content')
  const toast = $(temp).clone()
  const id = toastCounter++

  $(toast).find('.Toast').attr('id', 'toast-' + id)
  $(toast).find('.Toast').addClass(type[0])
  $(toast).find('.Toast-icon').html(type[1])
  $(toast).find('.Toast-content').text(message)

  $('#toaster').append(toast)
  setTimeout(function () {
    $('#toast-' + id).remove()
  }, duration)
}

/**
 * The minecraft bedrock edition scripting API MessageFormData class, but for HTML.
 */
class MessageFormData {
  titleText = "";
  bodyText = "";
  button1Text = "";
  button2Text = "";
  closeButtonVisible = true;
  action1Func = function Action1FunctionUnassigned() { };
  action2Func = function Action2FunctionUnassigned() { };
  constructor() {
		// return this;
	}
  title(title) {
		this.titleText = title;
		return this;
	}
  body(body) {
		this.bodyText = body;
		return this;
	}
  button1(button1) {
		this.button1Text = button1;
		return this;
	}
  button2(button2) {
		this.button2Text = button2;
		return this;
	}
  action1(action1) {
		this.action1Func = action1;
		return this;
	}
  action2(action2) {
		this.action2Func = action2;
		return this;
	}
	/**
   * 
   * @example
   * ```js
new MessageFormData().body("a").title("b").button1("c").button2("d").action1(()=>console.log(1)).action2(()=>console.log(2)).show()
```
   * @param {number} duration 
   * @returns The created MessageFormData element.
   */
  show(duration = Infinity) {
    const temp = $('#MessageFormData-template').prop('content')
    const toast = $(temp).clone()
    const id = MessageFormDataCounter++

    $(toast).find('.MessageFormData_background').attr('id', 'MessageFormData-' + id)
    $(toast).find('.MessageFormData_title').text(this.titleText)
    $(toast).find('.MessageFormData_bodyText').text(this.bodyText)
    $(toast).find('.MessageFormData_button1').text(this.button1Text)
    $(toast).find('.MessageFormData_button2').text(this.button2Text)
    $(toast).find('.MessageFormData_button1').click(() => this.action1Func($('#MessageFormData-' + id)))
    $(toast).find('.MessageFormData_button2').click(() => this.action2Func($('#MessageFormData-' + id)))
    $(toast).find('.MessageFormData_close').click(function closeMessageFormData() {
      $('#MessageFormData-' + id).remove()
    })
    if (!this.closeButtonVisible) {
      $(toast).find('.MessageFormData_close').remove()
    }
  	$(toast).find('button, input, textarea, select, option, [onclick]').on('touchstart', () => { })

    $('body').append(toast)
    /*setTimeout(function () {
      try {
        $('#MessageFormData-' + id).remove()
      } catch { }
    }, duration)*/
    return $('#MessageFormData-' + id);
  }
}

function imageURL(bytes, format) {
  let encoded = ''
  bytes.forEach(function (byte) {
    encoded += String.fromCharCode(byte)
  })

  return `data:${format};base64,${btoa(encoded)}`
}

function loadFile(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result)
    }

    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

$(document).ready(function () {
  $('button, input, textarea, select, option, [onclick]').on('touchstart', () => { })
})
