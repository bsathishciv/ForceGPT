const { URL } = require('url');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const Queue = require('bull');
require('dotenv').config();

const redisConfigUrl = (process.env.REDIS_TLS_URL ? process.env.REDIS_TLS_URL : process.env.REDIS_URL);
const parsedURL = new URL(redisConfigUrl);

const connectQueue = (name) => new Queue(name, {
	redis: {
		host: parsedURL.hostname || 'localhost',
		port: Number(parsedURL.port || 6379),
		password: parsedURL.password ? decodeURIComponent(parsedURL.password) : null,
		tls: { rejectUnauthorized: false }
	},
	defaultJobOptions: {
		removeOnComplete: true,
		removeOnFail: false,
		attempts: 3,
		retryProcessDelay: 20000,
		stalledInterval: 0,
		lockDuration: 30000
	}
});

module.exports = { connectQueue };