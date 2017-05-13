import * as fs from 'fs'
interface TokenOccurrence {
  label: string
  docCount: number
  tokenCount: number
  tokenInfo: {
    token: string;
    occurrence: number;
  }[]
}

export class NaiveBayesClassifier {
  private _tokenOccurrenceObject: TokenOccurrence[]
  private _documentCount: number

  private constructor() {
    this._tokenOccurrenceObject = []
    this._documentCount = 0
  }

  public train(document: string, label: string) {
    const words = this.extractWordsFromDocument(document)
    let labelIndex: number = this._tokenOccurrenceObject.findIndex(el => el.label == label)

    this._documentCount++

    if (labelIndex > -1) {
      this._tokenOccurrenceObject[labelIndex].docCount++
    } else {
      this._tokenOccurrenceObject.push({
        label,
        docCount: 1,
        tokenInfo: [],
        tokenCount: 0,
      })
      labelIndex = this._tokenOccurrenceObject.length - 1
    }

    words.forEach(word => {
      const wordIndex = this._tokenOccurrenceObject[labelIndex].tokenInfo.findIndex(tokenInfo => tokenInfo.token == word)
      if (wordIndex > -1) {
        this._tokenOccurrenceObject[labelIndex].tokenInfo[wordIndex].occurrence++
      } else {
        this._tokenOccurrenceObject[labelIndex].tokenInfo.push({token: word, occurrence: 1})
      }
      this._tokenOccurrenceObject[labelIndex].tokenCount++
    })
  }

  public toString() {
    return JSON.stringify(this)
  }

  public static create(path: string): NaiveBayesClassifier {
    const instance: NaiveBayesClassifier = new NaiveBayesClassifier
    if (fs.existsSync(path)) {
      const properties: NaiveBayesClassifier = JSON.parse(fs.readFileSync(path, 'utf-8').toString())
      instance._documentCount = properties._documentCount
      instance._tokenOccurrenceObject = properties._tokenOccurrenceObject
    }
    return instance
  }

  public toFile(path: string) {
    fs.writeFileSync(path, this, 'utf-8')
  }

  public classify(document: string): string {
    const words = this.extractWordsFromDocument(document)
    const sumOfTokens: any = {}
    let probabilities: any = {}

    this._tokenOccurrenceObject.forEach(el => sumOfTokens[el.label] = this.allTokenOccurrence(el.label))
    this._tokenOccurrenceObject.forEach(el => probabilities[el.label] = 0)

    this._tokenOccurrenceObject.forEach(tokenOccurrence => {
      const label = tokenOccurrence.label
      const tokens = []
      tokenOccurrence.tokenInfo.forEach(tokenInfo => tokens[tokenInfo.token] = tokenInfo.occurrence)

      words.forEach(word => {
        const prob = tokenOccurrence[word] ? (tokenOccurrence[word] + 1) : 1
        probabilities[label] += Math.log(prob) - Math.log(sumOfTokens[label] + tokenOccurrence.tokenCount)
      })

      probabilities[label] += Math.log(tokenOccurrence.docCount) - Math.log(this._documentCount)
    })

    console.log(probabilities)

    return this.maxProbability(probabilities)
  }

  private maxProbability(probabilities: any): string {
    let maxLabel = ''
    let maxVal = 0
    for (let key in probabilities) {
      if (probabilities.hasOwnProperty(key)) {
        if (Math.abs(probabilities[key]) > maxVal) {
          maxVal = Math.abs(probabilities[key])
          maxLabel = key
        }
      }
    }

    return maxLabel
  }

  private allTokenOccurrence(label: string): number {
    return this._tokenOccurrenceObject.find(el => el.label == label).tokenCount
  }

  private extractWordsFromDocument(document: string): string[] {
    let words: string[] = document.toLowerCase()
      .split(' ')
    words = words.map(word => word.replace(/\W/g, '').trim())
    return words
  }
}