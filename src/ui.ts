import 'figma-plugin-ds/dist/figma-plugin-ds.css'
import './ui.css'
import { selectMenu } from 'figma-plugin-ds';
import { base64ToUint8Array } from 'base64-u8array-arraybuffer'

const mammoth = require("mammoth");
let resultValue = null
document.getElementById("document").addEventListener("change", handleFileSelect, false);

document.getElementById("dropzone").onclick = () => {
    document.getElementById("document").click()
}

document.getElementById("dropzone").ondragover = document.getElementById("dropzone").ondragenter = function(evt) {
    evt.preventDefault();
};
  
document.getElementById("dropzone").ondrop = function(evt) {
    const selElement = document.getElementById("document") as HTMLInputElement
    selElement.files = evt.dataTransfer.files;
    selElement.dispatchEvent(new Event("change"))
};
    
function handleFileSelect(event) {
    if (event?.target?.files[0]?.name && event?.target?.files[0]?.lastModified) {
        const date = new Date(event.target.files[0].lastModified)
        const fileName = event.target.files[0].name
        document.getElementById("fileName").innerHTML = `File name: <strong>${fileName}</strong><br>Last modified date: ${date}`
        readFileInputEventAsArrayBuffer(event, function(arrayBuffer) {
            mammoth.convertToHtml({arrayBuffer: arrayBuffer})
                .then(displayResult)
                .done();
        });
    }
}

function displayResult(result) {
    resultValue = result
    document.getElementById("output").innerHTML = result.value;

    let linkList = document.querySelectorAll('a');

    for(let link of linkList) {
        if (link.href.startsWith('http') || link.href.startsWith('https') || link.href.startsWith('www') || link.href.startsWith('mailto')) {
            link.setAttribute('target', '_blank');
        }
    }

    let allImages = document.getElementById("output").getElementsByTagName("img")

    for (let item of allImages) {
        
        item.onclick = async (event) => {
            let target = event.target as HTMLImageElement
            let imageSrc = target.src
            let dimensions = {
                width: target.naturalWidth,
                height: target.naturalHeight
            };
            let image = await b64toBlob(imageSrc)
            parent.postMessage({ pluginMessage: { type: 'placeImage', image, dimensions } }, '*')
           
        }
    }
    var messageHtml = result.messages.map(function(message) {
        return '<li class="' + message.type + '">' + escapeHtml(message.message) + "</li>";
    }).join("");
    
    document.getElementById("messages").innerHTML = "<ul>" + messageHtml + "</ul>";
    let elements = document.querySelectorAll('.span4')

    elements.forEach((item: any) => {
        item.style.display = 'block'
    })
}

function readFileInputEventAsArrayBuffer(event, callback) {
    var file = event.target.files[0];

    var reader = new FileReader();
    
    reader.onload = function(loadEvent) {
        var arrayBuffer = loadEvent.target.result;
        callback(arrayBuffer);
    };
    
    reader.readAsArrayBuffer(file);
}

function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

document.getElementById('window_size').onchange = () => {
    let w = window.outerWidth;
    let h = window.outerHeight;  
    const textbox1 = document.getElementById('window_size') as HTMLSelectElement;
    const rate = textbox1.value;
    parent.postMessage({ pluginMessage: { type: 'change-window-size', rate, w, h } }, '*')
}

window.onmessage = (event) => {
    const message = event.data.pluginMessage

    // Set config
    if (message && message.type === 'loadDocx' && message.resultValue) {
        let resultValue = JSON.parse(message.resultValue)
        document.getElementById("output").innerHTML = resultValue.value;

        let linkList = document.querySelectorAll('a');

        for(let link of linkList) {
            if (link.href.startsWith('http') || link.href.startsWith('https') || link.href.startsWith('www') || link.href.startsWith('mailto')) {
                link.setAttribute('target', '_blank');
            }
        }

        let allImages =  document.getElementById("output").getElementsByTagName("img")

        for (let item of allImages) {
            
            item.onclick = async (event) => {
                let target = event.target as HTMLImageElement
                let imageSrc = target.src
                let dimensions = {
                    width: target.naturalWidth,
                    height: target.naturalHeight
                };
                let image = await b64toBlob(imageSrc)
                parent.postMessage({ pluginMessage: { type: 'placeImage', image, dimensions } }, '*')
            }
        }
        var messageHtml = resultValue.messages.map(function(message) {
            return '<li class="' + message.type + '">' + escapeHtml(message.message) + "</li>";
        }).join("");
        
        document.getElementById("messages").innerHTML = "<ul>" + messageHtml + "</ul>";
        let elements = document.querySelectorAll('.span4')

        elements.forEach((item: any) => {
            item.style.display = 'block'
        })
    }
}

document.getElementById('save-docx-file').onclick = () => {
    if (resultValue) {
        parent.postMessage({ pluginMessage: { type: 'saveDocx', resultValue } }, '*');
    }
}

document.getElementById('clear-cache').onclick = () => {
    parent.postMessage({ pluginMessage: { type: 'clearCache' } }, '*');
}


async function b64toBlob(b64Data) {
    const data = b64Data.substr(b64Data.indexOf(',') + 1)
    //let kbytes = calculateImageSize(data)
    //console.log(kbytes);
    return base64ToUint8Array(data)
}

/*
function calculateImageSize(base64String) {
  let padding;
  let inBytes;
  let kbytes = 0
  let base64StringLength;
  if (base64String.endsWith('==')) { padding = 2; }
  else if (base64String.endsWith('=')) { padding = 1; }
  else { padding = 0; }

  base64StringLength = base64String.length;
  console.log(base64StringLength);
  inBytes = (base64StringLength / 4) * 3 - padding;
  console.log(inBytes);
  kbytes = inBytes / 1000;
  return kbytes;
}*/

selectMenu.init()