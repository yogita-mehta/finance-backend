import { requireRole } from '../src/middleware/auth.middleware';
import { Request, Response, NextFunction } from 'express';

describe('Role Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should return 401 if user is not present on req', () => {
    const middleware = requireRole(['ADMIN']);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 403 if user role is not allowed', () => {
    mockRequest = { user: { role: 'VIEWER' } } as any;
    const middleware = requireRole(['ADMIN']);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Forbidden: Insufficient permissions' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should call next if user role is allowed', () => {
    mockRequest = { user: { role: 'ADMIN' } } as any;
    const middleware = requireRole(['ADMIN', 'ANALYST']);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });
});
