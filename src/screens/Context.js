import React, { useCallback } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import NavFooter from '../components/NavFooter';

// DB
import * as Schemas from '../realmSchemas/RealmServices';
// Notifications
import * as Notifications from '../events/Notification';

export default function ContextScreen({ navigation }) {

    const handleFooterPress = useCallback((data) => {
        navigation.navigate(data);
    }, [navigation]);

    const handleInfoBtn = useCallback((item) => {
        const info = Schemas.retrieveContext(item);
        Alert.alert('Info', info.json);
    }, []);

    const handleUserBtn = useCallback(() => {
        const info = Schemas.retrieveUser();
        Alert.alert('User', JSON.stringify(info));
    }, []);

    const handleNotification = useCallback(() => {
        Notifications.localScheduledTest();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.context}>
                <Button style={styles.btn} onPress={handleUserBtn}>
                    <Text>Facebook User</Text>
                </Button>

                <Button style={styles.btn} onPress={() => handleInfoBtn('LOCATION')}>
                    <Text>Location</Text>
                </Button>

                <Button style={styles.btn} isDisabled={true} onPress={() => handleInfoBtn('FBPosition')}>
                    <Text>Facebook Location</Text>
                </Button>

                <Button style={styles.btn} onPress={() => handleInfoBtn('WEATHER')}>
                    <Text>Weather</Text>
                </Button>

                <Button style={styles.btn} onPress={() => handleInfoBtn('CALENDARS')}>
                    <Text>Calendars</Text>
                </Button>

                <Button style={styles.btn} onPress={() => handleInfoBtn('EVENTS')}>
                    <Text>Events</Text>
                </Button>

                <Button style={styles.btn} onPress={handleNotification}>
                    <Text>Notification</Text>
                </Button>
            </View>

            <NavFooter navigation={navigation} tab="Context" />
        </View>
    );
}

const styles = StyleSheet.create({
    btn: {
        alignSelf: 'center',
        justifyContent: 'center',
        marginVertical: 5,
        width: 200,
    },
    container: {
        backgroundColor: '#fff',
        borderBottomColor: 'black',
        flex: 1,
    },
    context: {
        alignItems: 'center',
        flex: 1,
        gap: 10,
        justifyContent: 'center',
        marginBottom: '40%',
        marginTop: '30%',
    },
});
