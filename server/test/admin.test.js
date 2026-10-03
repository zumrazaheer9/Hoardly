import test from 'node:test';
import assert from 'node:assert/strict';
import { updateAdminOrderStatus } from '../src/controllers/admin.js';
import {
  createDiscountSchema,
  createProductSchema,
  orderStatusSchema,
} from '../src/validators/admin.js';

function makeOrderRequest(currentStatus, updateResult) {
  const calls = [];
  const req = {
    params: { id: '42' },
    body: { status: 'confirmed' },
    supabase: {
      from(table) {
        const query = { table, operation: 'select', filters: {}, calls };
        calls.push(query);
        query.select = () => query;
        query.update = (payload) => { query.operation = 'update'; query.payload = payload; return query; };
        query.eq = (field, value) => { query.filters[field] = value; return query; };
        query.single = async () => {
          if (query.operation === 'update') return updateResult;
          return { data: { id: 42, status: currentStatus }, error: null };
        };
        return query;
      },
    },
  };
  return { req, calls };
}

test('admin can advance an order through a permitted status transition', async () => {
  const order = { id: 42, status: 'confirmed' };
  const { req, calls } = makeOrderRequest('pending', { data: order, error: null });
  const response = { json(value) { this.body = value; } };
  let nextError;

  await updateAdminOrderStatus(req, response, (error) => { nextError = error; });

  assert.equal(nextError, undefined);
  assert.deepEqual(response.body, { order });
  const update = calls.find((call) => call.operation === 'update');
  assert.deepEqual(update.payload, { status: 'confirmed' });
  assert.equal(update.filters.status, 'pending');
});

test('admin cannot skip the order status sequence', async () => {
  const { req, calls } = makeOrderRequest('pending', { data: null, error: null });
  req.body.status = 'delivered';
  let nextError;

  await updateAdminOrderStatus(req, {}, (error) => { nextError = error; });

  assert.equal(nextError?.statusCode, 409);
  assert.equal(calls.some((call) => call.operation === 'update'), false);
});

test('admin gets a conflict if an order changes after it was loaded', async () => {
  const { req } = makeOrderRequest('pending', { data: null, error: { code: 'PGRST116' } });
  let nextError;

  await updateAdminOrderStatus(req, {}, (error) => { nextError = error; });

  assert.equal(nextError?.statusCode, 409);
});

test('product and discount schemas reject invalid administration inputs', () => {
  assert.equal(createProductSchema.safeParse({
    name: 'Test item',
    slug: 'test-item',
    description: 'A product description',
    price: 10,
    stock_quantity: 2,
    sku: 'TEST-1',
    category_id: 1,
  }).success, true);
  assert.equal(createProductSchema.safeParse({ name: 'Broken item', price: -1 }).success, false);
  assert.equal(createDiscountSchema.safeParse({ code: 'summer', type: 'percentage', value: 10 }).data.code, 'SUMMER');
  assert.equal(createDiscountSchema.safeParse({ code: 'SUMMER', type: 'percentage', value: 101 }).success, false);
  assert.equal(orderStatusSchema.safeParse({ status: 'delivered' }).success, true);
  assert.equal(orderStatusSchema.safeParse({ status: 'pending' }).success, false);
});