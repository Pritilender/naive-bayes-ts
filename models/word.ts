interface LabelCountDict {
    label: string;
    count: number;
}

export class Word {
    public text: string;
    private _totalCount: number;
    private _classCount: LabelCountDict[] = [];

    constructor(text: string) {
        this.text = text;
        this._totalCount = 1;
    }

    public addWordToClass(classLabel: string): void {
        if (this._classCount[classLabel]) {
            this._classCount[classLabel]++;
        } else {
            this._classCount[classLabel] = 1;
        }
        this._totalCount++;
    }

    public probabilityForLabel(classLabel: string): number {
        let probability: number;
        let count = this._classCount[classLabel] || 0;
        probability = (count + 1) / this._totalCount;
        return Math.log(probability);
    }

    public probabilityForEvidence(total: number): number {
        return this._totalCount / total;
    }
}
