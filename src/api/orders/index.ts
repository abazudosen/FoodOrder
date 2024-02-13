import { InsertTables, Order, UpdateTables } from "./../../types";
import { supabase } from "@/app/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderStatus } from "@/types";
import { useAuth } from "@/providers/AuthProvider";

export const useAdminOrderList = ({
  archived = false,
}: {
  archived: boolean;
}) => {
  const statuses: OrderStatus[] = archived
    ? ["Delivered"]
    : ["New", "Cooking", "Delivering"];

  return useQuery({
    queryKey: ["orders", { archived }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .in("status", statuses)
        .order("created_at", { ascending: false });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useMyOrderList = () => {
  const { session } = useAuth();
  const id = session?.user?.id;

  return useQuery({
    queryKey: ["orders", { user_id: id }],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useInsertOrder = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const userId = session?.user.id;

  return useMutation({
    async mutationFn({ total }: Pick<Order, "total">) {
      if (!userId) return null;

      const { error, data } = await supabase
        .from("orders")
        .insert({
          total,
          user_id: userId,
        })
        .select();

      if (error) {
        throw error;
      }
      return data[0];
    },
    async onSuccess() {
      await queryClient.invalidateQueries(["orders"]);
    },
    onError(error) {
      console.log(error);
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn({
      id,
      updatedFields,
    }: {
      id: number;
      updatedFields: UpdateTables<"orders">;
    }) {
      const { data: updatedOrder, error } = await supabase
        .from("orders")
        .update(updatedFields)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return updatedOrder ;
    },
    async onSuccess(_, { id }) {
      await queryClient.invalidateQueries(["orders"]);
      await queryClient.invalidateQueries(["order", id]);
    },
    onError(error) {
      console.log(error);
    },
  });
};
