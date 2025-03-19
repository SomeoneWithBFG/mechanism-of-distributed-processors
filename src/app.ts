import { DB, Statuses, UrlRecord } from './db'
import { HTTP } from './http'

export class App {
    constructor(
        private readonly db: DB,
        private readonly http: HTTP
    ) {}

    async run() {
        await this.db.connect()

        const newUrls = await this.db.getAllNewUrls()

        const promises = []

        for (const url of newUrls) {
            promises.push(this.processUrlRecord(url))
        }

        await Promise.all(promises)

        await this.db.disconnect()
    }

    private async processUrlRecord(record: UrlRecord) {
        await this.db.updateUrlRecord({
            id: record.id,
            url: record.url,
            status: Statuses.PROCESSING,
        })

        const statusCode = await this.http.makeCall(record.url)

        await this.db.updateUrlRecord({
            id: record.id,
            url: record.url,
            status: this.parseStatusCode(statusCode),
        })
    }

    private parseStatusCode(statusCode: number) {
        const firstNum = statusCode.toString().charAt(0)

        switch (firstNum) {
            case '1':
                return Statuses.PROCESSING
            case '2':
                return Statuses.DONE
            case '3':
                return Statuses.PROCESSING
            case '4':
                return Statuses.ERROR
            case '5':
                return Statuses.ERROR
            default:
                return Statuses.ERROR
        }
    }
}
