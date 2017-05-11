export class DocClass {
    public label: string;
    private _totalDocuments: number;
    get totalDocuments(): number {
        return this._totalDocuments;
    }

    constructor(label: string) {
        this.label = label;
        this._totalDocuments = 0;
    }

    public addDoc(): void {
        this._totalDocuments++;
    }

    public priorProbability(total: number): number {
        return Math.log(this._totalDocuments / total);
    }
}
