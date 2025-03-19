import { DB } from './db'
import 'dotenv/config'

const db = new DB()

async function prepareDb() {
    await db.prepareDb()
}

prepareDb()
