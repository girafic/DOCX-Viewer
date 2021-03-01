const supportedTypesForInsertFill = ['VECTOR', 'STAR', 'ELLIPSE', 'POLYGON', 'RECTANGLE', 'TEXT']
const supportedTypesForInsertInside = ['FRAME', 'GROUP', 'COMPONENT']
type ValidType = FrameNode | GroupNode | ComponentNode | VectorNode | StarNode | EllipseNode | PolygonNode | RectangleNode | TextNode

const isValidSelectionForInsertFill = () => {
  const selection = figma.currentPage.selection
  if (selection.length > 0) {
    return supportedTypesForInsertFill.includes(selection[0].type)
  } else {
    return false
  }
}

const isValidSelectionForInsertInside = () => {
  const selection = figma.currentPage.selection
  if (selection.length > 0) {
    return supportedTypesForInsertInside.includes(selection[0].type)
  } else {
    return false
  }
}

const main = () => {
  figma.clientStorage.getAsync('docxViewerLastedOpenFile').then(resultValue => {
    figma.showUI(__html__,  {width: 800, height: 500});
    figma.ui.postMessage({ type: 'loadDocx', resultValue})
  })
}

main()

figma.ui.onmessage = async msg => {
  if (msg.type === 'change-window-size') {
    switch(msg.rate) {
      case "800x500": figma.ui.resize(800, 500); break;
      case "500x800": figma.ui.resize(500, 800); break;
      case "800x800": figma.ui.resize(800, 800); break;
      case "500x500": figma.ui.resize(500, 500); break;
      case "360x500": figma.ui.resize(360, 500); break;
      case "360x800": figma.ui.resize(360, 800); break;
      case "500x360": figma.ui.resize(500, 360); break;
      case "360x360": figma.ui.resize(360, 360); break;
      case "800xMaxWindow": figma.ui.resize(800, msg.h); break;
    }
  } else if (msg.type === 'placeImage') {
    try {
      //let uint8array = await b64toBlob(msg.image)
      let uint8array = await msg.image
      let image = figma.createImage(uint8array);
      let imageHash = image.hash;
      
      let fill: ImagePaint = {
        type: 'IMAGE',
        imageHash: imageHash,
        scaleMode: 'FILL',
      };

      let currentArtboard = figma.currentPage as any
      let currentSelection = figma.currentPage.selection[0] as any
      let rect = figma.createRectangle();
      let width = msg.dimensions.width;
      let height = msg.dimensions.height;

      rect.name = "image " + width + "x" + height;

      rect.resize(width, height);
      rect.x = figma.viewport.center.x - Math.round(width / 2);
      rect.y = figma.viewport.center.y - Math.round(height / 2);
     
      rect.fills = [fill];

      if (isValidSelectionForInsertInside()) {
        currentArtboard = currentSelection
        rect.x = currentArtboard.width / 2 - Math.round(width / 2) + ((currentSelection?.type !== 'FRAME') ? currentSelection.x : 0);
        rect.y = currentArtboard.height / 2 - Math.round(height / 2) + ((currentSelection?.type !== 'FRAME') ? currentSelection.y : 0);
      }

      if (isValidSelectionForInsertFill()) {
        currentSelection.fills = [fill]
        if (rect && !rect.removed) {
          rect.remove()
        }
        figma.currentPage.selection = [currentSelection];
        figma.viewport.scrollAndZoomIntoView([currentSelection]);
      } else {
        currentArtboard.appendChild(rect);
        figma.currentPage.selection = [rect];
        figma.viewport.scrollAndZoomIntoView([rect]);
      }
      
    } catch (error) {
      figma.notify(error.message)
    }
  } else if (msg.type === 'saveDocx') {
    try {
      await figma.clientStorage.setAsync('docxViewerLastedOpenFile', JSON.stringify(msg.resultValue));
      figma.notify('💾 File saved in cache');
    } catch (e) {
      await figma.clientStorage.setAsync('docxViewerLastedOpenFile', "");
      figma.notify('⚠️ File too big for saving in cache.');
    }
  } else if (msg.type === 'clearCache') {
    try {
      await figma.clientStorage.setAsync('docxViewerLastedOpenFile', "");
      figma.notify('Cache cleared!');
    } catch (e) {
      
    }
  }
};

/*async function getImageBlob(uri) {
  const data = uri.substr(uri.indexOf(',') + 1)
  const bytes =  Buffer.from(data, 'base64').toString('binary')
  const buf = new ArrayBuffer(bytes.length)
 
  let byteArray = new Uint8Array(buf)

  for (let i = 0; i < bytes.length; i++) {
    byteArray[i] = bytes.charCodeAt(i)
  }
  return byteArray
}*/