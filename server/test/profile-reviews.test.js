import test from 'node:test';
import assert from 'node:assert/strict';
import { createReview, getReviewEligibility } from '../src/controllers/products.js';
import { updatePasswordSchema, updateProfileSchema } from '../src/validators/users.js';

function makePurchaseRequest(purchases) {
  const tables = [];
  return {
    tables,
    req: {
      params: { id: '7' },
      body: { rating: 5, title: 'Good product', body: 'Works as described.' },
      user: { id: 'user-1', user_metadata: { full_name: 'Customer' } },
      supabase: {
        from(table) {
          tables.push(table);
          const query = {
            select() { return this; },
            eq() { return this; },
            limit: async () => ({ data: purchases, error: null }),
          };
          return query;
        },
      },
    },
  };
}

test('review eligibility is granted only when a delivered purchase exists', async () => {
  const { req } = makePurchaseRequest([{ id: 12 }]);
  const response = { json(value) { this.body = value; } };
  let nextError;

  await getReviewEligibility(req, response, (error) => { nextError = error; });

  assert.equal(nextError, undefined);
  assert.deepEqual(response.body, { eligible: true });
});

test('review submission is rejected when no delivered purchase exists', async () => {
  const { req, tables } = makePurchaseRequest([]);
  let nextError;

  await createReview(req, {}, (error) => { nextError = error; });

  assert.equal(nextError?.statusCode, 403);
  assert.deepEqual(tables, ['orders']);
});

test('review ratings must be whole numbers from 1 to 5', async () => {
  const { req, tables } = makePurchaseRequest([]);
  req.body.rating = 4.5;
  let nextError;

  await createReview(req, {}, (error) => { nextError = error; });

  assert.equal(nextError?.statusCode, 400);
  assert.deepEqual(tables, []);
});

test('profile updates cannot assign roles and password policy is enforced', () => {
  const profile = updateProfileSchema.parse({ full_name: 'Customer Name', email: 'customer@example.com', phone: '', role: 'admin' });
  assert.equal(profile.role, undefined);
  assert.equal(updatePasswordSchema.safeParse({ password: 'StrongPass1' }).success, true);
  assert.equal(updatePasswordSchema.safeParse({ password: 'weak' }).success, false);
});