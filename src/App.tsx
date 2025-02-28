import React from 'react';
import FormBuilder from './components/FormBuilder';
import { ChakraProvider, Box } from '@chakra-ui/react';

const App: React.FC = () => {
  return (
    <ChakraProvider>
      <Box maxWidth="800px" margin="0 auto" padding="1em">
        <FormBuilder />
      </Box>
    </ChakraProvider>
  );
};

export default App;