import {Word} from './word';
import {DocClass} from './document-class';

export class NaiveBayesClassifier {
    private _words: Set<Word>;
    private _docClasses: Set<DocClass>;

    constructor() {
        this._words = new Set();
        this._docClasses = new Set();
    }

    public train(document: string, label: string) {
        let words = this.extractWordsFromDocument(document);

        if (!this.labelExists(label)) {
            this._docClasses.add(new DocClass(label));
        }

        this.updateDocCount(label);

        words.forEach(word => {
            if (!this.wordExists(word)) {
                this._words.add(new Word(word));
            }
        });

        this.filterWordObjects(words).forEach(word => {
            word.addWordToClass(label);
        })
    }

    public classify(document: string): string {
        let words: string[] = this.extractWordsFromDocument(document);
        let filteredWords = this.filterWordObjects(words);
        let probabilities: { label: string, value: number }[] = [];
        let totalWords = this._words.size;
        let totalDocs = this.totalDocCount();

        this._docClasses.forEach(docClass => {
            let probability: number = 1;
            let prior: number = docClass.priorProbability(totalDocs);

            filteredWords.forEach(word => {
                probability *= word.probabilityForLabel(docClass.label); /*/ word.probabilityForEvidence(totalWords);*/
            });

            probabilities.push({label: docClass.label, value: probability * prior});
        });

        console.log(probabilities);

        let maxLabel = probabilities[0].label;
        let maxVal = probabilities[0].value;
        for (let prob of probabilities) {
            if (prob.value > maxVal) {
                maxVal = prob.value;
                maxLabel = prob.label;
            }
        }

        console.log('max label', maxLabel);

        return maxLabel;
    }

    private totalDocCount(): number {
        let total: number = 0;

        this._docClasses.forEach(docClass => total += docClass.totalDocuments);

        return total;
    }

    private labelExists(label: string): boolean {
        for (let docClass of this._docClasses) {
            if (docClass.label == label) {
                return true;
            }
        }
        return false;
    }

    private wordExists(word: string): boolean {
        for (let w of this._words) {
            if (w.text == word) {
                return true;
            }
        }
        return false;
    }

    private updateDocCount(label: string) {
        for (let docClass of this._docClasses) {
            if (docClass.label == label) {
                docClass.addDoc();
                return;
            }
        }
    }

    private filterWordObjects(words: string[]): Set<Word> {
        let filteredWords = new Set();

        this._words.forEach(word => {
            if (words.indexOf(word.text) > -1) {
                filteredWords.add(word);
            }
        });

        return filteredWords;
    }

    private extractWordsFromDocument(document: string): string[] {
        let words: string[] = document.toLowerCase()
            .split(' ');
        words = words.map(word => word.replace(/\W/g, '').trim());
        return words;
    }
}