import fs from 'fs';
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import * as deepl from 'deepl-node';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeDocument from 'rehype-document';
import rehypeFormat from 'rehype-format';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkStringify from 'remark-stringify';
import remarkGfm from 'remark-gfm';

const START_LANG = 'en';
const TARGET_LANG = 'es';
const INPUT_FILE = './101.md'

const API_KEY = '11b82c15-970a-11fb-c8b1-8d2e5db3cc0d:fx'
const translator = new deepl.Translator(API_KEY);

(async () => {
    const rawMarkdown = fs.readFileSync(INPUT_FILE, 'utf8');
    const htmlString = String(await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeDocument)
        .use(rehypeFormat)
        .use(rehypeStringify)
        .process(rawMarkdown)
    );

    const htmlBuffer = Buffer.from( 
        await new Blob([htmlString], { type: 'text/html' }).arrayBuffer()
    );
    
    try {
        const documentHandle = await translator.uploadDocument(
            htmlBuffer, 
            START_LANG,
            TARGET_LANG, 
            { formality: 'default', filename: 'test.html'}
        );
        const { status } = await translator.isDocumentTranslationComplete(documentHandle);

        if (status.status !== 'done' || status.errorMessage) 
            throw new Error(status.errorMessage || 'Problem translating document');

        const responseDoc = await fetch(`https://api-free.deepl.com/v2/document/${documentHandle.documentId}/result`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'Authorization': `DeepL-Auth-Key ${API_KEY}`
            },
            body: [`document_key=${documentHandle.documentKey}`]
        }).then(r => r.text());


        const transMarkdownString = String(await unified()
            .use(rehypeParse)
            .use(rehypeRemark)
            .use(remarkGfm)
            .use(remarkStringify)
            .process(responseDoc)
        );

        fs.writeFileSync('./output.md', transMarkdownString);

    } catch (error) {
        console.log(`Error occurred during document translation: ${error}`);
    }
})();