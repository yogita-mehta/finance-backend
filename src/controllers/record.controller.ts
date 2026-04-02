import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

export const listRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { startDate, endDate, category, type, limit, offset } = req.query;

    const filters: any = {};
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.gte = new Date(startDate as string);
      if (endDate) filters.date.lte = new Date(endDate as string);
    }
    if (category) filters.category = category;
    if (type) filters.type = type;

    const take = limit ? parseInt(limit as string, 10) : 50;
    const skip = offset ? parseInt(offset as string, 10) : 0;

    const [records, total] = await Promise.all([
      prisma.record.findMany({
        where: filters,
        take,
        skip,
        orderBy: { date: 'desc' },
        include: { createdBy: { select: { name: true, email: true } } },
      }),
      prisma.record.count({ where: filters }),
    ]);

    res.json({ records, total, limit: take, offset: skip });
  } catch (error) {
    next(error);
  }
};

export const createRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { amount, type, category, date, notes } = req.body;
    const userId = (req as any).user.userId;

    const record = await prisma.record.create({
      data: {
        amount,
        type,
        category,
        date: new Date(date),
        notes,
        createdById: userId,
      },
    });

    res.status(201).json({ record });
  } catch (error) {
    next(error);
  }
};

export const updateRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount, type, category, date, notes } = req.body;

    const updateData: any = {};
    if (amount !== undefined) updateData.amount = amount;
    if (type !== undefined) updateData.type = type;
    if (category !== undefined) updateData.category = category;
    if (date !== undefined) updateData.date = new Date(date);
    if (notes !== undefined) updateData.notes = notes;

    const record = await prisma.record.update({
      where: { id },
      data: updateData,
    });

    res.json({ message: 'Record updated successfully', record });
  } catch (error) {
    next(error);
  }
};

export const deleteRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.record.delete({
      where: { id },
    });

    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    next(error);
  }
};
