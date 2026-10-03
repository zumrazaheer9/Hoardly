import { updateAuthenticatedUser } from '../services/auth.js';

export async function getProfile(req, res, next) {
  try {
    const { data, error } = await req.supabase
      .from('users')
      .select('id, email, full_name, phone, role, created_at')
      .eq('id', req.user.id)
      .single();
    if (error) throw error;
    res.json({ profile: data });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { full_name, email, phone } = req.body;
    const authUpdates = {};
    const emailChangeRequested = email.toLowerCase() !== req.user.email.toLowerCase();
    if (emailChangeRequested) authUpdates.email = email;

    if (Object.keys(authUpdates).length) {
      await updateAuthenticatedUser(req.authToken, authUpdates);
    }

    const { data, error } = await req.supabase
      .from('users')
      .update({ full_name, phone: phone || null })
      .eq('id', req.user.id)
      .select('id, email, full_name, phone, role, created_at')
      .single();
    if (error) throw error;

    res.json({
      profile: data,
      emailChangeRequested,
      message: emailChangeRequested
        ? 'Profile saved. Confirm the link sent to your new email address to finish changing it.'
        : 'Profile saved.',
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePassword(req, res, next) {
  try {
    await updateAuthenticatedUser(req.authToken, { password: req.body.password });
    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
}
