import { Alert, AlertButton } from 'react-native';

interface TwoButtonAlertOptions {
  title: string;
  message?: string;
  buttons: [
    { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' },
    { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }
  ];
}

export function createTwoButtonAlert({ title, message, buttons }: TwoButtonAlertOptions) {
  const alertButtons: AlertButton[] = buttons.map((btn) => ({
    text: btn.text,
    onPress: btn.onPress,
    style: btn.style,
  }));

  Alert.alert(title, message, alertButtons);
}
