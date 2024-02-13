import { CartItem, Tables } from "@/types";
import { PropsWithChildren, createContext, useContext, useState } from "react";
import { randomUUID } from "expo-crypto";
import { useInsertOrder } from "@/api/orders";
import { useRouter } from "expo-router";
import { useInsertOrderItems } from "@/api/order-items";

type Product = Tables<"products">;

type CartType = {
  items: CartItem[];
  addItem: (product: Product, size: CartItem["size"]) => void;
  updateQty: (itemId: string, amount: -1 | 1) => void;
  total: number;
  checkout: () => void;
};

export const CartContext = createContext<CartType>({
  items: [],
  addItem: () => {},
  updateQty: () => {},
  total: 0,
  checkout: () => {},
});

const CartProvider = ({ children }: PropsWithChildren) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const { mutate: insertOrder } = useInsertOrder();
  const { mutate: insertOrderItems } = useInsertOrderItems();
  const router = useRouter();

  const addItem = (product: Product, size: CartItem["size"]) => {
    // if item already in cart, increment qty
    const existingItem = items.find(
      (item) => item.product === product && item.size === size
    );
    if (existingItem) {
      updateQty(existingItem?.id, 1);
      return;
    }

    // console.log(product);
    const newCartItem: CartItem = {
      id: randomUUID(),
      product,
      product_id: product?.id,
      size,
      quantity: 1,
    };
    setItems([newCartItem, ...items]);
  };

  const updateQty = (itemId: string, amount: -1 | 1) => {
    // console.log(itemId, amount);
    const updatedItems = items
      ?.map((item) =>
        item.id !== itemId
          ? item
          : {
              ...item,
              quantity: item.quantity + amount,
            }
      )
      .filter((item) => item?.quantity > 0);
    setItems(updatedItems);
  };

  const total = items?.reduce(
    (sum, item) => (sum += item.product.price * item.quantity),
    0
  );

  const clearCart = () => {
    setItems([]);
  };

  const checkout = () => {
    insertOrder(
      { total },
      {
        onSuccess: saveOrderItems,
      }
    );
  };

  const saveOrderItems = (newOrder: { id: any }) => {
    if (!newOrder) return;

    insertOrderItems(
      {
        items,
        order_id: newOrder.id,
      },
      {
        onSuccess() {
          setItems([]);
          router.push(`/(user)/orders/${newOrder.id}`);
        },
      }
    );
  };

  return (
    <CartContext.Provider
      value={{ items, addItem, total, checkout, updateQty }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;

export const useCart = () => useContext(CartContext);
