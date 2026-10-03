import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { useAuth } from './AuthContext.jsx';
import { wishlistService } from '../services/wishlist.js';

const WishlistContext = createContext(null);

function wishlistReducer(state, action) {
  switch (action.type) {
    case 'loading': return { ...state, isLoading: action.value };
    case 'replace': return { ...state, items: action.items, error: null };
    case 'error': return { ...state, error: action.error };
    case 'reset': return { items: [], isLoading: false, error: null };
    default: return state;
  }
}

export function WishlistProvider({ children }) {
  const { isAuthenticated, isDemoAdmin } = useAuth();
  const [state, dispatch] = useReducer(wishlistReducer, { items: [], isLoading: false, error: null });

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated || isDemoAdmin) {
      dispatch({ type: 'reset' });
      return;
    }
    dispatch({ type: 'loading', value: true });
    try {
      const response = await wishlistService.getWishlist();
      dispatch({ type: 'replace', items: response.items || [] });
    } catch (error) {
      dispatch({ type: 'error', error: error.message });
    } finally {
      dispatch({ type: 'loading', value: false });
    }
  }, [isAuthenticated, isDemoAdmin]);

  useEffect(() => { refreshWishlist(); }, [refreshWishlist]);

  const toggleWishlist = useCallback(async (productId) => {
    const isSaved = state.items.some((item) => item.product_id === productId);
    try {
      const result = isSaved ? await wishlistService.removeItem(productId) : await wishlistService.addItem(productId);
      await refreshWishlist();
      return result;
    } catch (error) {
      dispatch({ type: 'error', error: error.message });
      throw error;
    }
  }, [refreshWishlist, state.items]);

  const value = useMemo(() => ({
    ...state,
    count: state.items.length,
    isSaved: (productId) => state.items.some((item) => item.product_id === productId),
    refreshWishlist,
    toggleWishlist,
  }), [state, refreshWishlist, toggleWishlist]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider.');
  return context;
}
