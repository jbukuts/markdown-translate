# Markdown Translate CLI

Simple CLI tool to translate Markdown files. Currently is capable to make use of:

- IBM Language Translator Service
- DeepL Translate API

These services allow for the upload and translation of HTML documents already. This script simply transforms Markdown into HTML for upload. Then upon retrieval of the translated document, it is then transformed back into Markdown and saved as a new file.

As a quick note if MDX syntax is being used the translation to HTML will cause custom components to be removed.

Also recommend executing the script using at least Node v18.0.0

## Getting started

First start by cloning the repo to your machine.

Then install dependencies via:

```bash
npm ci
```

Then run:

```bash
./bin.js
```

You should see a help message telling you the needed arguments.

## Example usage

```bash
./bin.js <filename> --key API_KEY --api deepl --source en --target es

# or

./bin.js <filename> --key API_KEY --url INSTANCE_URL
```

When not supplied the default `--api` option is `ibm` using the IBM Language Translator Service. This option also requires the `--url` which correlates to your instance's service URL available in your cloud account's resource list.

The `--source` and `--target` options are both optional and will default to `en` and `es` respectively.

Run `./index.js --help` to see all options.
