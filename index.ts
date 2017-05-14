import {NaiveBayesClassifier} from './models/naive-bayes'
const fs = require('fs')
const readline = require('readline')

interface Stats {
  hits: number
  miss: number
  total: number
}

const readData = (funct: Function, folderPath: string) => {
  fs.readdirSync(folderPath).forEach(path => {
    const fullPath = `${folderPath}/${path}`
    if (fs.statSync(fullPath).isDirectory()) {
      readData(funct, fullPath)
    } else if (fs.statSync(fullPath).isFile()) {
      fs.readFileSync(fullPath).toString('utf-8').split('\n').forEach(doc => funct(doc))
    }
  })
}

const trainClassifier = (doc) => {
  if (doc != ``) {
    let firstSpace = doc.indexOf('\t')
    let label = doc.substring(0, firstSpace)
    let text = doc.slice(firstSpace + 1)
    bayes.train(text, label)
  }
}

const testClassifier = (stats: Stats) => (doc) => {
  if (doc != ``) {
    const firstSpace = doc.indexOf('\t')
    const label = doc.substring(0, firstSpace)
    const text = doc.slice(firstSpace + 1)
    const guessedLabel = bayes.classify(text)
    if (label == guessedLabel) {
      stats.hits++
    } else {
      stats.miss++
    }
    stats.total++
  }
}

const args: Set<string> = new Set(process.argv.slice(2))
const pathToClassifier = `${__dirname}/export/bayes.json`
const bayes = NaiveBayesClassifier.create(pathToClassifier)

if (args.has('--help') || args.has('-h')) {
  console.log(`Naive Bayes classifier NodeJS command-line executable.
Written by Mihajlo Ilijic.
Usage:
'--train' or '-t' - read train corpus and train the classifier
'--write-out' or '-w' - save classifier to './export' folder
'--help' or '-h' - writes this help message
'--stats' - writes statistics based on training and testing data`)
} else {
  const lineReader = readline.createInterface(<any>{
    input: process.stdin,
    output: process.stdout,
    prompt: `Enter text to classify or 'q' to quit> `,
  })

  if (args.has('--train') || args.has('-t')) {
    console.log('Training classifier...')
    readData(trainClassifier, `${__dirname}/data/reuteres-train`)
    console.log('Done!')
  }

  if (args.has('--write-out') || args.has('-w')) {
    console.log(`Writing classifier to ${pathToClassifier}`)
    bayes.toFile(pathToClassifier)
    console.log(`Done!`)
  }

  if (args.has('--stats')) {
    const stats: Stats = {
      hits: 0,
      miss: 0,
      total: 0,
    }
    readData(testClassifier(stats), `${__dirname}/data/reuteres-test`)
    console.log(`Statistics:
* total docs: ${stats.total}
* hit count: ${stats.hits} (${((stats.hits / stats.total) * 100).toFixed(2)}%)
* miss count: ${stats.miss} (${((stats.miss / stats.total) * 100).toFixed(2)}%)`)
    lineReader.close()
  } else {
    lineReader.prompt()
    lineReader.on('line', (line) => {
      if (line == 'q') {
        lineReader.close()
      } else {
        const docClass = bayes.classify(line)
        console.log(`Document class is ${docClass}.`)
        lineReader.prompt()
      }
    })
  }
}
