import {NaiveBayesClassifier} from './models/naive-bayes'
import * as fs from 'fs'
import * as readline from 'readline'

const trainClassifier = () => {
  const trainDataFolder: string = `${__dirname}/data/train/`
  fs.readdirSync(trainDataFolder).forEach(file => {
    let data: string[] = fs.readFileSync(trainDataFolder + file).toString('utf-8').split('\n')

    data.forEach(doc => {
      if (doc != ``) {
        let firstSpace = doc.indexOf('\t')
        let label = doc.substring(0, firstSpace)
        let text = doc.slice(firstSpace + 1)
        bayes.train(text, label)
      }
    })
  })
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
'--help' or '-h' - writes this help message`)
} else if (args.has('--wiki')) {
  fs.readdirSync('./data/test').forEach(tag => {
    fs.readdir(`./data/test/${tag}`, (err, files) => {
      if (err) {
        throw err
      }
      files.forEach(file => {
        fs.readFile(`./data/test/${tag}/${file}`, (err, data) => {
          if (err) {
            throw err
          }
          let text = data.toString('utf-8').split('\n')
          text[0] = tag
          fs.writeFile(`./data/test/${tag}/${file}`, text.join('\n'), (err) => {
            if (err) {
              throw err
            }
          })
        })
      })
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
    trainClassifier()
    console.log('Done!')
  }

  if (args.has('--write-out') || args.has('-w')) {
    console.log(`Writing classifier to ${pathToClassifier}`)
    bayes.toFile(pathToClassifier)
    console.log(`Done!`)
  }

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
