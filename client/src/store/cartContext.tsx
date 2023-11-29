'use client'
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface CartItem {
  _id: string;
  code: string;
  name: string;
  offerPercentage: number;
  sizes: {
    name: string;
    price: number;
  }
  pots:{
    potName: string;
    potPrice: number;
  },
  quantity: number;
  image:string;
  color: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeItem: (itemId: string, itemSize: string ,itemColor:string) => void;
  changeQuantity: (itemId: string, itemSize: string, newQuantity: number ,itemColor:string) => void;
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
        const clearCartTimeout = setTimeout(() => {
          setCart([]);
          localStorage.removeItem('cart');
        }, 14 * 24 * 60 * 60 * 1000);
        return () => clearTimeout(clearCartTimeout);
      }
  }, [cart]);

  const addToCart = (item: CartItem) => {
    const itemIndex = cart.findIndex((cartItem) => cartItem._id === item._id && cartItem.sizes.name === item.sizes.name && cartItem.color === item.color);

    if (itemIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[itemIndex].quantity += item.quantity;
      setCart(updatedCart);
    } else {
      setCart([...cart, item]);
    }
  };
  const removeItem = (itemId: string, itemSize: string,itemColor:string) => {
    const updatedCart = cart.filter(
      (cartItem) => !(cartItem._id === itemId && cartItem.sizes.name === itemSize && cartItem.color === itemColor)
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const changeQuantity = (itemId: string, itemSize: string, newQuantity: number, itemColor:string) => {
    
      const updatedCart = cart.map((cartItem) => {
        if (cartItem._id === itemId && cartItem.sizes.name === itemSize && cartItem.color === itemColor) {
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