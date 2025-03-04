'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn('email', {
        email,
        callbackUrl: '/admin',
        redirect: false,
      });

      toast({
        title: 'Correo enviado',
        description: 'Revisa tu bandeja de entrada para iniciar sesión',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ocurrió un error al enviar el correo',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="md" py={12}>
      <VStack spacing={8}>
        <Heading as="h1" size="xl">
          Iniciar sesión
        </Heading>
        <Box as="form" w="100%" onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Correo electrónico</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </FormControl>
            <Button
              colorScheme="blue"
              type="submit"
              w="100%"
              isLoading={isLoading}
            >
              Enviar enlace de acceso
            </Button>
          </VStack>
        </Box>
        <Text fontSize="sm" color="gray.500">
          Te enviaremos un enlace de inicio de sesión a tu correo electrónico
        </Text>
      </VStack>
    </Container>
  );
}