import { getSummary } from '../src/controllers/dashboard.controller';
import { Request, Response, NextFunction } from 'express';
import prisma from '../src/prisma';

// Mock the prisma client
jest.mock('../src/prisma', () => ({
  record: {
    groupBy: jest.fn(),
  },
}));

describe('Dashboard Controller - getSummary', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should return 0 totals when there are no records', async () => {
    (prisma.record.groupBy as jest.Mock).mockResolvedValue([]);

    await getSummary(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.json).toHaveBeenCalledWith({
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
    });
  });

  it('should correctly calculate total income, total expenses, and net balance', async () => {
    (prisma.record.groupBy as jest.Mock).mockResolvedValue([
      { type: 'INCOME', _sum: { amount: 5000 } },
      { type: 'EXPENSE', _sum: { amount: 2000 } },
    ]);

    await getSummary(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.json).toHaveBeenCalledWith({
      totalIncome: 5000,
      totalExpenses: 2000,
      netBalance: 3000,
    });
  });
});
