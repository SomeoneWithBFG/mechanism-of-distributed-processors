import 'dotenv/config'
import { DbService } from './services/db.service'
import { HttpService } from './services/http.service'
import { App } from './app'

const dbService = new DbService()
const httpService = new HttpService()

const app = new App(dbService, httpService)

app.run()
