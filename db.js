const { Pool } = require('pg');

class Db {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false,
            },
        });
    }

    async init() {
        await this.connect();
        await this.createTable();
    }

    async connect() {
        this.client = await this.pool.connect();
    }

    async disconnect() {
        await this.client.release();
        await this.pool.end();
    }

    async createTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS job2 (
                id SERIAL PRIMARY KEY,
                user_id TEXT,
                org_id TEXT,
                payload JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_done BOOLEAN,
                result TEXT
            )
            `;
        await this.client.query(query);
        console.log('Table created successfully.');
    }

    async getJob(userId) {
        const query = 'SELECT id, user_id, org_id, is_done, result FROM job2 WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1';
        const result = await this.client.query(query, [userId]);
        return result.rows[0];
    }

    async completeJob(userId, orgId, result) {
        const query = 'UPDATE job2 SET is_done = true, result = $3 WHERE user_id = $1 and org_id = $2 returning *';
        const res = await this.client.query(query, [userId, orgId, result]);
        console.log(`Job [${res.rows[0].id}] completed successfully!`);
    }

    async createJob(userId, orgId, payload) {
        try {
            const row = await this.getJob(userId, orgId);
            let result;
            if (row) {
                const query = "UPDATE job2 SET is_done = false, result = '', payload = $3, org_id = $2 WHERE user_id = $1 returning *";
                result = await this.client.query(query, [userId, orgId, JSON.stringify(payload)]);
            } else {
                const query = "INSERT INTO job2 (user_id, org_id, is_done, payload, result) values ($1, $2, false, $3, '') returning *;";
                result = await this.client.query(query, [userId, orgId, JSON.stringify(payload)]);
            }
            console.log(`Job [${result.rows[0].id}] created!`);
        } catch(e) {
            console.log(`Error creating Job ${e}`);
        }
    }
}

module.exports = Db