import { DbService, Statuses, UrlRecord } from './services/db.service'
import { HttpService } from './services/http.service'

export class App {
    constructor(
        private readonly dbService: DbService,
        private readonly httpService: HttpService
    ) {}

    async run() {
        await this.dbService.connect()

        const newUrls = await this.dbService.getAllNewUrls()

        const promises = []

        for (const url of newUrls) {
            promises.push(this.processUrlRecord(url))
        }

        await Promise.all(promises)

        await this.dbService.disconnect()
    }

    private async processUrlRecord(record: UrlRecord) {
        await this.dbService.updateUrlRecord({
            id: record.id,
            url: record.url,
            status: Statuses.PROCESSING,
        })

        const statusCode = await this.httpService.makeCall(record.url)

        await this.dbService.updateUrlRecord({
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
