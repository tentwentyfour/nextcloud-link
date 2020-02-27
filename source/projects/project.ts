export class Project {
    constructor(
        readonly owner: string,
        readonly name: string,
        readonly foreignId: string,
        readonly id?: string,
        readonly url?: string
    ) {}
}
