import { View, Text, Platform, FlatList } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";

import { useCart } from "@/providers/CartProvider";
import CartListItem from "@/components/CartListItem";
import Button from "@/components/Button";

const Cart = () => {
  const { items, total, checkout } = useCart();

  return (
    <View>
      <FlatList
        data={items}
        contentContainerStyle={{ gap: 10, padding: 10 }}
        renderItem={({ item }) => <CartListItem cartItem={item} />}
      />

      <Text style={{ marginTop: 20, fontWeight: "500", fontSize: 18 }}>
        Total: ${total.toFixed(2)}
      </Text>
      <Button text="Checkout" onPress={checkout} />

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
};

export default Cart;
