const fs = require('fs')
const stemmer = require('stemmer')

interface DocumentLabelInfo {
  label: string
  documentCount: number
  wordCount: number
  wordInfo: {
    word: string;
    occurrence: number;
  }[]
}

export class NaiveBayesClassifier {
  private _labelsAndInfo: DocumentLabelInfo[]
  private _totalDocumentCount: number
  private _vocabulary: Set<string>

  private constructor() {
    this._labelsAndInfo = []
    this._totalDocumentCount = 0
    this._vocabulary = new Set()
  }

  public static create(path: string): NaiveBayesClassifier {
    const instance: NaiveBayesClassifier = new NaiveBayesClassifier
    if (fs.existsSync(path)) {
      const properties: NaiveBayesClassifier = JSON.parse(fs.readFileSync(path, 'utf-8').toString())
      instance._totalDocumentCount = properties._totalDocumentCount
      instance._labelsAndInfo = properties._labelsAndInfo
    }
    return instance
  }

  public toFile(path: string) {
    fs.writeFileSync(path, JSON.stringify(this), 'utf-8')
  }

  public train(document: string, label: string) {
    const words = this.extractWordsFromDocument(document)
    const labelIndex = this.addLabel(label)

    this._totalDocumentCount++
    this._labelsAndInfo[labelIndex].documentCount++

    words.forEach(word => {
      const wordIndex: number = this.addWordInLabel(word, labelIndex)
      this._labelsAndInfo[labelIndex].wordInfo[wordIndex].occurrence++
      this._labelsAndInfo[labelIndex].wordCount++
    })
  }

  private addWordInLabel(word: string, labelIndex: number): number {
    let wordIndex = this._labelsAndInfo[labelIndex]
      .wordInfo
      .findIndex(tokenInfo => tokenInfo.word == word)

    if (wordIndex == -1) {
      this._labelsAndInfo[labelIndex]
        .wordInfo
        .push({word: word, occurrence: 0})
      wordIndex = this._labelsAndInfo[labelIndex].wordInfo.length - 1
      this._vocabulary.add(word)
    }

    return wordIndex
  }

  private addLabel(label: string) {
    let labelIndex: number = this._labelsAndInfo.findIndex(el => el.label == label)

    if (labelIndex == -1) {
      this._labelsAndInfo.push({
        label,
        documentCount: 0,
        wordInfo: [],
        wordCount: 0,
      })
      labelIndex = this._labelsAndInfo.length - 1
    }

    return labelIndex
  }

  public classify(document: string): string {
    const words = this.extractWordsFromDocument(document)

    let maxProbability = -Infinity
    let maxLabel = ''
    this._labelsAndInfo.forEach(labelAndInfo => {
      let probability: number = Math.log(labelAndInfo.documentCount / this._totalDocumentCount)
      const wordCount = labelAndInfo.wordCount

      words.forEach(word => {
        const wordInClass = labelAndInfo.wordInfo.find(ti => ti.word == word)
        const wordFrequencyInClass = wordInClass ? wordInClass.occurrence : 0
        const wordProbability = (wordFrequencyInClass + 1) / (wordCount + this._vocabulary.size)

        probability += Math.log(wordProbability)
      })

      if (probability > maxProbability) {
        maxProbability = probability
        maxLabel = labelAndInfo.label
      }
    })

    return maxLabel
  }

  private extractWordsFromDocument(document: string): string[] {
    let words: string[] = document.toLowerCase()
      .split(' ')
    words = words.map(word => stemmer(word.replace(/\W/g, '').trim()))
    return words
  }
}