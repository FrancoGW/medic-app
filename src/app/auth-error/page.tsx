'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  
  let errorMessage = 'Ha ocurrido un error durante la autenticación.';
  let errorDescription = 'Por favor, intenta nuevamente o contacta al administrador.';
  
  if (error === 'AccessDenied') {
    errorMessage = 'Acceso denegado';
    errorDescription = 'Tu correo electrónico no ha sido autorizado para acceder a esta aplicación. Si crees que esto es un error, por favor contacta al administrador.';
  } else if (error === 'Verification') {
    errorMessage = 'Error de verificación';
    errorDescription = 'No se pudo verificar tu correo electrónico. Por favor, asegúrate de usar el enlace enviado a tu correo.';
  } else if (error === 'Configuration') {
    errorMessage = 'Error de configuración';
    errorDescription = 'Hay un problema con la configuración del sistema de autenticación. Por favor, contacta al administrador.';
  }
  
  return (
    <Box minH="100vh" bg={bgColor} py={10}>
      <Container maxW="lg">
        <VStack
          spacing={8}
          p={8}
          bg={cardBgColor}
          boxShadow="lg"
          borderRadius="lg"
          align="center"
        >
          <Icon as={FaExclamationTriangle} w={16} h={16} color="red.500" />
          
          <Heading size="xl" textAlign="center" color="red.500">
            {errorMessage}
          </Heading>
          
          <Text fontSize="lg" textAlign="center">
            {errorDescription}
          </Text>
          
          <Button 
            colorScheme="blue" 
            size="lg" 
            onClick={() => router.push('/login')}
          >
            Volver al inicio de sesión
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}