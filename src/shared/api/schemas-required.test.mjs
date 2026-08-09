import assert from 'node:assert/strict';
import test from 'node:test';
import { z } from 'zod';

const schemasPromise = import('./schemas.ts').catch(() => ({}));

test('returns schema-valid required API responses', async () => {
  const schemas = await schemasPromise;
  const responseSchema = z.object({ accessToken: z.string().min(1) });

  assert.equal(typeof schemas.parseRequiredWithSchema, 'function');
  assert.deepEqual(
    schemas.parseRequiredWithSchema?.(responseSchema, { accessToken: 'token' }),
    { accessToken: 'token' },
  );
});

test('throws when a required API response does not match its schema', async () => {
  const schemas = await schemasPromise;
  const responseSchema = z.object({ accessToken: z.string().min(1) });

  assert.equal(typeof schemas.parseRequiredWithSchema, 'function');
  assert.throws(
    () => schemas.parseRequiredWithSchema?.(responseSchema, { accessToken: '' }),
    z.ZodError,
  );
});
