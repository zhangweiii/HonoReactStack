import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DatabaseService, Env } from '../../../src/server/services/db'; // Adjust path as needed
import * as bcrypt from 'bcryptjs';

// Mock PrismaClient
const mockPrismaClient = {
  user: {
    create: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    delete: vi.fn(), // Added for completeness, though not directly tested here for now
  },
  $disconnect: vi.fn(),
};

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrismaClient),
}));

// Mock PrismaD1 adapter (if its constructor or methods are called directly in db.ts)
vi.mock('@prisma/adapter-d1', () => ({
  PrismaD1: vi.fn(),
}));

// Mock bcryptjs
vi.mock('bcryptjs', async (importOriginal) => {
  const actualBcrypt = await importOriginal();
  return {
    ...actualBcrypt,
    hashSync: vi.fn(),
    compareSync: vi.fn(),
  };
});

describe('DatabaseService', () => {
  let dbService: DatabaseService;
  const mockEnv: Env = { DB: {} as D1Database }; // Mock D1Database as needed

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Re-initialize service before each test to ensure clean state and mock application
    dbService = DatabaseService.getInstance(mockEnv);

    // Default mock implementations
    (bcrypt.hashSync as vi.Mock).mockImplementation((data, salt) => `hashed_${data}_${salt}`);
    (bcrypt.compareSync as vi.Mock).mockImplementation((data, hash) => `hashed_${data}_10` === hash);
  });

  afterEach(() => {
    // Clear singleton instance for isolation between test files if necessary,
    // though with clearAllMocks and re-initialization, it might be redundant here.
    // (DatabaseService as any).instance = undefined;
  });

  describe('User Creation and Hashing', () => {
    it('should hash the password when createUser is called', async () => {
      const userData = { email: 'test@example.com', password: 'password123', name: 'Test User' };
      const saltRounds = 10;
      mockPrismaClient.user.create.mockResolvedValueOnce({ ...userData, id: 1, password: `hashed_${userData.password}_${saltRounds}` });

      await dbService.createUser(userData);

      expect(bcrypt.hashSync).toHaveBeenCalledWith(userData.password, saltRounds);
      expect(mockPrismaClient.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: userData.email,
            password: `hashed_${userData.password}_${saltRounds}`,
          }),
        })
      );
    });

    it('should hash the password when updateUser is called with a new password', async () => {
      const userId = 1;
      const originalPassword = 'newPassword123';
      const updateData = { password: originalPassword, name: 'Updated User' };
      const saltRounds = 10;
      const expectedHashedPassword = `hashed_${originalPassword}_${saltRounds}`;

      // Mock what Prisma's update method will return
      mockPrismaClient.user.update.mockResolvedValueOnce({ 
        id: userId, 
        name: updateData.name, 
        email: 'test@example.com', // ensure all fields are present if necessary for return type
        password: expectedHashedPassword, 
        role: 'user', 
        isActive: true, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      });

      await dbService.updateUser(userId, { ...updateData }); // Pass a copy to avoid mutation of original test data if service mutates

      // Check that bcrypt.hashSync was called with the ORIGINAL plain password
      expect(bcrypt.hashSync).toHaveBeenCalledWith(originalPassword, saltRounds);
      
      // Check that prisma.user.update was called with the HASHED password
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: userId },
          data: expect.objectContaining({
            password: expectedHashedPassword, // This must match the output of your bcrypt.hashSync mock
          }),
        })
      );
    });

    it('should not call hashSync if password is not provided in updateUser', async () => {
      const userId = 1;
      const updateData = { name: 'Updated User Only Name' };
      // Ensure the mock resolved value matches the expected return type, even if password isn't part of this specific test's focus
      mockPrismaClient.user.update.mockResolvedValueOnce({ 
        id: userId, 
        email: 'test@example.com', 
        name: updateData.name, 
        password: 'some_existing_hashed_password', // Representing an unchanged password
        role: 'user', 
        isActive: true, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      });

      await dbService.updateUser(userId, { ...updateData }); // Pass a copy

      expect(bcrypt.hashSync).not.toHaveBeenCalled();
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: userId },
          data: updateData, // original updateData should not have password
        })
      );
    });
  });

  describe('User Validation', () => {
    const userEmail = 'validate@example.com';
    const plainPassword = 'password123';
    const saltRounds = 10;
    const hashedPassword = `hashed_${plainPassword}_${saltRounds}`;
    const mockUser = { id: 2, email: userEmail, password: hashedPassword, isActive: true, name: 'Validate User' };

    it('should validate user with correct password', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValueOnce(mockUser); // Mock for getUserByEmail
      (bcrypt.compareSync as vi.Mock).mockReturnValueOnce(true);

      const result = await dbService.validateUser(userEmail, plainPassword);

      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email: userEmail } }) // Ensure select is not present here for validateUser
      );
      expect(bcrypt.compareSync).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toEqual(expect.objectContaining({ email: userEmail, name: 'Validate User' }));
      expect(result?.password).toBeUndefined();
    });

    it('should not validate user with incorrect password', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValueOnce(mockUser); // Mock for getUserByEmail
      (bcrypt.compareSync as vi.Mock).mockReturnValueOnce(false);

      const result = await dbService.validateUser(userEmail, 'wrongPassword');

      expect(bcrypt.compareSync).toHaveBeenCalledWith('wrongPassword', hashedPassword);
      expect(result).toBeNull();
    });

    it('should return null if user not found during validation', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValueOnce(null); // Mock for getUserByEmail

      const result = await dbService.validateUser('unknown@example.com', 'password123');

      expect(bcrypt.compareSync).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return account_disabled error if user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockPrismaClient.user.findUnique.mockResolvedValueOnce(inactiveUser);
      (bcrypt.compareSync as vi.Mock).mockReturnValueOnce(true);


      const result = await dbService.validateUser(userEmail, plainPassword);

      expect(bcrypt.compareSync).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toEqual({ error: 'account_disabled' });
    });
  });

  describe('User Retrieval - Excluding Password', () => {
    const expectedSelectFields = {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    };

    it('getUsers should select specific fields and exclude password', async () => {
      mockPrismaClient.user.findMany.mockResolvedValueOnce([{ id: 1, name: 'Test' }]);
      await dbService.getUsers();
      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expectedSelectFields,
        })
      );
    });

    it('getUserById should select specific fields and exclude password', async () => {
      const userId = 1;
      mockPrismaClient.user.findUnique.mockResolvedValueOnce({ id: userId, name: 'Test' });
      await dbService.getUserById(userId);
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: userId },
          select: expectedSelectFields,
        })
      );
    });

    it('getUserByEmail should select specific fields and exclude password (when not called by validateUser)', async () => {
      // Note: validateUser calls getUserByEmail internally but we test that specific path separately.
      // This test is for direct calls to getUserByEmail if they were to occur elsewhere, or if its behavior changes.
      const userEmail = 'directcall@example.com';
      mockPrismaClient.user.findUnique.mockResolvedValueOnce({ id: 1, email: userEmail });
      await dbService.getUserByEmail(userEmail); // This call to getUserByEmail should have the select
      
      // This assertion assumes that direct calls to getUserByEmail should also exclude the password.
      // The implementation of db.ts shows getUserByEmail *always* uses select.
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: userEmail },
          select: expectedSelectFields, 
        })
      );
    });
  });

  // TODO: Add tests for registerUser, activateUser, deactivateUser if time permits
  // and if they have logic worth testing beyond simple Prisma calls.
  // For example, registerUser sets isActive: false by default.
});

console.log('Vitest test file for DatabaseService created (but not yet run).');
