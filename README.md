# Naive Bayes classifier

This is an implementation of Naive Bayes classifier written in TypeScript as Node.js application.
This application is written as a part of Information Retrieval course project with a main purpose as text sentiment analyzer.

## Running

You need to have Node v7+ installed on your machine.

Install dependencies with `npm install` and build JS files with `npm run build`.

You should have some kind of training data, but there are Wiki articles and Reuteres articles supplied in the current version.
Current version doesn't support specifying data paths, so you need to change these in `index.ts`.

To train your classifier, run `node index.js -t -w`. This will train the classifier and save it to `export` folder.
After that, just enter document you want to classify.

When you have trained classifier, you can jsut ran `node index.js` or `npm run run` and just enter documents for classifications.

You can always run `node index.js --help` and see all available CLI options.

## Data format

Training data are supposed to be formatted as: **LABEL** _tab_ **TEXT**

## Statistics

For seeing statistics for your trained classifier over the set of testing data, just run `node index.js --stats`.
Test data should be formatted as training data.

## About

This is Multinomial version of Naive Bayes classifier.
 Tokenization is achieved using Porter stemmer implementation in JavaScript.