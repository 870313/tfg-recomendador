import React, { useEffect, useState } from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Divider } from '@/components/ui/divider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import {
  Home,
  User,
  Settings,
  MapPin,
  Sparkles,
} from 'lucide-react-native';
import * as Schemas from '../realmSchemas/RealmServices';

const iconMap = {
  Home,
  Profile: User,
  Settings,
  POIs: MapPin,
  Recommendations: Sparkles,
};

const options = [
  { key: 'Home' },
  { key: 'POIs' },
  { key: 'Recommendations' },
  { key: 'Profile' },
  { key: 'Settings' },
  { key: 'Recommendation triggering rules' },
  { key: 'Recommendation exclusions and priorities' },
  { key: 'Context rules' },
];

export default function CustomDrawer(props) {
  const { navigation, state } = props;

  // Kept as state so the drawer re-renders if login state ever changes at
  // runtime; the current boot flow (Loading.js) always leaves a user in Realm
  // by the time this drawer is first shown, so the fallback branch below
  // should not be reached in normal use.
  const [isLogin, setIsLogin] = useState(false);

  const currentScreen = state?.routeNames?.[state.index] || '';

  useEffect(() => {
    const user = Schemas.retrieveUser();
    if (user != null) {setIsLogin(true);}
  }, []);

  const oPressSection = (key) => {
    const routeName = key.includes(' ') ? key.replace(/ /g, '_') : key;
    navigation.navigate('Main', { screen: routeName });
  };

  // The drawer always exposes the full navigation set. Previously, an
  // "isLogin" gate hid every option behind a residual "You must be logged in"
  // placeholder inherited from the original R-Rules prototype, which no
  // longer fits the unified app and confused users on iOS during startup
  // races (drawer opened before the local user record was fully written).
  const visibleOptions = options;

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']}>
    <Box style={[styles.footer, styles.footerBox]} position="relative" >
    <VStack space="xl" reversed={false}>
      {visibleOptions.map((item) => {
        const selected = item.key === currentScreen;
        const IconComponent = iconMap[item.key];

        return (
          <Pressable
            key={item.key}
            onPress={() => oPressSection(item.key)}
            borderRadius="$lg"
            bg={selected ? '$primary100' : 'transparent'}
            px="$3"
            py="$2"
            my="$1"
          >

            <HStack alignItems="center" space="md">
              {IconComponent && (
                <Icon
                  as={IconComponent}
                  size="xl"
                  className={selected ? 'text-primary-600' : 'text-coolGray-500'}
                />
              )}
              <Text
                size="2xl"
                fontWeight={selected ? 'bold' : 'normal'}
                className={selected ? 'text-primary-700' : 'text-coolGray-800'}
              >
                {item.key}
              </Text>
            </HStack>
            <Divider className="my-0.5" />

          </Pressable>
        );

      })}
      </VStack>
    </Box>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: 'transparent',
  },
  footerBox: {
    height: 80,
  },
});
