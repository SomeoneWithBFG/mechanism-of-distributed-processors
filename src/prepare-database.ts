import { DbService } from './services/db.service'
import 'dotenv/config'

const db = new DbService()

async function prepareDb() {
    await db.prepareDb()
}

prepareDb()
