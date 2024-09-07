// Cloudflare Workers 的入口函数，监听 fetch 事件
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

// 主处理请求函数
async function handleRequest(request) {
  if (request.method === 'GET') {
    // 如果是 GET 请求，返回 HTML 页面
    return new Response(renderHTMLPage(), {
      headers: { 'Content-Type': 'text/html' },
    });
  } else if (request.method === 'POST' && request.url.endsWith('/upload')) {
    // 处理图片上传的 POST 请求
    return await handleImageUpload(request);
  } else {
    // 对于无效请求返回 400 错误
    return new Response('Invalid Request', { status: 400 });
  }
}

// HTML 页面，用于上传图片、显示 Base64 结果以及一键复制功能
function renderHTMLPage() {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image to Base64 Converter</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        margin: 0;
        padding: 20px;
        box-sizing: border-box;
        background-color: #f4f4f4;
      }
      h1 {
        font-size: 1.8em;
        margin-bottom: 20px;
        text-align: center;
      }
      h2 {
        font-size: 1.2em;
        margin: 20px 0;
        text-align: center;
      }
      input, button, textarea {
        background: rgba(255, 255, 255, 0.1);
        color: inherit;
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 10px;
        margin: 10px 0;
        width: 80%;
        max-width: 400px;
        box-sizing: border-box;
        outline: none;
        font-size: 1em;
      }
      button {
        cursor: pointer;
        background: #007bff;
        border: none;
        color: #fff;
        text-transform: uppercase;
        font-weight: bold;
      }
      #base64Output {
        background-color: rgba(0, 0, 0, 0.05);
        padding: 10px;
        border-radius: 5px;
        word-break: break-all;
        margin: 10px 0;
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid #ddd;
      }
      #fileSizeInfo {
        color: green;
      }
      .hidden {
        display: none;
      }
      .copy-button {
        background-color: #28a745;
        color: #fff;
        border: none;
        padding: 10px;
        border-radius: 8px;
        cursor: pointer;
      }
      .copy-button:hover {
        background-color: #218838;
      }
    </style>
  </head>
  <body>
    <h1>Image to Base64 & Base64 to Image Converter</h1>

    <h2>Upload Image and Generate Base64</h2>
    <input type="file" id="imageInput" accept="image/*">
    <button onclick="uploadImage()">Upload and Convert to Base64</button>
    <p id="fileSizeInfo" class="hidden"></p>
    <p id="base64Output"></p>
    <button id="copyButton" class="copy-button hidden" onclick="copyBase64()">Copy Base64 to Clipboard</button>

    <h2>Convert Base64 to Image</h2>
    <textarea id="base64Input" rows="10" cols="50" placeholder="Paste Base64 encoded data here"></textarea><br>
    <button onclick="convertToImage()">Convert and Download Image</button>

    <script>
      // 上传图片并将其转换为Base64
      async function uploadImage() {
        const fileInput = document.getElementById("imageInput").files[0];
        const fileSizeInfo = document.getElementById("fileSizeInfo");
        const copyButton = document.getElementById("copyButton");
        const base64Output = document.getElementById("base64Output");

        fileSizeInfo.classList.remove('hidden'); // 显示文件大小信息
        copyButton.classList.add('hidden'); // 隐藏复制按钮
        base64Output.innerText = ''; // 清空之前的Base64结果

        if (!fileInput) {
          alert("Please select an image to upload.");
          return;
        }

        // 显示文件大小
        fileSizeInfo.innerText = `File size: ${(fileInput.size / 1024 / 1024).toFixed(2)} MB`;

        const reader = new FileReader();
        reader.onload = function (event) {
          const base64String = event.target.result.split(',')[1];
          base64Output.innerText = base64String || "Failed to convert image.";
          copyButton.classList.remove('hidden'); // 显示复制按钮
        };
        reader.onerror = function () {
          alert("Failed to read the file, please try again.");
        };

        reader.readAsDataURL(fileInput); // 读取文件并转换为Base64
      }

      // 一键复制Base64到剪贴板
      function copyBase64() {
        const base64Output = document.getElementById("base64Output").innerText;
        const textArea = document.createElement('textarea');
        textArea.value = base64Output;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert("Base64 copied to clipboard!");
      }

      // Base64转换为图片并下载
      function convertToImage() {
        const base64Data = document.getElementById("base64Input").value.trim();
        if (!base64Data) {
          alert("Please enter Base64 encoded data.");
          return;
        }

        try {
          const detectedMimeType = detectMimeType(base64Data);
          if (!detectedMimeType) {
            alert("Unsupported image type.");
            return;
          }

          // 生成下载链接
          const link = document.createElement("a");
          link.href = "data:image/" + detectedMimeType + ";base64," + base64Data;
          link.download = "image." + detectedMimeType;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          alert("Invalid Base64 data. Please check and try again.");
        }
      }

      // 根据Base64数据检测MIME类型
      function detectMimeType(base64) {
        const mimeSignatures = {
          jpeg: "/9j/",
          png: "iVBORw0KGgo",
          gif: "R0lGODlh",
          bmp: "Qk0",
          webp: "UklGRhIAA",
          svg: "PHN2ZyB",
          tiff: "SUkqAA",
        };

        for (const [type, signature] of Object.entries(mimeSignatures)) {
          if (base64.startsWith(signature)) {
            return type;
          }
        }
        return null;
      }
    </script>
  </body>
  </html>
  `;
}

// 处理图片上传的逻辑
async function handleImageUpload(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    // 确保请求是 multipart/form-data 类型
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const imageFile = formData.get('image');

      if (!imageFile) {
        return new Response(JSON.stringify({ error: '未上传图片' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      // 读取图片的 ArrayBuffer
      const arrayBuffer = await imageFile.arrayBuffer();
      const base64String = arrayBufferToBase64(arrayBuffer);

      return new Response(JSON.stringify({ base64: base64String }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response('不支持的内容类型', { status: 415 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: '处理图片时发生错误' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

// 将ArrayBuffer转换为Base64字符串
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// 将Base64字符串转换为ArrayBuffer
function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// 检查文件格式是否受支持
function isSupportedFileType(mimeType) {
  const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/svg+xml', 'image/tiff'];
  return supportedTypes.includes(mimeType);
}

// 自动检测和转换格式
function autoDetectAndConvert(base64) {
  const mimeType = detectMimeType(base64);
  if (!mimeType) {
    alert('无法识别的图片格式');
    return;
  }
  convertToImage(base64, mimeType);
}

// 下载图片
function downloadImage(base64Data, filename, mimeType) {
  const link = document.createElement('a');
  link.href = `data:${mimeType};base64,${base64Data}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 处理错误消息的显示
function showErrorMessage(message) {
  const errorDiv = document.getElementById("error");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
}

// 基于文件扩展名自动检测文件类型
function detectFileExtension(filename) {
  const extension = filename.split('.').pop().toLowerCase();
  const mimeTypeMap = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "bmp": "image/bmp",
    "webp": "image/webp",
    "svg": "image/svg+xml",
    "tiff": "image/tiff"
  };
  return mimeTypeMap[extension] || null;
}
