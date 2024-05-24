import {ReactNode, useState} from 'react';
import {Text, TextInput, TextInputProps, View, ViewProps} from 'react-native';

interface IWaTextInput extends Partial<TextInputProps> {
  containerProps?: ViewProps;
  inputClassName?: string;
  endAdornment?: ReactNode;
  error?: boolean;
  helperText?: string;
}

export const WaTextInput: React.FC<IWaTextInput> = ({
  containerProps,
  className,
  inputClassName,
  endAdornment,
  error,
  helperText,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const normalBorderColor = isFocused
    ? 'border-teal-green-800'
    : 'border-[#1b242c]';
  const actualBorderColor = error ? 'border-red-800' : normalBorderColor;

  return (
    <View>
      <View
        {...containerProps}
        className={`flex-row items-center justify-between px-2 bg-background-950 rounded-xl min-w-[150px] ${actualBorderColor} border-2 ${
          containerProps?.className ?? className
        }`}>
        <TextInput
          className={`py-2 flex-1 ${inputClassName}`}
          {...props}
          placeholderTextColor={
            error ? '#991b1b' : props.placeholderTextColor ?? '#456158'
          }
          onFocus={e => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={e => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />
        {endAdornment}
      </View>
      {helperText && (
        <View className="px-2">
          <Text className={error ? `text-red-700` : ''}>{helperText}</Text>
        </View>
      )}
    </View>
  );
};
