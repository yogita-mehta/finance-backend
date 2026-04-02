import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

export const getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await prisma.record.groupBy({
      by: ['type'],
      _sum: { amount: true },
    });

    let totalIncome = 0;
    let totalExpenses = 0;

    result.forEach((group) => {
      if (group.type === 'INCOME') totalIncome = group._sum.amount || 0;
      if (group.type === 'EXPENSE') totalExpenses = group._sum.amount || 0;
    });

    res.json({
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryTotals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type } = req.query; // optional filter by INCOME or EXPENSE
    const filters: any = {};
    if (type) filters.type = type;

    const result = await prisma.record.groupBy({
      by: ['category'],
      where: filters,
      _sum: { amount: true },
    });

    const categoryTotals = result.map((item) => ({
      category: item.category,
      total: item._sum.amount || 0,
    }));

    res.json({ categoryTotals });
  } catch (error) {
    next(error);
  }
};

export const getRecentTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const records = await prisma.record.findMany({
      take: 10,
      orderBy: { date: 'desc' },
      select: {
        id: true,
        amount: true,
        type: true,
        category: true,
        date: true,
      },
    });

    res.json({ records });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyTrend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Basic approach: fetch all records and group in memory (fine for simple app, or use raw query)
    // SQLite doesn't have a simple group by month natively via Prisma easily without raw queries. 
    // We'll use raw query for speed
    
    const records = await prisma.$queryRaw`
      SELECT 
        strftime('%Y-%m', datetime(date/1000, 'unixepoch')) as month, 
        type, 
        SUM(amount) as total
      FROM Record
      GROUP BY month, type
      ORDER BY month ASC
    `;

    res.json({ trend: records });
  } catch (error) {
    next(error);
  }
};
