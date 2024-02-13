import ProductListItem from "@/components/ProductListItem";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useProductList } from "@/api/products";

export default function TabOneScreen() {
  const { data: products, isLoading, error } = useProductList();

  if (isLoading) {
    return <ActivityIndicator />;
  }
  if (error) {
    return <Text>Failed to fetch products</Text>;
  }

  return (
    <View>
      <FlatList
        data={products}
        numColumns={2}
        contentContainerStyle={{ gap: 10, padding: 10 }}
        columnWrapperStyle={{ gap: 10 }}
        renderItem={({ item }) => <ProductListItem product={item} />}
      />
    </View>
  );
}
