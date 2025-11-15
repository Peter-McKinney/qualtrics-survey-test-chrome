# Qualtrics Survey Test Chrome Extension

A chrome extension that will launch intercept surveys by clearing the browser cookie for an intercept survey. Users can clear each survey cookie individually or all at once using the clear all and launch button.

The goal of this plugin is to provide an easier way to test client intercept surveys without navigate through the full user flow to trigger the survey.

## Store Page:

[Chrome Web Store]()

## Loading the unpacked plugin locally

The unpacked plugin is located in the src folder

[chrome developer docs](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)

Follow the instructions located at the above url. It's probably a good idea to read through that entire tutorial.

## Bundling the extension

Run:

```
npm run package
```

This will create a zip file named `extension.zip` in the root directory of the project. This zip file can be uploaded to the chrome web store for distribution.
