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

interface ClassifierOptions {
  presence?: boolean
  bigrams?: boolean
  useNegative?: boolean // only if bigrams is false
}

export class NaiveBayesClassifier {
  private _labelsAndInfo: DocumentLabelInfo[]
  private _totalDocumentCount: number
  private _vocabulary: Set<string>
  private _presence: boolean
  private _bigrams: boolean
  private _useNegative: boolean

  public constructor(options?: ClassifierOptions) {
    const opt = options || {}
    const presence = opt.presence || false
    const bigrams = opt.bigrams || false
    const useNegative = (!bigrams && opt.bigrams) || false

    this._labelsAndInfo = []
    this._totalDocumentCount = 0
    this._vocabulary = new Set()
    this._presence = presence
    this._bigrams = bigrams
    this._useNegative = useNegative
  }

  public toFile(path: string) {
    fs.writeFileSync(path, JSON.stringify(this), 'utf-8')
  }

  public parseFile(path: string) {
    if (fs.existsSync(path)) {
      const properties: NaiveBayesClassifier = JSON.parse(fs.readFileSync(path, 'utf-8').toString())
      this._totalDocumentCount = properties._totalDocumentCount
      this._labelsAndInfo = properties._labelsAndInfo
      this._labelsAndInfo.forEach(doc => doc.wordInfo.forEach(wordInfo => this._vocabulary.add(wordInfo.word)))
      this._presence = properties._presence
      this._bigrams = properties._bigrams
      this._useNegative = properties._useNegative
    }
  }

  public train(document: string, label: string) {
    const words = this.extractWordsFromDocument(document)
    const labelIndex = this.addLabel(label)

    this._totalDocumentCount++
    this._labelsAndInfo[labelIndex].documentCount++

    if (!(this._totalDocumentCount % 1000)) {
      console.log('total docs', this._totalDocumentCount)
    }

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
    // words = words.map(word => stemmer(word.replace(/\W/g, '').trim())
    words = words.map(word => word.replace(/\W/g, '').trim())

    if (this._bigrams) {
      let bigramWords = []

      for (let i = 0; i < words.length; i += 2) {
        bigramWords.push(`${words[i]} ${words[i+1]}`)
      }

      if (!(words.length % 2)) {
        bigramWords.push(words[words.length - 1])
      }

      words = bigramWords
    } else if (this._useNegative) {
      words = words.map((word, i) => {
        const prev = words[i-1]
        if (prev) {
          word = prev.endsWith(`nt`) || prev.endsWith('not') ? `NOT_${word}` : word
        }
        return word
      })
    }

    if (this._presence) {
      const helperSet = new Set(words)
      words = [...helperSet]
    }

    return words
  }

}