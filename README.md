# Markdown Translate CLI

<p>
    <a href="https://www.npmjs.com/package/markdown-translate">
        <img src="https://img.shields.io/npm/v/markdown-translate"/>
    </a>
    <a href="https://github.com/jbukuts/markdown-translate/blob/main/LICENSE">
        <img src="https://img.shields.io/npm/l/markdown-translate"/>
    </a>
</p>


Simple CLI tool to translate Markdown files. Currently is capable to make use of:

- IBM Language Translator Service
- DeepL Translate API

These services allow for the upload and translation of HTML documents already. This script simply transforms Markdown into HTML for upload. Then upon retrieval of the translated document, it is then transformed back into Markdown and saved as a new file.

It's also recommended to execute the script using at least Node v18.0.0 if running source code locally. 

## Features

- Translates Markdown content keeping original formatting
- Code blocks and inline code are not translated by default
- Frontmatter values are translated

## Installation

If you like to use the CLI via installation through NPM simply run:

```bash
npm install -g markdown-translate
```

And that's it! You can start translating your documentation immediately like so:

```bash
markdown-translate ./test.md --api deepl --key $DEEPL_API_KEY
```

## Getting started locally

First start by cloning the repo to your machine.

Then install dependencies via:

```bash
npm ci
```

Then run:

```bash
./bin.js

# or

node ./bin.js
```

> If you can't execute the file immediately try making it executable via `chmod +x ./bin.js`

Once you've executable the script you should see a help message telling you the needed arguments.

When not supplied the default `--api` option is `ibm` using the IBM Language Translator Service. This option also requires the `--url` which correlates to your instance's service URL available in your cloud account's resource list.

The `--source` and `--target` options are both optional and will default to `en` and `es` respectively.

Run `./bin.js --help` to see all options.
