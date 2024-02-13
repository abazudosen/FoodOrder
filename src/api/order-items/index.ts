import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CartItem, InsertTables } from "./../../types";
import { supabase } from "@/app/lib/supabase";

export const useInsertOrderItems = () => {
  return useMutation({
    async mutationFn({
      items,
      order_id,
    }: {
      items: CartItem[];
      order_id: number;
    }) {
      const { error } = await supabase.from("order_items").insert(
        items.map((item) => ({
          size: item.size,
          quantity: item.quantity,
          order_id: order_id,
          product_id: item.product_id,
        }))
      );

      if (error) {
        throw error;
      }
    },
    onError(error) {
      console.log(error);
    },
  });
};
