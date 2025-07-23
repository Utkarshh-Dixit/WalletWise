import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
    try {
        //Here i just used the default key "my-rate-limit" for all requests.
        //You can customize this to use user ID or any other identifier if needed.
        //For example, you can use: const key = req.user
        
        const { success } = await ratelimit.limit("my-rate-limit");

        if(!success) {
            return res.status(429).json({ error: 'Too many requests, please try again later.' });
        }

        next();
    } catch (error) {
        console.error('Rate limiter error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
        
    }
};

export default rateLimiter;
