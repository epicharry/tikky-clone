import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export default function CreateScreen() {
  const router = useRouter();

  useEffect(() => {
    router.push('/record');
  }, [router]);

  return <View />;
}
