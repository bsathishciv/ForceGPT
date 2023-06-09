const { URL } = require('url');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const Queue = require('bull');
require('dotenv').config();

const redisConfigUrl = (process.env.REDIS_TLS_URL ? process.env.REDIS_TLS_URL : process.env.REDIS_URL);
const parsedURL = new URL(redisConfigUrl);
console.log(redisConfigUrl);
const connectQueue = (name) => new Queue(name, {
	redis: {
		host: parsedURL.hostname || 'localhost',
		port: Number(parsedURL.port || 6379),
		password: parsedURL.password ? decodeURIComponent(parsedURL.password) : null,
		tls: { rejectUnauthorized: false },
		enableTLSForSentinelMode: false,
		maxRetriesPerRequest: 1
	},
	defaultJobOptions: {
		removeOnComplete: true,
		removeOnFail: true,
		retryProcessDelay: 20000,
		stalledInterval: 0,
		maxRetriesPerRequest: 1
	}
});

module.exports = { connectQueue };
