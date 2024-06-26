const modal = document.getElementById('modal')
const closeModalBtn = document.getElementById('close-modal-btn')
const jsonViewArea = document.getElementById('json-view-area')
const copyArea = document.getElementById('copy-area')
const downloadArea = document.getElementById('download-area')
const copyText = document.getElementById('copy-text')
let filename = ''

const openModal = (fileId, name) => {
    jsonViewArea.innerHTML = ''
    modal.style.display = 'flex'
    filename = name
    const idx = results.findIndex(obj => obj.id === parseInt(fileId))
    
    if(results[idx].data === null){
        copyArea.style.visibility = 'hidden'
        downloadArea.style.visibility = 'hidden'
        return
    }

    if(copyArea.style.visibility !== 'visible'){
        copyArea.style.visibility = 'visible'
    }
    
    if(downloadArea.style.visibility !== 'visible'){
        downloadArea.style.visibility = 'visible'
    }
    
    let dataLen = results[idx].data.length
    let keys = '', key = '', val = '', data = null
    let jsonContent = `<div class='square-bracket'>[</div>`

    // construct json view
    for(let i=0; i<dataLen; i++){
        jsonContent += `<div class='bracket'>{</div>`
        data = results[idx].data
        keys = Object.keys(data[i])

        for(let j=0; j<keys.length; j++){
            key = keys[j]
            val = data[i][key]
            jsonContent += j < keys.length - 1 ? `<div class='json-field'>"${key}": "${val}",</div>`
                                                : `<div class='json-field'>"${key}": "${val}"</div>`
        }

        jsonContent += i < dataLen - 1 ? `<div class='bracket'>},</div>` : `<div class='bracket'>}</div>`
    }

    jsonContent += `<div class='square-bracket'>]</div>`
    jsonViewArea.innerHTML += jsonContent
}

const copyJson = () => {
    navigator.clipboard.writeText(jsonViewArea.textContent)
    copyText.textContent = 'Copied'
    setTimeout(() => {
        copyText.textContent = 'Copy JSON'
    }, 2000)
}

const saveFile = () => {
    const blob = new Blob([jsonViewArea.textContent], {type: 'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename.substring(0, filename.length - 4)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none'
})

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none'
    }
})