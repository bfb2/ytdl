let displayDlOptions = false
const videoUrl = 'https://www.youtube.com/watch?'
const playlistUrl = 'https://www.youtube.com/playlist?list='


function addDownloadButton() {
    if (document.querySelector(".yt-download-btn"))
        return
    const url = window.location.href
    if(!(url.includes('/watch?')||url.includes('/playlist?')))
        return
    
    const containerEl = getContainerElement()
    console.log(containerEl, 'container mane')
    if (containerEl) {
      const btn = document.createElement("button");
      btn.innerText = "Download";
      btn.className = "yt-download-btn";
      btn.disabled = true
      
      let form = document.querySelector('yt-download-options')
      if(form){
          form.classList.remove('hide')
          return
      }
      
      form = document.createElement("form")
      form.className='yt-download-options'
      form.addEventListener("submit", (e)=>{
        e.preventDefault()
        const selectedOption = form.querySelector('input[name="download option"]:checked')
        if(selectedOption.value.includes("Audio")){
            const playlistName = document.querySelector("yt-core-attributed-string yt-core-attributed-string--white-space-pre-wrap")
            chrome.runtime.sendMessage({action:'download playlist', option:selectedOption.value, url:window.location.href, playlistName})
        }
        else{
            const title = document.querySelector("title").innerText.split(" -")[0]
            const extension = selectedOption.id.substring(0,3).toLowerCase()
            chrome.runtime.sendMessage({action:'download', format_id:selectedOption.value, ext:extension, url:window.location.href, title}) 
        }
        document.body.removeChild(form)    
    })

      containerEl.appendChild(btn);
      if(!isPlaylist())
          chrome.runtime.sendMessage({action:'fetchDlOptions', url:window.location.href}, res=>{
              btn.disabled=false
              btn.onclick = () => addDownloadOptions(res.formats, form)
          })
       else{
        btn.disabled = false
        btn.onclick = () => addPlaylistDlOptions(form)
       }
    }
}

const addDownloadOptions = (options, form) =>{
    if(form.children.length > 0)
        return document.body.appendChild(form)

    options.forEach((option, index) => {
        const container = generateInputContainer()
        const input = document.createElement("input")
        input.type = 'radio'
        if(index ==0)
            input.checked = true
        input.value = option.format_id
        const inputValue = option.type == 'audio'? `MP3 - ${option.abr}kbps` : `MP4 - ${option.note}`
        input.id = inputValue
        input.name = 'download option'
        input.className = 'download-input'

        const label = document.createElement("label")
        label.htmlFor = inputValue
        label.innerText = inputValue
        container.appendChild(input) 
        container.appendChild(label)
        form.appendChild(container) 
    })

    generateFormBtns(form)    
    document.body.appendChild(form)
}

const addPlaylistDlOptions = (form) =>{
    if(form.children.length > 0)
        return document.body.appendChild(form)

    const options = ['Highest', 'Lowest']
    const types = ['Audio', 'Video']
    types.forEach(type =>{
        const typeLabel = document.createElement('div')
        typeLabel.innerText = type
        form.appendChild(typeLabel)
        const container = generateInputContainer()

        options.forEach(option=>{       
            const choice = document.createElement('input')
            choice.type = 'radio'
            if(type == 'Audio' && option == 'Highest')
                choice.checked=true

            const inputSelection = `${type}-${option}`
            choice.id = inputSelection
            choice.className='download-input'
            choice.name = 'download option'
            choice.value = inputSelection

            const label = document.createElement('label')
            label.htmlFor = inputSelection
            label.innerText = option

            container.appendChild(choice)
            container.appendChild(label)
            form.appendChild(container)
        })
    })

    generateFormBtns(form)
    document.body.appendChild(form)

}

const generateFormBtns = (form) => {
    const btnContainer = document.createElement("div")
    btnContainer.className='form-btn-container'

    const cancelBtn = document.createElement("button")
    cancelBtn.innerText = 'Cancel'
    cancelBtn.onclick =  (e) => {
        e.preventDefault()
        document.body.removeChild(form)
    }
    cancelBtn.className = 'form-btns cancel-btn'
    btnContainer.appendChild(cancelBtn)

    const submitBtn = document.createElement("button")
    submitBtn.innerText = 'Download'
    submitBtn.type ='submit'
    submitBtn.className='form-btns submit-btn'
    btnContainer.appendChild(submitBtn)

    form.appendChild(btnContainer)
    
}

const generateInputContainer = () => {
    const container = document.createElement('div')
    container.className='mb-10 form-input-container'
    return container
}

const isPlaylist = () => window.location.href.includes('/playlist?')


const getContainerElement = () =>{
    if(isPlaylist())
        return document.querySelector('.ytFlexibleActionsViewModelActionRow') 
    else
        return document.querySelector("#above-the-fold #title")
    
}

addEventListener("yt-navigate-finish", ()=>{
    const downloadBtn = document.querySelector(".yt-download-btn")
    const form =document.querySelector('yt-download-options')
    console.log('dnldbtn', downloadBtn)
    if(downloadBtn !== null){
        const container = getContainerElement()
        container.removeChild(downloadBtn)
    }
    if(form !== null)
        document.body.removeChild(form)
})

const observer = new MutationObserver(addDownloadButton);
observer.observe(document.body, { childList: true, subtree: true });



