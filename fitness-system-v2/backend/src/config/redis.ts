import { createClient, RedisClientType } from 'redis';
import config from '../config';
import logger from '../utils/logger';

class RedisService {
  private client: RedisClientType;
  private connected: boolean = false;

  constructor() {
    this.client = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port
      },
      password: config.redis.password,
      database: config.redis.db
    });

    this.client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
      this.connected = false;
    });

    this.client.on('connect', () => {
      logger.info('Redis Client Connected');
      this.connected = true;
    });

    this.client.on('ready', () => {
      logger.info('Redis Client Ready');
    });

    this.client.on('end', () => {
      logger.info('Redis Client Disconnected');
      this.connected = false;
    });
  }

  async connect(): Promise<boolean> {
    try {
      await this.client.connect();
      return true;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      logger.error('Error disconnecting from Redis:', error);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  // 设置键值对
  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error('Redis SET error:', error);
      return false;
    }
  }

  // 获取值
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  }

  // 删除键
  async del(key: string): Promise<boolean> {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error:', error);
      return false;
    }
  }

  // 检查键是否存在
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      return false;
    }
  }

  // 设置过期时间
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      await this.client.expire(key, seconds);
      return true;
    } catch (error) {
      logger.error('Redis EXPIRE error:', error);
      return false;
    }
  }

  // 获取剩余过期时间
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error('Redis TTL error:', error);
      return -1;
    }
  }

  // 设置JSON对象
  async setJSON(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const jsonString = JSON.stringify(value);
      return await this.set(key, jsonString, ttl);
    } catch (error) {
      logger.error('Redis setJSON error:', error);
      return false;
    }
  }

  // 获取JSON对象
  async getJSON(key: string): Promise<any | null> {
    try {
      const jsonString = await this.get(key);
      if (jsonString) {
        return JSON.parse(jsonString);
      }
      return null;
    } catch (error) {
      logger.error('Redis getJSON error:', error);
      return null;
    }
  }

  // 原子性增加
  async incr(key: string): Promise<number | null> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error('Redis INCR error:', error);
      return null;
    }
  }

  // Hash操作
  async hSet(key: string, field: string, value: string): Promise<boolean> {
    try {
      await this.client.hSet(key, field, value);
      return true;
    } catch (error) {
      logger.error('Redis HSET error:', error);
      return false;
    }
  }

  async hGet(key: string, field: string): Promise<string | null> {
    try {
      const result = await this.client.hGet(key, field);
      return result || null;
    } catch (error) {
      logger.error('Redis HGET error:', error);
      return null;
    }
  }

  async hGetAll(key: string): Promise<Record<string, string> | null> {
    try {
      return await this.client.hGetAll(key);
    } catch (error) {
      logger.error('Redis HGETALL error:', error);
      return null;
    }
  }

  // 列表操作
  async lPush(key: string, value: string): Promise<boolean> {
    try {
      await this.client.lPush(key, value);
      return true;
    } catch (error) {
      logger.error('Redis LPUSH error:', error);
      return false;
    }
  }

  async rPop(key: string): Promise<string | null> {
    try {
      return await this.client.rPop(key);
    } catch (error) {
      logger.error('Redis RPOP error:', error);
      return null;
    }
  }

  // 获取原始客户端（用于复杂操作）
  getClient(): RedisClientType {
    return this.client;
  }
}

// 创建单例实例
const redisService = new RedisService();

export default redisService;