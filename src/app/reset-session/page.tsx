'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { Box, Container, Heading, Text, Spinner, VStack } from '@chakra-ui/react';

export default function ResetSessionPage() {
  useEffect(() => {
    // Cerrar sesión y redirigir a la página de inicio de sesión después de un breve retraso
    const timer = setTimeout(() => {
      signOut({ callbackUrl: '/login' });
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Container maxW="md" py={10}>
      <VStack spacing={6} align="center">
        <Heading as="h1" size="xl" textAlign="center">
          Reiniciando sesión
        </Heading>
        
        <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" />
        
        <Text textAlign="center">
          Tu sesión está siendo reiniciada para actualizar tus permisos...
        </Text>
        
        <Text fontSize="sm" color="gray.500" textAlign="center">
          Serás redirigido a la página de inicio de sesión en unos momentos.
        </Text>
      </VStack>
    </Container>
  );
}