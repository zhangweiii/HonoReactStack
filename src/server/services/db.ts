import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

// 环境类型定义
export interface Env {
  DB: D1Database;
  NODE_ENV?: string;
  ADMIN_SECRET_KEY?: string;
}

// 数据库服务类
export class DatabaseService {
  private prisma: PrismaClient;
  private static instance: DatabaseService;

  private constructor(env?: Env) {
    if (env?.DB) {
      // 使用 D1 数据库
      const adapter = new PrismaD1(env.DB);
      this.prisma = new PrismaClient({ adapter });
      console.log('Using D1 database');
    } else {
      // 使用 MySQL 或 SQLite 数据库 (通过 .env 配置)
      this.prisma = new PrismaClient();
      console.log('Using MySQL/SQLite database via connection string');
    }
  }

  // 单例模式获取实例
  public static getInstance(env?: Env): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService(env);
    }
    return DatabaseService.instance;
  }

  // 获取 Prisma 客户端
  public getPrisma(): PrismaClient {
    return this.prisma;
  }

  // 关闭数据库连接
  public async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  // 用户相关操作
  public async getUsers() {
    return this.prisma.user.findMany();
  }

  public async getUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }

  public async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  public async createUser(data: { name?: string; email: string; password: string; role?: string; isActive?: boolean }) {
    return this.prisma.user.create({
      data
    });
  }

  public async updateUser(id: number, data: { name?: string; email?: string; password?: string; role?: string; isActive?: boolean }) {
    return this.prisma.user.update({
      where: { id },
      data
    });
  }

  public async deleteUser(id: number) {
    return this.prisma.user.delete({
      where: { id }
    });
  }

  // 登录相关方法
  public async validateUser(email: string, password: string) {
    const user = await this.getUserByEmail(email);
    if (!user || user.password !== password) {
      return null;
    }

    // 检查账户是否激活
    if (!user.isActive) {
      return { error: 'account_disabled' };
    }

    // 不返回密码
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // 注册方法 - 默认不激活账户，需要管理员手动激活
  public async registerUser(data: { name?: string; email: string; password: string }) {
    // 默认设置为非激活状态
    return this.createUser({
      ...data,
      isActive: false
    });
  }

  // 管理员激活用户账户
  public async activateUser(id: number) {
    return this.updateUser(id, { isActive: true });
  }

  // 管理员禁用用户账户
  public async deactivateUser(id: number) {
    return this.updateUser(id, { isActive: false });
  }
}

// 导出默认实例
export default DatabaseService;
