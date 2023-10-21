import React, { useMemo } from "react";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
/**
 * ? Local Imports
 */
import createStyles from "./HomeScreen.style";
import CardItem from "./components/card-item/CardItem";
import MockData from "./mock/MockData";
/**
 * ? Shared Imports
 */
import FormImage from "@shared-components/atom/FormImage";

interface HomeScreenProps {}

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const styles = useMemo(() => createStyles(), []);

  const handleItemPress = () => {
    // NavigationService.push(Rouites.Detail);
  };

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */

  const Header = () => (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 16,
      }}
    >
      <FormImage
        source={require("../../assets/images/demo.png")}
        width={200}
        height={25}
      />
      <FormImage
        source={require("../../assets/images/powered_by.png")}
        width={150}
        height={20}
      />
    </View>
  );

  const List = () => (
    <View style={styles.listContainer}>
      <FlatList
        data={MockData}
        renderItem={({ item }) => (
          <CardItem data={item} onPress={handleItemPress} />
        )}
      />
    </View>
  );

  const Content = () => (
    <View style={styles.contentContainer}>
      <List />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <Content />
    </SafeAreaView>
  );
};

export default HomeScreen;
