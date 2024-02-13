import { View, Text, Image, StyleSheet, TextInput, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";

import Button from "@/components/Button";
import { defaultPizzaImage } from "@/components/ProductListItem";
import Colors from "@/constants/Colors";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  useDeleteProduct,
  useInsertProduct,
  useProduct,
  useUpdateProduct,
} from "@/api/products";
import * as FileSystem from "expo-file-system";
import { randomUUID } from "expo-crypto";
import { supabase } from "@/app/lib/supabase";
import { decode } from "base64-arraybuffer";
import RemoteImage from "@/components/RemoteImage";

const CreateProduct = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [errors, setErrors] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const router = useRouter();

  const { id: idString } = useLocalSearchParams();
  let id;

  if (typeof idString === "string") {
    id = parseFloat(idString);
  } else if (Array.isArray(idString) && idString.length > 0) {
    id = parseFloat(idString[0]);
  } else {
    // Handle the case where idString is undefined or an empty array
    // For example, set id to some default value or throw an error
    id = 0; // Default value
  }
  const isUpdating = !!id;

  const { data: updatedProduct, isLoading } = useProduct(id);
  const { mutate: deleteProduct } = useDeleteProduct();
  const { mutate: insertProduct } = useInsertProduct();
  const { mutate: updateProduct } = useUpdateProduct();

  useEffect(() => {
    if (updatedProduct) {
      setName(updatedProduct?.name);
      setPrice(updatedProduct?.price.toString());
      setImage(updatedProduct?.image);
    }
  }, [updatedProduct]);

  const resetFields = () => {
    setName("");
    setPrice("");
  };

  const validateInput = () => {
    setErrors("");
    if (!name) {
      setErrors("Name is required");
      return false;
    }
    if (!price) {
      setErrors("Price is required");
      return false;
    }
    if (isNaN(parseFloat(price))) {
      setErrors("Price should be a number");
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    // console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const onCreate = async () => {
    if (!validateInput) {
      return;
    }
    const imagePath = await uploadImage();
    // const newProduct: Omit<Product, "id"> = { name, price: parseFloat(price) };
    // if (imagePath) {
    //   newProduct.image = imagePath;
    // }

    insertProduct(
      { name, price: parseFloat(price), image: imagePath },
      {
        onSuccess: () => {
          resetFields();
          router.back();
        },
      }
    );
  };

  const onUpdateCreate = async () => {
    if (!validateInput) {
      return;
    }
    const imagePath = await uploadImage();
    updateProduct(
      {
        id,
        name,
        price: parseFloat(price),
        image: imagePath,
        created_at: "",
      },
      {
        onSuccess: () => {
          resetFields();
          router.back();
        },
      }
    );
  };

  const onSubmit = () => {
    if (isUpdating) {
      onUpdateCreate();
    } else {
      onCreate();
    }
  };

  const onDelete = () => {
    deleteProduct(id, {
      onSuccess: () => {
        resetFields();
        router.replace("/(admin)");
      },
    });
  };

  const confirmDelete = () => {
    Alert.alert("Confirm", "Are you sure you want to delete this product", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Yes",
        style: "destructive",
        onPress: onDelete,
      },
    ]);
  };

  const uploadImage = async () => {
    if (!image?.startsWith("file://")) {
      return;
    }

    const base64 = await FileSystem.readAsStringAsync(image, {
      encoding: "base64",
    });
    const filePath = `${randomUUID()}.png`;
    const contentType = "image/png";
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(filePath, decode(base64), { contentType });

    if (data) {
      return data.path;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ title: isUpdating ? "Update Product" : "Create Product" }}
      />
      <Image
        source={{ uri: image || defaultPizzaImage }}
        style={styles.image}
      />
      <Text style={styles.textBtn} onPress={pickImage}>
        Select Image
      </Text>

      <Text style={styles.input}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name"
        style={styles.input}
      />

      <Text style={styles.input}>Price ($)</Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        placeholder="9.99"
        style={styles.input}
        keyboardType="numeric"
      />

      <Text style={{ color: "red" }}>{errors}</Text>
      <Button onPress={onSubmit} text={isUpdating ? "Update" : "Create"} />
      {isUpdating && (
        <Text style={styles.textBtn} onPress={confirmDelete}>
          Delete
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 10,
  },
  input: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 5,
  },
  label: {
    color: "gray",
    fontSize: 16,
  },
  image: {
    width: "50%",
    aspectRatio: 1,
    alignSelf: "center",
  },
  textBtn: {
    marginVertical: 10,
    color: Colors.light.tint,
    fontWeight: "bold",
    alignSelf: "center",
  },
});

export default CreateProduct;
