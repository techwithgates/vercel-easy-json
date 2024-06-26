const fileInput = document.querySelector('input[type="file"]')
const filePreview = document.getElementById('file-preview')
const btn = document.getElementById('btn')
const files = [], results = []
let fileId = 1
let fName = ''

fileInput.addEventListener('change', (e) => {
    const uploadedFiles = e.target.files;

    for(let i=0; i<Array.from(uploadedFiles).length; i++){
        fName = uploadedFiles[i].name
        files.push({id: fileId, file: uploadedFiles[i]})
        filePreview.innerHTML += `
            <div class='file-area' id='file-area${fileId}'>
                <div class='icon'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                        onclick='removeFile(${fileId})'>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </div>
                <div class='file-name'>
                    <p>${fName}</p>
                </div>
                <div class='open-modal-area'>
                    <span onclick='openModal(${fileId}, "${fName}")' class='open-modal-btn' id='json-view${fileId}'span>
                        View Data</span>
                </div>
            </div>
        `
        fileId += 1
    }

    if(files.length > 0 && btn.style.visibility !== 'visible'){
        btn.style.visibility = 'visible'
    }
    
    fileInput.value = ''
});

const removeFile = (id) => {
    let idx = files.findIndex(obj => obj.id === parseInt(id))
    idx !== -1 && files.splice(idx, 1)
    idx = results.findIndex(obj => obj.id === parseInt(id))
    idx !== -1 && results.splice(idx, 1)
    document.getElementById(`file-area${id}`).remove()

    if(files.length < 1 && btn.style.visibility !== 'hidden'){
        btn.style.visibility = 'hidden'
    }

    if(files.length < 1 && results.length < 1){
        fileId = 1
    }
}

const submitFile = async (e) => {
    e.preventDefault()
    const formData = new FormData()

    files.forEach(obj => {
        formData.append('fileIds[]', obj.id)
        formData.append('files[]', obj.file)
    })

    files.length = 0
    btn.style.visibility = 'hidden'

    const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
    })

    if(res.ok){
        const {duration, data} = await res.json()
        console.log(`Taken time to process files in seconds: ${duration}`)
        data.forEach(data => {
            results.push(data)
            const jsonView = document.getElementById(`json-view${data.id}`)
            if(jsonView !== null){
                jsonView.style.display = 'flex'
            }
        })
    }else{
        alert(res.statusText)
    }
}