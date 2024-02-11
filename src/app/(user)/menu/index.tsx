import { View } from "../../../components/Themed";
import products from "@assets/data/products";
import ProductListItem from "@/components/ProductListItem";
import { FlatList } from "react-native";

export default function TabOneScreen() {
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
