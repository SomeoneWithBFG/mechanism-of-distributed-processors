import fetch from 'node-fetch'

export class HttpService {
    async makeCall(url: string): Promise<number> {
        const response = await fetch(url)
        return response.status
    }
}
