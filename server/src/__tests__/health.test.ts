import request from 'supertest';
import App from '../app';

describe('health endpoints', () => {
  const app = new App().app;

  it('GET /health returns success', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body?.success).toBe(true);
  });

  it('GET /api/status returns uploads status', async () => {
    const response = await request(app).get('/api/status');
    expect(response.status).toBe(200);
    expect(response.body?.success).toBe(true);
    expect(response.body?.data?.uploads?.enabled).toBe(true);
  });
});
