import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Icon} from '@/components/ui/icon';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Home, Star, Clock } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const NavFooter = ({ tab: initialTab}) => {
  const navigation = useNavigation();
  const [tab, setTab] = useState(null);
  console.log('Rendering NavFooter with tab:', tab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const onPressFooter = (target) => {
    const route = target === 'Default' ? 'Home' : target;
    navigation.navigate(route);
  };

  return (
    <SafeAreaView edges={['bottom']}>
      <Box style={[styles.footer, styles.footerBox]} position="relative" width="100%">
        <HStack justifyContent="space-around"  alignItems="center" style={styles.hstack}>
          <Pressable onPress={() => onPressFooter('Default')}>
            <Box alignItems="center" opacity={tab === 'Default' ? 1 : 0.5}>
              <Icon as={Home}   size="xl"   className="text-typography-white" />
            </Box>
          </Pressable>
          <Pressable onPress={() => onPressFooter('Saved')}>
            <Box alignItems="center" opacity={tab === 'Saved' ? 1 : 0.5}>
              <Icon as={Star}   size="xl"   className="text-typography-white" />
            </Box>
          </Pressable>
          <Pressable onPress={() => onPressFooter('Historic')}>
            <Box alignItems="center" opacity={tab === 'Historic' ? 1 : 0.5}>
              <Icon as={Clock}  size="xl"   className="text-typography-white" />
            </Box>
          </Pressable>
        </HStack>
      </Box>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: 'transparent',
  },
  footerBox: {
    height: 80,
  },
  hstack: {
    backgroundColor: '#1e90ff',
    flex: 1,
    paddingVertical: 8,
  },
});

export default React.memo(NavFooter);


