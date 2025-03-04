import { extendTheme } from '@chakra-ui/theme-utils';

// Si el import anterior no funciona, prueba con este:
// import { extendTheme } from '@chakra-ui/theme';

export const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f6ff',
      100: '#bae3ff',
      500: '#3182ce',
      600: '#2a69ac',
      900: '#1a365d',
    },
  },
  fonts: {
    heading: 'var(--font-inter)',
    body: 'var(--font-inter)',
  },
});