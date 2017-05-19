import {NaiveBayesClassifier} from './naive-bayes'
const fs = require('fs')
const readline = require('readline')

interface Stats {
  hits: number
  miss: number
  total: number
}

const testDocs = 250 // * 2
const trainDocs = 1000 // * 2

const readData = (funct: Function, folderPath: string, top: number = 25000) => {
  fs.readdirSync(folderPath).forEach(path => {
    const fullPath = `${folderPath}/${path}`
    if (fs.statSync(fullPath).isDirectory()) {
      readData(funct, fullPath, top)
    } else if (fs.statSync(fullPath).isFile()) {
      const docs: string[] = fs.readFileSync(fullPath).toString('utf-8').split('\n')
      for (let i = 0; i < top; i++) {
        funct(docs[i])
      }
    }
  })
}

const trainClassifiers = (classifiers: NaiveBayesClassifier[]) => (doc: string) => {
  if (doc != ``) {
    let firstSpace = doc.indexOf('\t')
    let label = doc.substring(0, firstSpace)
    let text = doc.slice(firstSpace + 1)
    classifiers.forEach(classifier => classifier.train(text, label))
  }
}

const testClassifier = (classifier: NaiveBayesClassifier, stats: Stats) => (doc: string) => {
  if (doc != ``) {
    const firstSpace = doc.indexOf('\t')
    const label = doc.substring(0, firstSpace)
    const text = doc.slice(firstSpace + 1)
    const guessedLabel = classifier.classify(text)
    if (label == guessedLabel) {
      stats.hits++
    } else {
      stats.miss++
    }
    stats.total++
  }
}

const stats = (classifier: NaiveBayesClassifier, path: string) => {
  const stats: Stats = {
    hits: 0,
    miss: 0,
    total: 0,
  }
  readData(testClassifier(classifier, stats), `${__dirname}/data/test`, testDocs)
  console.log(`Statistics for ${path}:
* total docs: ${stats.total}
* hit count: ${stats.hits} (${((stats.hits / stats.total) * 100).toFixed(2)}%)
* miss count: ${stats.miss} (${((stats.miss / stats.total) * 100).toFixed(2)}%)`)
}

const args: Set<string> = new Set(process.argv.slice(2))

const bayesClassifiers: { classifier: NaiveBayesClassifier, path: string }[] = [
  {
    classifier: new NaiveBayesClassifier(),
    path: `${__dirname}/export/u-f${testDocs}.json`,
  },
  {
    classifier: new NaiveBayesClassifier({presence: true}),
    path: `${__dirname}/export/u-p${testDocs}.json`,
  },
  {
    classifier: new NaiveBayesClassifier({useNegative: true}),
    path: `${__dirname}/export/u-n-f${testDocs}.json`,
  },
  {
    classifier: new NaiveBayesClassifier({presence: true, useNegative: true}),
    path: `${__dirname}/export/u-n-p${testDocs}.json`,
  },
  {
    classifier: new NaiveBayesClassifier({bigrams: true}),
    path: `${__dirname}/export/b-f${testDocs}.json`,
  },
  {
    classifier: new NaiveBayesClassifier({bigrams: true, presence: true}),
    path: `${__dirname}/export/b-p${testDocs}.json`,
  },
]

if (args.has('--help') || args.has('-h')) {
  console.log(`Naive Bayes classifier NodeJS command-line executable.
Written by Mihajlo Ilijic.
Usage:
'--train' or '-t' - read train corpus and train the classifier
'--write-out' or '-w' - save classifier to './export' folder
'--help' or '-h' - writes this help message
'--stats' - writes statistics based on training and testing data
'--fix-data' - reformat test and train data`)
} else if (args.has('--fix-data')) {
  fs.readdirSync('./data').forEach(subDir => {
    fs.readdirSync(`./data/${subDir}`).forEach(tagDir => {
      let data: string = ''
      let noRead = 0
      fs.readdirSync(`./data/${subDir}/${tagDir}`).forEach(file => {
        data += fs.readFileSync(`./data/${subDir}/${tagDir}/${file}`).toString('utf-8') + '\n'
        noRead++
      })
      fs.writeFileSync(`./data/${subDir}/${tagDir}/merged.txt`, data)
      console.log(`written to ./data/${subDir}/${tagDir} and count is ${noRead}`)
    })
  })
} else {
  const lineReader = readline.createInterface(<any>{
    input: process.stdin,
    output: process.stdout,
    prompt: `Enter text to classify or 'q' to quit> `,
  })

  if (args.has('--train') || args.has('-t')) {
    console.log('Training classifier...')

    readData(trainClassifiers(bayesClassifiers.map(el => el.classifier)), `./data/train`, trainDocs)

    console.log('Done!')
  }

  if (args.has('--write-out') || args.has('-w')) {

    bayesClassifiers.forEach(el => {
      console.log('writing out', el.path)
      el.classifier.toFile(el.path)
      console.log('done')
    })

    console.log(`Done!`)
  }

  if (args.has('--stats')) {

    bayesClassifiers.forEach(el => {
      console.log('statistics...', el.path)
      stats(el.classifier, el.path)
    })

    lineReader.close()
  } else {
    lineReader.prompt()
    lineReader.on('line', (line) => {
      if (line == 'q') {
        lineReader.close()
      } else {
        bayesClassifiers.forEach(el => console.log(`Document class is ${el.classifier.classify(line)}`))
        lineReader.prompt()
      }
    })
  }
}
