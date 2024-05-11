import {ReactNode, useState} from 'react';
import {Text, TextInput, TextInputProps, View, ViewProps} from 'react-native';

interface IWaTextInput extends Partial<TextInputProps> {
  containerProps?: ViewProps;
  inputClassName?: string;
  endAdornment?: ReactNode;
}

export const WaTextInput: React.FC<IWaTextInput> = ({
  containerProps,
  className,
  inputClassName,
  endAdornment,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const borderStyle = isFocused ? 'border-teal-green-800' : 'border-[#1b242c]';

  return (
    <View
      {...containerProps}
      className={`flex-row items-center justify-between px-2 bg-background-950 rounded-xl min-w-[150px] ${borderStyle} border-2 ${
        containerProps?.className ?? className
      }`}>
      <TextInput
        className={`py-2 flex-1 ${inputClassName}`}
        placeholderTextColor="#145b54"
        {...props}
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
  );
};
