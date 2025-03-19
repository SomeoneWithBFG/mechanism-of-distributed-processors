import 'dotenv/config'
import { DB } from './db'
import { HTTP } from './http'
import { App } from './app'

const db = new DB()
const http = new HTTP()

const app = new App(db, http)

app.run()
