addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'GET') {
    return new Response(renderHTMLPage(), {
      headers: { 'Content-Type': 'text/html' },
    });
  } else if (request.method === 'POST' && request.url.endsWith('/upload')) {
    return await handleImageUpload(request);
  } else {
    return new Response('无效请求', { status: 400 });
  }
}

function renderHTMLPage() {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Image & Base64 Converter</title>
      <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap');
  
          body {
              font-family: 'Roboto', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              background: linear-gradient(135deg, #1f3b4d 0%, #283e56 50%, #1f3b4d 100%);
              color: #f3f4f6;
              box-sizing: border-box;
              overflow-x: hidden;
          }
  
          h1, h2 {
              text-align: center;
              color: #00d9ff;
          }
  
          input, select, button, textarea {
              padding: 12px;
              margin: 10px 0;
              width: 90%;
              max-width: 400px;
              border-radius: 8px;
              border: 1px solid #3a4b5c;
              background-color: #2a3d50;
              color: #f3f4f6;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
              transition: all 0.3s ease;
          }
  
          button {
              background-color: #00d9ff;
              border: none;
              color: #1f3b4d;
              font-weight: 500;
              cursor: pointer;
              transition: background-color 0.3s ease;
          }
  
          button:hover {
              background-color: #0084a6;
              transform: scale(1.05);
          }
  
          #base64Output, #imagePreview {
              margin: 20px 0;
              text-align: center;
          }
  
          #base64Output textarea {
              width: 100%;
              height: 150px;
              resize: none;
              border: 1px solid #3a4b5c;
              background-color: #192531;
              color: #f3f4f6;
              border-radius: 8px;
              overflow-y: auto;
          }
  
          img {
              max-width: 400px;
              margin-top: 20px;
              border: 2px solid #00d9ff;
              border-radius: 10px;
          }
  
          .lang-switch {
              margin-bottom: 20px;
          }
  
          .copy-confirmation {
              color: #00ff73;
              font-size: 0.9em;
              display: none;
          }
  
          .lang-switch select {
              background-color: #192531;
              color: #00d9ff;
          }
  
          select {
              appearance: none;
              padding: 12px;
              background-color: #192531;
              border: 1px solid #00d9ff;
              border-radius: 8px;
              color: #00d9ff;
          }
  
          textarea::placeholder {
              color: #8893a2;
          }
  
          button:active {
              transform: scale(0.98);
          }
  
          @keyframes backgroundShift {
              0% {
                  background-position: 0 0;
              }
              100% {
                  background-position: 100% 100%;
              }
          }
  
          body::before {
              content: '';
              position: absolute;
              top: -10%;
              left: -10%;
              width: 120%;
              height: 120%;
              background: radial-gradient(circle at center, transparent, rgba(255, 255, 255, 0.1));
              z-index: -1;
              animation: backgroundShift 15s infinite linear;
          }
      </style>
  </head>
  <body>
      <div class="lang-switch">
          <label for="languageSelector">Language:</label>
          <select id="languageSelector" onchange="toggleLanguage()">
              <option value="en">English</option>
              <option value="zh">中文</option>
          </select>
      </div>
  
      <h1 data-lang="title">Image to Base64 & Base64 to Image Converter</h1>
  
      <h2 data-lang="uploadImageHeader">Upload Image and Generate Base64</h2>
      <input type="file" id="imageInput" accept="image/*,.svg">
      <select id="imageFormat">
          <option value="png">PNG</option>
          <option value="jpeg">JPEG</option>
          <option value="gif">GIF</option>
          <option value="svg">SVG</option>
      </select>
      <button onclick="uploadImage()" data-lang="uploadButton">Upload and Convert to Base64</button>
  
      <div id="base64Output">
          <textarea id="base64Textarea" readonly placeholder="Base64 encoded data will appear here"></textarea>
      </div>
      <div id="imagePreview"></div>
      <button onclick="copyToClipboard()" data-lang="copyButton">Copy Base64</button>
      <span class="copy-confirmation" id="copyConfirmation" data-lang="copyConfirmation">Copied!</span>
  
      <h2 data-lang="base64ToImageHeader">Convert Base64 to Image</h2>
      <textarea id="base64Input" rows="10" cols="50" placeholder="Paste Base64 encoded data here"></textarea><br>
      <select id="outputFormat">
          <option value="png">PNG</option>
          <option value="jpeg">JPEG</option>
          <option value="gif">GIF</option>
          <option value="svg">SVG</option>
      </select>
      <button onclick="convertToImage()" data-lang="convertButton">Convert and Download Image</button>
      <button onclick="pasteFromClipboard()" data-lang="pasteButton">Paste Base64 from Clipboard</button>
  
      <script>
          const translations = {
              en: {
                  title: "Image to Base64 & Base64 to Image Converter",
                  uploadImageHeader: "Upload Image and Generate Base64",
                  uploadButton: "Upload and Convert to Base64",
                  copyButton: "Copy Base64",
                  copyConfirmation: "Copied!",
                  base64ToImageHeader: "Convert Base64 to Image",
                  convertButton: "Convert and Download Image",
                  pasteButton: "Paste Base64 from Clipboard"
              },
              zh: {
                  title: "图片与Base64编码转换器",
                  uploadImageHeader: "上传图片并生成Base64",
                  uploadButton: "上传并转换为Base64",
                  copyButton: "复制Base64",
                  copyConfirmation: "复制成功！",
                  base64ToImageHeader: "Base64转换为图片",
                  convertButton: "转换并下载图片",
                  pasteButton: "从剪贴板粘贴Base64"
              }
          };
  
          function toggleLanguage() {
              const lang = document.getElementById('languageSelector').value;
              document.querySelectorAll('[data-lang]').forEach(el => {
                  el.innerText = translations[lang][el.dataset.lang];
              });
          }
  
          function uploadImage() {
              const fileInput = document.getElementById("imageInput").files[0];
              const format = document.getElementById("imageFormat").value;
  
              if (!fileInput) {
                  alert("Please select an image to upload.");
                  return;
              }
  
              const reader = new FileReader();
              reader.onload = function (event) {
                  const base64String = event.target.result.split(',')[1];
                  const base64DataURL = event.target.result;
  
                  document.getElementById("base64Textarea").value = base64String || "Failed to convert image.";
                  document.getElementById("imagePreview").innerHTML = "<img src='" + base64DataURL + "' alt='Converted Image' />";
              };
              reader.onerror = function () {
                  alert("Failed to read the file.");
              };
  
              if (format === 'svg') {
                  reader.readAsText(fileInput);
              } else {
                  reader.readAsDataURL(fileInput);
              }
          }
  
          function copyToClipboard() {
              const base64Output = document.getElementById("base64Textarea").value;
              const copyConfirmation = document.getElementById("copyConfirmation");
  
              if (base64Output) {
                  navigator.clipboard.writeText(base64Output).then(() => {
                      copyConfirmation.style.display = "inline";
                      setTimeout(() => {
                          copyConfirmation.style.display = "none";
                      }, 2000);
                  });
              } else {
                  alert("No Base64 data to copy.");
              }
          }
  
          function pasteFromClipboard() {
              navigator.clipboard.readText().then(text => {
                  document.getElementById("base64Input").value = text;
              }).catch(err => {
                  alert("Failed to read from clipboard.");
              });
          }
  
          function convertToImage() {
              const base64Data = document.getElementById("base64Input").value.trim();
              const outputFormat = document.getElementById("outputFormat").value;
  
              if (!base64Data) {
                  alert("Please enter Base64 encoded data.");
                  return;
              }
  
              try {
                  const link = document.createElement("a");
                  link.href = "data:image/" + outputFormat + ";base64," + base64Data;
                  link.download = "image." + outputFormat;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
              } catch (error) {
                  alert("Invalid Base64 data.");
              }
          }
      </script>
  </body>
  </html>
  
  `;
}

async function handleImageUpload(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');
    const format = formData.get('format') || 'png';

    if (!image) {
      return new Response(JSON.stringify({ error: '未上传图片' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supportedFormats = ['png', 'jpeg', 'gif', 'svg'];

    if (!supportedFormats.includes(format)) {
      return new Response(JSON.stringify({ error: '不支持的图片格式' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const arrayBuffer = await image.arrayBuffer();
    const base64String = arrayBufferToBase64(arrayBuffer);

    return new Response(JSON.stringify({ base64: base64String }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '处理图片时发生错误' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
