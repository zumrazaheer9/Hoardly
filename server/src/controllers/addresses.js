import { createError } from '../middleware/errorHandler.js';

const requiredFields = ['full_name', 'phone', 'address_line1', 'city', 'state', 'postal_code', 'country'];
function addressPayload(input) {
  const payload = {};
  for (const field of [...requiredFields, 'address_line2', 'label']) payload[field] = String(input[field] || '').trim() || null;
  for (const field of requiredFields) if (!payload[field]) throw createError(400, `${field.replaceAll('_', ' ')} is required. Please complete the address and try again.`);
  payload.label = payload.label || 'home';
  if (!['home', 'work', 'other'].includes(payload.label)) throw createError(400, 'Choose home, work, or other for the address label.');
  payload.is_default = Boolean(input.is_default);
  return payload;
}

export async function getAddresses(req, res, next) { try { const { data, error } = await req.supabase.from('addresses').select('*').eq('user_id', req.user.id).order('is_default', { ascending: false }); if (error) throw error; res.json({ addresses: data || [] }); } catch (error) { next(error); } }
export async function createAddress(req, res, next) {
  try {
    const payload = addressPayload(req.body);
    const makeDefault = payload.is_default;
    delete payload.is_default;
    const { data, error } = await req.supabase.from('addresses').insert({ user_id: req.user.id, ...payload, is_default: false }).select().single();
    if (error) throw error;
    if (makeDefault) {
      const { data: defaultAddress, error: defaultError } = await req.supabase.rpc('set_default_address', { p_address_id: data.id });
      if (defaultError) throw defaultError;
      return res.status(201).json({ address: defaultAddress });
    }
    res.status(201).json({ address: data });
  } catch (error) { next(error); }
}
export async function updateAddress(req, res, next) {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) throw createError(400, 'Address could not be identified.');
    const payload = addressPayload(req.body);
    const makeDefault = payload.is_default;
    delete payload.is_default;
    const { data, error } = await req.supabase.from('addresses').update(payload).eq('id', id).eq('user_id', req.user.id).select().single();
    if (error || !data) throw createError(404, 'Address not found.');
    if (makeDefault) {
      const { data: defaultAddress, error: defaultError } = await req.supabase.rpc('set_default_address', { p_address_id: id });
      if (defaultError) throw defaultError;
      return res.json({ address: defaultAddress });
    }
    const { data: updated, error: updateError } = await req.supabase.from('addresses').update({ is_default: false }).eq('id', id).eq('user_id', req.user.id).select().single();
    if (updateError) throw updateError;
    res.json({ address: updated });
  } catch (error) { next(error); }
}
export async function setDefaultAddress(req, res, next) {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) throw createError(400, 'Address could not be identified.');
    const { data, error } = await req.supabase.rpc('set_default_address', { p_address_id: id });
    if (error?.code === 'P0002') throw createError(404, 'Address not found.');
    if (error) throw error;
    res.json({ address: data });
  } catch (error) { next(error); }
}
export async function deleteAddress(req, res, next) { try { const id = Number.parseInt(req.params.id, 10); if (!Number.isInteger(id)) throw createError(400, 'Address could not be identified.'); const { error } = await req.supabase.from('addresses').delete().eq('id', id).eq('user_id', req.user.id); if (error) throw error; res.json({ message: 'Address deleted.' }); } catch (error) { next(error); } }
