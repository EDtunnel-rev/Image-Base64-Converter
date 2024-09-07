addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

// 主处理请求函数
async function handleRequest(request) {
  if (request.method === 'GET') {
    // 如果是GET请求，返回HTML页面
    return new Response(renderHTMLPage(), {
      headers: { 'Content-Type': 'text/html' },
    });
  } else if (request.method === 'POST' && request.url.endsWith('/upload')) {
    // 如果是POST请求，处理图片上传
    return await handleImageUpload(request);
  } else {
    // 其他请求返回错误
    return new Response('无效请求', { status: 400 });
  }
}

// 返回嵌入HTML的函数
function renderHTMLPage() {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image & Base64 Converter</title>
    <style>
        /* Base styles */
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
            transition: background 0.3s ease, color 0.3s ease;
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

        input, select, button, textarea {
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
            transition: all 0.3s ease;
            font-size: 1em;
        }

        input:focus, select:focus, textarea:focus {
            border-color: #007bff;
            box-shadow: 0 0 10px rgba(0, 123, 255, 0.3);
        }

        button {
            cursor: pointer;
            background: #007bff;
            border: none;
            color: #fff;
            text-transform: uppercase;
            font-weight: bold;
            transition: background 0.3s ease, transform 0.2s;
        }

        button:hover {
            background: #0056b3;
            transform: scale(1.05);
        }

        button:active {
            transform: scale(1);
        }

        #base64Output {
            background-color: rgba(0, 0, 0, 0.05);
            padding: 10px;
            border-radius: 5px;
            text-align: left;
            word-break: break-all;
            margin: 10px 0;
            max-height: 200px;
            overflow-y: auto;
            border: 1px solid #ddd;
        }

        .toggle-container {
            display: flex;
            gap: 10px;
            align-items: center;
            margin-bottom: 20px;
        }

        .theme-toggle, .language-toggle {
            cursor: pointer;
            padding: 5px 10px;
            border: none;
            border-radius: 5px;
            font-size: 1em;
            transition: background 0.3s ease;
        }

        .theme-toggle:hover, .language-toggle:hover {
            background-color: #f0f0f0;
        }

        /* Dark Mode Styles */
        body.dark-mode {
            background: #2b2b2b;
            color: #ddd;
        }

        body.dark-mode input, body.dark-mode select, body.dark-mode textarea {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid #444;
        }

        body.dark-mode button {
            background: #009999;
        }

        body.dark-mode button:hover {
            background: #007777;
        }

        body.dark-mode #base64Output {
            background-color: rgba(0, 0, 0, 0.5);
            border: 1px solid #444;
        }
    </style>
</head>
<body>
    <h1 data-lang="title">Image to Base64 & Base64 to Image Converter</h1>
    
    <div class="toggle-container">
        <button class="theme-toggle" onclick="toggleTheme()" data-lang="theme-toggle">Toggle Dark/Light Mode</button>
        <button class="language-toggle" onclick="toggleLanguage()" data-lang="language-toggle">Switch Language / 切换语言</button>
    </div>

    <!-- Image Upload Section -->
    <h2 data-lang="upload-title">Upload Image and Generate Base64</h2>
    <input type="file" id="imageInput" accept="image/*">
    <select id="imageFormat">
        <option value="png">PNG</option>
        <option value="jpeg">JPEG</option>
        <option value="gif">GIF</option>
    </select>
    <button onclick="uploadImage()" data-lang="upload-button">Upload and Convert to Base64</button>
    <p id="base64Output"></p>

    <!-- Base64 to Image Section -->
    <h2 data-lang="convert-title">Convert Base64 to Image</h2>
    <textarea id="base64Input" rows="10" cols="50" placeholder="Paste Base64 encoded data here"></textarea><br>
    <select id="outputFormat">
        <option value="png">PNG</option>
        <option value="jpeg">JPEG</option>
        <option value="gif">GIF</option>
    </select>
    <button onclick="convertToImage()" data-lang="convert-button">Convert and Download Image</button>

    <script>
        // Handle theme toggle
        function toggleTheme() {
            document.body.classList.toggle('dark-mode');
        }

        // Handle language toggle
        function toggleLanguage() {
            const elements = document.querySelectorAll('[data-lang]');
            elements.forEach(el => {
                const key = el.getAttribute('data-lang');
                if (currentLanguage === 'en') {
                    el.textContent = translations['zh'][key] || el.textContent;
                } else {
                    el.textContent = translations['en'][key] || el.textContent;
                }
            });
            currentLanguage = currentLanguage === 'en' ? 'zh' : 'en';
        }

        // Translation data
        const translations = {
            en: {
                'title': 'Image to Base64 & Base64 to Image Converter',
                'upload-title': 'Upload Image and Generate Base64',
                'upload-button': 'Upload and Convert to Base64',
                'convert-title': 'Convert Base64 to Image',
                'convert-button': 'Convert and Download Image',
                'theme-toggle': 'Toggle Dark/Light Mode',
                'language-toggle': 'Switch Language / 切换语言'
            },
            zh: {
                'title': '图片与Base64编码转换器',
                'upload-title': '上传图片并生成Base64',
                'upload-button': '上传并转换为Base64',
                'convert-title': 'Base64转换为图片',
                'convert-button': '转换并下载图片',
                'theme-toggle': '切换明亮/暗黑模式',
                'language-toggle': 'Switch Language / 切换语言'
            }
        };

        let currentLanguage = 'en'; // Default language is English

        // Handle image upload and convert to Base64
        async function uploadImage() {
            const fileInput = document.getElementById("imageInput").files[0];
            const format = document.getElementById("imageFormat").value;

            if (!fileInput) {
                alert(currentLanguage === 'en' ? "Please select an image to upload." : "请选择图片进行上传。");
                return;
            }

            const reader = new FileReader();
            reader.onload = function (event) {
                const base64String = event.target.result.split(',')[1];
                document.getElementById("base64Output").innerText = base64String || (currentLanguage === 'en' ? "Failed to convert image, please try again." : "图片转换失败，请重试。");
            };
            reader.onerror = function () {
                alert(currentLanguage === 'en' ? "Failed to read the file, please try again." : "读取文件失败，请重试。");
            };

            reader.readAsDataURL(fileInput);
        }

        // Convert Base64 string to image and download
        function convertToImage() {
            const base64Data = document.getElementById("base64Input").value.trim();
            const outputFormat = document.getElementById("outputFormat").value;

            if (!base64Data) {
                alert(currentLanguage === 'en' ? "Please enter Base64 encoded data." : "请输入Base64编码数据。");
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
                console.error("Failed to convert Base64 to image:", error);
                alert(currentLanguage === 'en' ? "Invalid Base64 data. Please check and try again." : "Base64数据无效，请检查后重试。");
            }
        }
    </script>
</body>
</html>



  `;
}

// 处理图片上传的逻辑
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

    const supportedFormats = ['png', 'jpeg', 'gif'];

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
