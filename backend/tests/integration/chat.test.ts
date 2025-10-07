import { describe, it, expect, beforeEach } from 'bun:test';
import request from 'supertest';
import server from '../../src/index';
import { generateToken } from '../helpers/test-utils';

describe('POST /api/chat/send-message', () => {
   // Happy path variables
   let token: string;
   let prompt: string;
   let previousResponseId: string | undefined;

   // Helper function to execute the request
   const exec = () => {
      const req = request(server)
         .post('/api/chat/send-message')
         .set('Authorization', `Bearer ${token}`);

      const body: any = { prompt };
      if (previousResponseId) {
         body.previousResponseId = previousResponseId;
      }

      return req.send(body);
   };

   // Set up default happy path values before each test
   beforeEach(() => {
      token = generateToken();
      prompt = 'Hello, how are you?';
      previousResponseId = undefined;
   });

   describe('Authentication', () => {
      it('should return 401 if Authorization header is missing', async () => {
         const res = await request(server)
            .post('/api/chat/send-message')
            .send({ prompt: 'test' });

         expect(res.status).toBe(401);
         expect(res.body.code).toBe('NO_TOKEN');
      });

      it('should return 401 if Authorization format is invalid (no Bearer)', async () => {
         const res = await request(server)
            .post('/api/chat/send-message')
            .set('Authorization', 'InvalidFormat')
            .send({ prompt: 'test' });

         expect(res.status).toBe(401);
         expect(res.body.code).toBe('INVALID_FORMAT');
      });

      it('should return 401 if token is empty', async () => {
         const res = await request(server)
            .post('/api/chat/send-message')
            .set('Authorization', 'Bearer ')
            .send({ prompt: 'test' });

         expect(res.status).toBe(401);
         expect(res.body.code).toBe('INVALID_FORMAT');
      });

      it('should return 403 if token is invalid', async () => {
         token = 'invalid-token';

         const res = await exec();

         expect(res.status).toBe(403);
         expect(res.body.code).toBe('INVALID_TOKEN');
      });
   });

   describe('Input Validation', () => {
      it('should return 400 if prompt is not provided', async () => {
         prompt = '';

         const res = await exec();

         expect(res.status).toBe(400);
      });

      it('should return 400 if prompt is only whitespace', async () => {
         prompt = '   ';

         const res = await exec();

         expect(res.status).toBe(400);
      });

      // it('should accept valid previousResponseId', async () => {
      //    previousResponseId = '123e4567-e89b-12d3-a456-426614174000';

      //    const res = await exec();

      //    expect(res.status).toBe(200);
      //    expect(res.headers['content-type']).toBe('text/event-stream');
      // }, 30000); // Extended timeout for LLM call
   });

   // describe('SSE Stream Response', () => {
   //    it('should return 200 with SSE headers for valid request', async () => {
   //       const res = await exec();

   //       expect(res.status).toBe(200);
   //       expect(res.headers['content-type']).toBe('text/event-stream');
   //       expect(res.headers['cache-control']).toBe('no-cache');
   //       expect(res.headers['connection']).toBe('keep-alive');
   //    }, 30000); // Extended timeout for LLM call

   //    it('should stream chunks and end with done event', async () => {
   //       const res = await exec();

   //       expect(res.status).toBe(200);
   //       expect(res.text).toContain('data:');

   //       // Parse SSE events from response
   //       const lines = res.text.split('\n');
   //       const events = lines
   //          .filter((line) => line.trim().startsWith('data:'))
   //          .map((line) => {
   //             const jsonStr = line.replace('data:', '').trim();
   //             try {
   //                return JSON.parse(jsonStr);
   //             } catch {
   //                return null;
   //             }
   //          })
   //          .filter(Boolean);

   //       // Should have at least one chunk event
   //       const hasChunks = events.some((e) => e.chunk);
   //       expect(hasChunks).toBe(true);

   //       // Should end with done event
   //       const doneEvents = events.filter((e) => e.done);
   //       expect(doneEvents.length).toBeGreaterThan(0);

   //       const lastDoneEvent = doneEvents[doneEvents.length - 1];
   //       expect(lastDoneEvent).toHaveProperty('done', true);
   //       expect(lastDoneEvent).toHaveProperty('responseId');
   //    }, 30000); // Extended timeout for LLM call

   //    it('should support continuous conversation with previousResponseId', async () => {
   //       // First message
   //       const res1 = await exec();
   //       expect(res1.status).toBe(200);

   //       // Extract responseId from first response
   //       const lines1 = res1.text.split('\n');
   //       const events1 = lines1
   //          .filter((line) => line.trim().startsWith('data:'))
   //          .map((line) => {
   //             try {
   //                return JSON.parse(line.replace('data:', '').trim());
   //             } catch {
   //                return null;
   //             }
   //          })
   //          .filter(Boolean);

   //       const doneEvents1 = events1.filter((e) => e.done);
   //       expect(doneEvents1.length).toBeGreaterThan(0);

   //       // Second message with previousResponseId
   //       previousResponseId = doneEvents1[0]!.responseId;
   //       prompt = 'Tell me more about that';

   //       const res2 = await exec();
   //       expect(res2.status).toBe(200);
   //       expect(res2.headers['content-type']).toBe('text/event-stream');

   //       // Should also have chunks and done event
   //       const lines2 = res2.text.split('\n');
   //       const events2 = lines2
   //          .filter((line) => line.trim().startsWith('data:'))
   //          .map((line) => {
   //             try {
   //                return JSON.parse(line.replace('data:', '').trim());
   //             } catch {
   //                return null;
   //             }
   //          })
   //          .filter(Boolean);

   //       const hasChunks2 = events2.some((e) => e.chunk);
   //       const doneEvents2 = events2.filter((e) => e.done);

   //       expect(hasChunks2).toBe(true);
   //       expect(doneEvents2.length).toBeGreaterThan(0);
   //    }, 60000); // Extended timeout for two LLM calls
   // });
});
