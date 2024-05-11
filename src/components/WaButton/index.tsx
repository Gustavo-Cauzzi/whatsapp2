import React, {PropsWithChildren, ReactNode} from 'react';
import {
  Text,
  TextStyle,
  TouchableNativeFeedback,
  View,
  ViewStyle,
} from 'react-native';

type INlButtonVariants = 'text' | 'outlined' | 'contained';
type INlButtonSizes = 'small' | 'medium' | 'large';
type INlButtonColors = 'primary' | 'secondary';

interface INlButtonProps {
  variant?: INlButtonVariants;
  size?: INlButtonSizes;
  color?: INlButtonColors;

  text?: string;
  className?: string;

  startAdornment?: ReactNode;
  endAdornment?: ReactNode;

  disabled?: boolean;
  onPress?: () => any;
}

const sizesMultipliers: Record<INlButtonSizes, number> = {
  small: -0.25,
  medium: 0,
  large: 0.25,
};

type IButtonColorDescription = {main: string; text: string};

const getColorVariants = (
  companyColor: string,
): Record<
  INlButtonColors | 'disabled',
  Record<'DEFAULT', IButtonColorDescription> &
    Partial<Record<INlButtonVariants, IButtonColorDescription | undefined>>
> => ({
  primary: {
    DEFAULT: {
      main: companyColor,
      text: companyColor,
    },
    contained: {
      main: companyColor,
      text: '#FFF',
    },
  },
  secondary: {
    DEFAULT: {
      main: '#202020',
      text: '#202020',
    },
    contained: {
      main: '#D3D4EB',
      text: '#202020',
    },
  },
  disabled: {
    DEFAULT: {
      main: '#0e3d3b',
      text: '#4b5050',
    },
    outlined: {
      main: '#154c47',
      text: '#154c47',
    },
    text: {
      main: '#154c47',
      text: '#154c47',
    },
  },
});

export const WaButton: React.FC<PropsWithChildren<INlButtonProps>> = ({
  children,
  variant = 'text',
  size = 'medium',
  color: colorVariant = 'primary',
  text,
  className = '',
  startAdornment,
  endAdornment,
  disabled = false,
  onPress = () => {},
}) => {
  const sizeMultiplier = sizesMultipliers[size];
  const sizeable = (size: number, decreaseMultiplier = 1) =>
    size * (1 + sizeMultiplier * decreaseMultiplier);

  const brandColor = '#128C7E';

  const colorVariantsMap = getColorVariants(brandColor);
  const actualColorVariant = disabled ? 'disabled' : colorVariant;
  const colors =
    colorVariantsMap[actualColorVariant][variant] ??
    colorVariantsMap[actualColorVariant].DEFAULT;

  const variantContainerStyle: Record<INlButtonVariants, ViewStyle> = {
    text: {},
    contained: {
      backgroundColor: colors.main,
    },
    outlined: {
      borderColor: colors.main,
      borderWidth: 1,
      paddingVertical: sizeable(3),
    },
  };

  const variantTextStyle: Record<INlButtonVariants, TextStyle> = {
    text: {},
    contained: {
      fontWeight: 'bold',
    },
    outlined: {},
  };

  return (
    <View className={`rounded-xl overflow-hidden ${className}`}>
      <TouchableNativeFeedback disabled={disabled} onPress={onPress}>
        <View
          className={`px-2 flex-row items-center justify-center rounded-xl`}
          style={{
            paddingVertical: sizeable(4),
            paddingHorizontal: sizeable(6),
            ...variantContainerStyle[variant],
          }}>
          {startAdornment ?? <></>}
          {children || (
            <Text
              style={{
                fontSize: sizeable(16, 0.7),
                marginHorizontal: sizeable(2),
                color: colors.text,
                ...variantTextStyle[variant],
              }}>
              {text}
            </Text>
          )}
          {endAdornment ?? <></>}
        </View>
      </TouchableNativeFeedback>
    </View>
  );
};
