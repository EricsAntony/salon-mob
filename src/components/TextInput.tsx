import React from 'react';
import { TextInput as PaperTextInput, TextInputProps } from 'react-native-paper';

const TextInput = React.memo((props: TextInputProps) => {
  return <PaperTextInput {...props} />;
});

export default TextInput;
