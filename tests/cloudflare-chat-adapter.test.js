/**
 * Automated Test Suite for Cloudflare Pages Function Adapter:
 * functions/api/chat.js
 *
 * Verifies that the Web Standards-based Cloudflare Pages Function correctly
 * handles requests, parses headers and client IP, passes environment variables,
 * protects against uncaught exceptions with HTTP 500 JSON, and enforces payload limits.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  createCloudflarePagesChatHandler,
  onRequest,
  onRequestPost,
} from '../functions/api/chat.js';

describe('Cloudflare Pages Function Adapter (functions/api/chat.js)', () => {
  it('returns 405 Method Not Allowed when method is not POST', async () => {
    const handler = createCloudflarePagesChatHandler();
    const mockRequest = new Request('https://www.ighifari.my.id/api/chat', {
      method: 'GET',
    });

    const response = await handler({
      request: mockRequest,
      env: {},
    });

    assert.equal(response.status, 405);
    assert.equal(response.headers.get('Allow'), 'POST');
    const body = await response.json();
    assert.equal(body.ok, false);
    assert.equal(body.error.code, 'METHOD_NOT_ALLOWED');
  });

  it('passes context.env and client IP (cf-connecting-ip) to chat handler', async () => {
    let capturedReq = null;
    let capturedEnv = null;

    const mockChatHandlerFactory = ({ env }) => {
      capturedEnv = env;
      return async (req, res) => {
        capturedReq = req;
        res.setHeader('X-Custom-Header', 'test-value');
        res.status(200).json({
          ok: true,
          data: {
            answer: 'Mocked answer for testing',
            sources: ['test-source'],
          },
        });
      };
    };

    const handler = createCloudflarePagesChatHandler({
      chatHandlerFactory: mockChatHandlerFactory,
    });

    const mockRequest = new Request('https://www.ighifari.my.id/api/chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'cf-connecting-ip': '198.51.100.42',
      },
      body: JSON.stringify({ message: 'Halo Ghifari' }),
    });

    const testEnv = {
      GEMINI_API_KEY: 'test-key',
      GEMINI_MODEL: 'gemini-3.5-flash-lite',
    };

    const response = await handler({
      request: mockRequest,
      env: testEnv,
    });

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Content-Type'), 'application/json; charset=utf-8');
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.equal(response.headers.get('X-Custom-Header'), 'test-value');

    const json = await response.json();
    assert.equal(json.ok, true);
    assert.equal(json.data.answer, 'Mocked answer for testing');

    // Verify injected request and env
    assert.equal(capturedEnv.GEMINI_API_KEY, 'test-key');
    assert.equal(capturedReq.headers['x-forwarded-for'], '198.51.100.42');
    assert.equal(capturedReq.headers.get('cf-connecting-ip'), '198.51.100.42');
  });

  it('handles empty body or invalid JSON cleanly', async () => {
    const handler = createCloudflarePagesChatHandler();
    const mockRequest = new Request('https://www.ighifari.my.id/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'invalid-json{{{',
    });

    const response = await handler({
      request: mockRequest,
      env: {},
    });

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.ok, false);
    assert.equal(body.error.code, 'INVALID_JSON');
  });

  it('enforces 16KB payload limit using Web Standards TextEncoder and returns 413', async () => {
    const handler = createCloudflarePagesChatHandler();
    const largeMessage = 'A'.repeat(17_000);
    const mockRequest = new Request('https://www.ighifari.my.id/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: largeMessage }),
    });

    const response = await handler({
      request: mockRequest,
      env: {},
    });

    assert.equal(response.status, 413);
    assert.equal(response.headers.get('Content-Type'), 'application/json; charset=utf-8');
    const body = await response.json();
    assert.equal(body.ok, false);
    assert.equal(body.error.code, 'PAYLOAD_TOO_LARGE');
  });

  it('catches uncaught exceptions from chat handler and returns structured 500 JSON', async () => {
    const throwingFactory = () => {
      return async () => {
        throw new Error('Simulated unexpected crash inside handler');
      };
    };

    const handler = createCloudflarePagesChatHandler({
      chatHandlerFactory: throwingFactory,
    });

    const mockRequest = new Request('https://www.ighifari.my.id/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: 'test' }),
    });

    const response = await handler({
      request: mockRequest,
      env: {},
    });

    assert.equal(response.status, 500);
    assert.equal(response.headers.get('Content-Type'), 'application/json; charset=utf-8');
    assert.equal(response.headers.get('Cache-Control'), 'no-store');

    const body = await response.json();
    assert.equal(body.ok, false);
    assert.equal(body.error.code, 'INTERNAL_SERVER_ERROR');
    assert.ok(body.error.message);
  });

  it('exports valid onRequest and onRequestPost functions', () => {
    assert.equal(typeof onRequest, 'function');
    assert.equal(typeof onRequestPost, 'function');
  });
});
