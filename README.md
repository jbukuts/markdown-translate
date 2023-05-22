# Markdown Translate CLI

Simple CLI tool to translate Markdown files. Currently is capable to make use of:

- IBM Language Translator Service
- DeepL Translate API

These services allow for the upload and translation of HTML documents already. This script simply transforms Markdown into HTML for upload. Then upon retrieval of the translated document it is then transformed back into Markdown and saved as a new file.

As a quick note if MDX syntax is being used the translation to HTML will cause custom components to be removed.

## Example usage

```bash
./index.js <filename> --key API_KEY --api deepl --source en --target es

# or

./index.js <filename> --key API_KEY --url INSTANCE_URL
```

When not supplied the default `--api` option is `ibm` using the IBM Language Translator Service. This option also requires the `--url` which correlates to your instance's service url available in your cloud account's resource list.

The `--source` and `--target` options are both optional and will defualt to `en` and `es` respectively.

Run `./index.js --help` to see all options.
