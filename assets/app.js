(function () {
    const qs = (sel) => document.querySelector(sel);
    const qsa = (sel) => Array.from(document.querySelectorAll(sel));

    // Tabs
    const tabs = qsa('.tab-btn');
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            tabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tabName = btn.dataset.tab;
            qsa('.tab-content').forEach(c => c.classList.remove('active'));
            qs(`#tab-${tabName}`).classList.add('active');
        });
    });

    // Decode Elements
    const fileInput = qs('#fileInput');
    const pasteArea = qs('#pasteArea');
    const readClipboardBtn = qs('#readClipboardBtn');
    const imageUrlInput = qs('#imageUrlInput');
    const loadImageUrlBtn = qs('#loadImageUrlBtn');
    const decodeStatus = qs('#decodeStatus');
    const decodedText = qs('#decodedText');
    const copyDecodedBtn = qs('#copyDecodedBtn');
    const originalImage = qs('#originalImage');
    const previewCanvas = qs('#previewCanvas');
    const ctx = previewCanvas.getContext('2d');

    // Encode Elements
    const encodeTextInput = qs('#encodeTextInput');
    const errorCorrection = qs('#errorCorrection');
    const qrSizeInput = qs('#qrSize');
    const generateQrBtn = qs('#generateQrBtn');
    const qrOutput = qs('#qrOutput');
    const pageUrlInput = qs('#pageUrlInput');
    const fetchPageBtn = qs('#fetchPageBtn');
    const pageFetchStatus = qs('#pageFetchStatus');

    function setStatus(el, msg) {
        el.textContent = msg;
    }
    function clearStatus(el) {
        el.textContent = '';
    }

    function copyText(text) {
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                alert('已复制到剪贴板');
            }).catch(() => {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }
    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); alert('已复制到剪贴板'); } catch (e) { alert('复制失败'); }
        document.body.removeChild(ta);
    }

    // ---------- Decode Logic ----------
    function drawImageToCanvas(img) {
        const w = img.width;
        const h = img.height;
        previewCanvas.width = w;
        previewCanvas.height = h;
        ctx.drawImage(img, 0, 0);
    }

    function decodeFromCanvas() {
        try {
            const imageData = ctx.getImageData(0, 0, previewCanvas.width, previewCanvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code) {
                decodedText.textContent = code.data || '';
                setStatus(decodeStatus, '解码成功');
            } else {
                decodedText.textContent = '';
                setStatus(decodeStatus, '未识别到二维码');
            }
        } catch (e) {
            console.error(e);
            setStatus(decodeStatus, '读取像素失败：可能存在跨域限制或图片无效');
        }
    }

    function handleFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            setStatus(decodeStatus, '请选择图片文件');
            return;
        }
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => { drawImageToCanvas(img); decodeFromCanvas(); };
        img.onerror = () => { setStatus(decodeStatus, '图片加载失败'); };
        img.src = url;
        // 显示原图
        if (originalImage) {
            originalImage.src = url;
        }
    }

    fileInput.addEventListener('change', (e) => {
        clearStatus(decodeStatus);
        const file = e.target.files[0];
        handleFile(file);
    });

    // Paste & Drag
    pasteArea.addEventListener('paste', (e) => {
        clearStatus(decodeStatus);
        const items = e.clipboardData && e.clipboardData.items ? e.clipboardData.items : [];
        for (const it of items) {
            if (it.type.startsWith('image/')) {
                const file = it.getAsFile();
                handleFile(file);
                e.preventDefault();
                return;
            }
        }
        setStatus(decodeStatus, '粘贴内容不包含图片');
    });

    pasteArea.addEventListener('dragover', (e) => {
        e.preventDefault(); pasteArea.classList.add('dragover');
    });
    pasteArea.addEventListener('dragleave', () => pasteArea.classList.remove('dragover'));
    pasteArea.addEventListener('drop', (e) => {
        e.preventDefault(); pasteArea.classList.remove('dragover');
        const file = e.dataTransfer.files && e.dataTransfer.files[0];
        handleFile(file);
    });

    readClipboardBtn.addEventListener('click', async () => {
        clearStatus(decodeStatus);
        if (!navigator.clipboard || !navigator.clipboard.read) {
            setStatus(decodeStatus, '此浏览器不支持直接读取剪贴板图片，请使用粘贴或拖拽');
            return;
        }
        try {
            const items = await navigator.clipboard.read();
            for (const item of items) {
                for (const type of item.types) {
                    if (type.startsWith('image/')) {
                        const blob = await item.getType(type);
                        const file = new File([blob], 'clipboard-image', { type });
                        handleFile(file);
                        return;
                    }
                }
            }
            setStatus(decodeStatus, '剪贴板中未检测到图片');
        } catch (e) {
            console.error(e);
            setStatus(decodeStatus, '读取剪贴板失败：可能需要HTTPS或未授权');
        }
    });

    // Load image from URL
    loadImageUrlBtn.addEventListener('click', async () => {
        clearStatus(decodeStatus);
        decodedText.textContent = '';
        const url = imageUrlInput.value.trim();
        if (!url) { setStatus(decodeStatus, '请输入图片URL'); return; }
        try {
            const resp = await fetch(url, { mode: 'cors' });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const blob = await resp.blob();
            const img = new Image();
            const objUrl = URL.createObjectURL(blob);
            img.onload = () => { drawImageToCanvas(img); decodeFromCanvas(); };
            img.onerror = () => { setStatus(decodeStatus, '图片加载失败'); };
            img.src = objUrl;
            // 显示原图
            if (originalImage) {
                originalImage.src = objUrl;
            }
        } catch (e) {
            console.error(e);
            setStatus(decodeStatus, '加载图片失败：可能被CORS限制或网络错误');
        }
    });

    decodedText.addEventListener('click', () => {
        copyText(decodedText.textContent.trim());
    });
    copyDecodedBtn.addEventListener('click', () => {
        copyText(decodedText.textContent.trim());
    });

    // ---------- Encode Logic ----------
    function renderQRCode(text, ecLevel, size) {
        qrOutput.innerHTML = '';
        // qrcodejs uses string EC levels: L/M/Q/H
        const qr = new QRCode(qrOutput, {
            text: text,
            width: size,
            height: size,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel[ecLevel] || QRCode.CorrectLevel.M,
        });
        return qr;
    }

    function updateQRCode() {
        const text = encodeTextInput.value.trim();
        const ec = (errorCorrection.value || 'M').toUpperCase();
        const size = Math.max(128, Math.min(1024, parseInt(qrSizeInput.value || '256', 10)));
        if (!text) { qrOutput.innerHTML = ''; return; }
        try {
            renderQRCode(text, ec, size);
        } catch (e) {
            console.error(e);
        }
    }

    function debounce(fn, delay) {
        let t;
        return function (...args) {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    const scheduleUpdate = debounce(updateQRCode, 200);

    // 实时生成：监听输入与设置变化
    encodeTextInput.addEventListener('input', scheduleUpdate);
    errorCorrection.addEventListener('change', scheduleUpdate);
    qrSizeInput.addEventListener('input', scheduleUpdate);

    // 保留按钮作为手动触发（可选）
    generateQrBtn.addEventListener('click', updateQRCode);

    fetchPageBtn.addEventListener('click', async () => {
        pageFetchStatus.textContent = '';
        const url = pageUrlInput.value.trim();
        if (!url) { setStatus(pageFetchStatus, '请输入网址'); return; }
        try {
            const resp = await fetch(url, { mode: 'cors' });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const htmlText = await resp.text();
            const dom = new DOMParser().parseFromString(htmlText, 'text/html');
            const body = dom && dom.body ? dom.body : null;
            let text = body ? body.innerText || '' : '';
            text = text.replace(/\s+/g, ' ').trim();
            const maxLen = 2000; // 防止过长导致二维码容量溢出
            if (text.length > maxLen) {
                text = text.slice(0, maxLen);
                setStatus(pageFetchStatus, `内容较长，已截断至 ${maxLen} 字符`);
            } else {
                setStatus(pageFetchStatus, '已获取网页内容');
            }
            const ec = (errorCorrection.value || 'M').toUpperCase();
            const size = Math.max(128, Math.min(1024, parseInt(qrSizeInput.value || '256', 10)));
            renderQRCode(text, ec, size);
        } catch (e) {
            console.error(e);
            setStatus(pageFetchStatus, '获取网页失败：可能被CORS限制或网络错误');
        }
    });
})();
