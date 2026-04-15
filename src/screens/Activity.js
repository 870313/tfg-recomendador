import React, { useState, useLayoutEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import StarRating from 'react-native-star-rating-widget';

// UI
import NavFooter from "../components/NavFooter";
// DB
import * as Schemas from "../realmSchemas/RealmServices";
// Communication
import * as Communication from "../em/Fetch";
//P2P
import { isStopped, sendData, mapActivityForP2P} from "../p2p/communicationService";

const ActivityScreen = ({ navigation }) => {
  const { activity } = useRoute().params;
  const [rating, setRating] = useState(activity.rating || 0);

  // Header title
  useLayoutEffect(() => {
    navigation.setOptions({ title: activity?.title || "Actividad" });
  }, [navigation, activity]);

  const onStarRatingPress = useCallback(
    async (newRating) => {
      // 1. Guardar la valoración localmente
      Schemas.updateActivityRating(activity, newRating);
      setRating(newRating);
      Communication.fetchFeedback(activity);
  
      // 2. Enviar item
      try {
        const stopped = await isStopped();
        if (!stopped) {
          const message = mapActivityForP2P(activity);
          await sendData(JSON.stringify(message));
        }
      } catch (err) {
        console.warn("Error enviando datos P2P:", err);
      }
    },
    [activity]
  );
  

  const parseDate = useCallback((date) => {
    if (!(date instanceof Date)) return "";

    let min = date.getMinutes().toString().padStart(2, "0");
    let hh = date.getHours().toString().padStart(2, "0");
    let dd = date.getDate().toString().padStart(2, "0");
    let mm = (date.getMonth() + 1).toString().padStart(2, "0");
    let yy = date.getFullYear();

    if (min === "00" && hh === "00") {
      return `${dd}/${mm}/${yy}`;
    }
    return `${hh}:${min} ${dd}/${mm}/${yy}`;
  }, []);

  const onMap = useCallback(() => {
    navigation.navigate("Maps", { activity });
  }, [navigation, activity]);

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Imagen */}
        <View style={styles.imgView}>
          <Image style={styles.img} source={{ uri: activity?.img }} />
        </View>

        {/* Tipo + rating */}
        <View style={{ flexDirection: "row" }}>
          <View style={styles.type}>
            <Text style={styles.typeTxt}>#{activity?.type}</Text>
          </View>
          <View style={styles.rating}>
          <StarRating
            rating={rating}
            onChange={onStarRatingPress}
            starSize={24}
            color="gold"
            enableHalfStar={false}
            />
          </View>
        </View>

        {/* Descripción */}
        <Text style={styles.description_title}>Description:</Text>
        <Text style={styles.description}>{activity?.description}</Text>

        {/* Fechas */}
        {activity?.end < new Date(9999, 12, 31) && (
          <Text style={styles.description}>
            <Text style={styles.bold}>From: </Text>
            {parseDate(activity?.begin)}
            <Text style={styles.bold}> To: </Text>
            {parseDate(activity?.end)}
          </Text>
        )}
      </ScrollView>

      {/* Botón MAP */}
      {!(activity?.longitude === 0 && activity?.latitude === 0) && (
        <TouchableOpacity onPress={onMap} style={styles.mapButton}>
          <Text style={styles.mapText}>MAP</Text>
        </TouchableOpacity>
      )}

      <NavFooter navigation={navigation} tab="Activity" />
    </View>
  );
};

export default ActivityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imgView: {
    alignItems: "center",
    marginVertical: 16,
  },
  img: {
    width: "90%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 12,
  },
  type: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  typeTxt: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
  },
  rating: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 16,
  },
  description_title: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 16,
  },
  description: {
    fontSize: 14,
    color: "#555",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  bold: {
    fontWeight: "bold",
  },
  mapButton: {
    padding: 12,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  mapText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
});
