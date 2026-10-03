import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { useAuth } from './AuthContext.jsx';
import { cartService } from '../services/cart.js';

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'loading': return { ...state, isLoading: action.value };
    case 'replace': return { ...state, items: action.items, error: null };
    case 'error': return { ...state, error: action.error };
    case 'reset': return { items: [], isLoading: false, error: null };
    default: return state;
  }
}

export function CartProvider({ children }) {
  const { isAuthenticated, isDemoAdmin } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, { items: [], isLoading: false, error: null });

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || isDemoAdmin) {
      dispatch({ type: 'reset' });
      return;
    }
    dispatch({ type: 'loading', value: true });
    try {
      const response = await cartService.getCart();
      dispatch({ type: 'replace', items: response.items || [] });
    } catch (error) {
      dispatch({ type: 'error', error: error.message });
    } finally {
      dispatch({ type: 'loading', value: false });
    }
  }, [isAuthenticated, isDemoAdmin]);

  useEffect(() => { refreshCart(); }, [refreshCart]);

  const runAction = useCallback(async (action) => {
    try {
      const result = await action();
      await refreshCart();
      return result;
    } catch (error) {
      dispatch({ type: 'error', error: error.message });
      throw error;
    }
  }, [refreshCart]);

  const value = useMemo(() => ({
    ...state,
    count: state.items.reduce((total, item) => total + item.quantity, 0),
    subtotal: state.items.reduce((total, item) => total + Number(item.products?.price || 0) * item.quantity, 0),
    refreshCart,
    addToCart: (productId, quantity) => runAction(() => cartService.addItem(productId, quantity)),
    updateQuantity: (itemId, quantity) => runAction(() => cartService.updateItem(itemId, quantity)),
    removeFromCart: (itemId) => runAction(() => cartService.removeItem(itemId)),
    clearCart: () => runAction(() => cartService.clearCart()),
  }), [state, refreshCart, runAction]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider.');
  return context;
}
