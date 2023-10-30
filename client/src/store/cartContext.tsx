'use client'
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface CartItem {
  _id: string;
  code: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeItem: (itemId: string, itemSize: string) => void;
  changeQuantity: (itemId: string, itemSize: string, newQuantity: number) => void;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCartItems = localStorage.getItem('cart')
    if (storedCartItems) {
      const data = JSON.parse(storedCartItems) as CartItem[];
      setCart(data);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
      if(cart.length > 0){
        localStorage.setItem('cart', JSON.stringify(cart));
      }
  }, [cart]);

  const addToCart = (item: CartItem) => {
    const itemIndex = cart.findIndex((cartItem) => cartItem._id === item._id && cartItem.size === item.size);

    if (itemIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[itemIndex].quantity += item.quantity;
      setCart(updatedCart);
    } else {
      setCart([...cart, item]);
    }
  };
  const removeItem = (itemId: string, itemSize: string) => {
    const updatedCart = cart.filter(
      (cartItem) => !(cartItem._id === itemId && cartItem.size === itemSize)
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const changeQuantity = (itemId: string, itemSize: string, newQuantity: number) => {
    
      const updatedCart = cart.map((cartItem) => {
        if (cartItem._id === itemId && cartItem.size === itemSize) {
          return { ...cartItem, quantity: newQuantity };
        }
        return cartItem;
      });
      setCart(updatedCart);
    }

  return (
    <CartContext.Provider value={{ cart, addToCart, setCart, removeItem,changeQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};