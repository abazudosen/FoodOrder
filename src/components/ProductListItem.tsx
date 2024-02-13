import { StyleSheet, TouchableOpacity } from "react-native";
import { Link, useSegments } from "expo-router";

import { Text, View } from "../components/Themed";
import Colors from "@/constants/Colors";
import { Tables } from "@/database.types";
import RemoteImage from "./RemoteImage";

type ProductListItemProps = {
  product: Tables<"products">;
};

export const defaultPizzaImage =
  "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/default.png";

const ProductListItem = ({ product }: ProductListItemProps) => {
  const segments = useSegments();

  return (
    <Link href={`/${segments[0]}/menu/${product.id}`} asChild>
      <TouchableOpacity style={styles.container}>
        <RemoteImage
          path={product.image}
          fallback={defaultPizzaImage}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      </TouchableOpacity>
    </Link>
  );
};

export default ProductListItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 20,
    maxWidth: "50%",
  },
  title: {
    fontSize: 18,
    marginVertical: 10,
    fontWeight: "600",
  },
  price: {
    fontWeight: "bold",
    color: Colors.light.tint,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
  },
});
