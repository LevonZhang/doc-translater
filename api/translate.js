// vercel/api/translate.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const docx4js = require("docx4js");
const multer = require('multer'); // 引入 multer 中间件
const upload = multer({ dest: '/tmp/' }); // 设置临时文件存储路径

export default async function handler(req, res) {
  upload.single('file')(req, res, async (err) => {
    if (err) {
        console.error("Error uploading file:", err);
        return res.status(500).json({ error: '文件上传失败。' });
    }

    try {
        // 从 req.file 中获取上传的文件信息
        const file = req.file; 
        const { targetLanguage, bilingual } = req.body;
        // 初始化 Google Gemini API 客户端
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

        // 使用 docx4js 读取 Word 文档
        const doc = await docx4js.load(file);

        // 提取待翻译的文本内容
        let textToTranslate = "";
        const paragraphs = doc.querySelectorAll("w\\:p");
        paragraphs.forEach((p) => {
        textToTranslate += p.textContent + "\n";
        });

        // 调用 Google Gemini API 进行翻译
        const response = await genAI.translateText({
        targetLanguage: targetLanguage,
        text: textToTranslate,
        });
        const translatedText = response[0].text;

        // 处理翻译结果
        let translatedParagraphs = translatedText.split('\n');
        let i = 0;
        paragraphs.forEach((p, index) => {
        if (bilingual) {
            // 双语对照版：在原段落下插入翻译后的段落，并复制格式
            const newParagraph = doc.createElement("w:p");
            newParagraph.innerHTML = translatedParagraphs[i++]; 
            p.parentNode.insertBefore(newParagraph, p.nextSibling); 

            // 复制格式
            const sourcePr = p.querySelector('w:pPr');
            const targetPr = newParagraph.querySelector('w:pPr');
            if (sourcePr) {
            targetPr ? targetPr.innerHTML = sourcePr.innerHTML : newParagraph.appendChild(sourcePr.cloneNode(true));
            }
        } else {
            // 纯翻译版：直接替换原文本
            p.textContent = translatedParagraphs[i++];
        }
        });

        // 生成新的 Word 文档数据
        const translatedDoc = await doc.save();

        // 返回翻译后的文档数据
        res.status(200).json({ translatedDoc });
    } catch (error) {
        console.error("Error translating document:", error);
        res.status(500).json({ error: error.message }); 
    }
  }); 
}