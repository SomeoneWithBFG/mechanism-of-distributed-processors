import { Client } from 'pg'

export type UrlRecord = {
    id: string
    url: string
    status: Statuses
    http_code?: number
}

export enum Statuses {
    NEW = 'NEW',
    PROCESSING = 'PROCESSING',
    DONE = 'DONE',
    ERROR = 'ERROR',
}

export class DB {
    constructor() {
        this.client = new Client({
            user: process.env.POSTGRES_USER,
            database: process.env.POSTGRES_DATABASE,
            password: process.env.POSTGRES_PASSWORD,
            port: parseInt(process.env.POSTGRES_PORT),
            host: process.env.POSTGRES_HOST,
            keepAlive: true,
        })
    }
    private client: Client

    async getAllNewUrls() {
        const selectQuery = `
            select * from urls
            where status='${Statuses.NEW}'
        `

        const res = (await this.runSql(selectQuery)) as { rows: UrlRecord[] }

        return res.rows
    }

    async updateUrlRecord(record: UrlRecord) {
        const updateQuery = `
            update urls 
            set status = $2, http_code = $3
            where id = $1
        `

        const res = (await this.runSql(updateQuery, [
            record.id,
            record.status,
            record.http_code,
        ])) as {
            rows: unknown
        }

        return res.rows
    }

    async connect() {
        return this.client.connect()
    }
    async disconnect() {
        return this.client.end()
    }

    private async runSql(sql: string, vars?: Array<unknown>) {
        return await new Promise((resolve, reject) => {
            this.client.query(sql, vars, (err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res)
            })
        })
    }

    // migration & seeds emulation
    async prepareDb() {
        await this.connect()

        const migrationSql = `
            -- Enable the pgcrypto extension for uuid generation
            create extension if not exists "pgcrypto";

            -- Create the enum type for status
            do $$
            begin
                if not exists (select 1 from pg_type where typname = 'status_enum') then
                    create type status_enum as enum ('NEW', 'PROCESSING', 'DONE', 'ERROR');
                end if;
            end $$;

            -- Create the table with the specified columns
            create table if not exists urls (
                id uuid default gen_random_uuid() primary key,
                url varchar not null,
                status status_enum not null,
                http_code int
            );
        `
        await this.runSql(migrationSql)

        const seedSql = `
            insert into urls (url, status, http_code) values
                -- status -> DONE
                ('https://example.com', 'NEW', NULL),
                ('https://google.com', 'NEW', NULL),
                ('https://reddit.com', 'NEW', NULL),
                ('https://www.youtube.com', 'NEW', NULL),

                -- status -> ERROR
                ('https://example.com/error', 'NEW', NULL),
                ('http://localhost:5051/?pgsql=db&username=admin&db=db&ns=public&select=urls', 'NEW', NULL),

                -- Ignored
                ('https://example.com/ignored', 'DONE', 403),
                ('https://example.com/ignored', 'ERROR', 502),
                ('https://example.com/ignored', 'PROCESSING', 401),
                ('https://example.com/ignored', 'PROCESSING', 204);
        `
        await this.runSql(seedSql)

        await this.disconnect()
    }
}
