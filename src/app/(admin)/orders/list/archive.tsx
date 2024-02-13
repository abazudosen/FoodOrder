import { FlatList, ActivityIndicator, Text } from "react-native";
import OrderListItem from "../../../../components/OrderListItem";
import { Stack } from "expo-router";
import { useAdminOrderList } from "@/api/orders";

export default function Orders() {
  const { data: orders, isLoading, error } = useAdminOrderList({archived: true});

  if (isLoading) {
    return <ActivityIndicator />;
  }
  if (error) {
    return <Text>Failed to fetch</Text>;
  }

  
  return (
    <>
      <Stack.Screen options={{ title: "Archive" }} />
      <FlatList
        data={orders}
        contentContainerStyle={{ gap: 10, padding: 10 }}
        renderItem={({ item }) => <OrderListItem order={item} />}
      />
    </>
  );
}
