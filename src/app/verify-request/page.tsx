'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { FaEnvelope } from 'react-icons/fa';

export default function VerifyRequestPage() {
  return (
    <Container maxW="md" py={12}>
      <VStack spacing={8}>
        <Icon as={FaEnvelope} boxSize={12} color="blue.500" />
        <Heading as="h1" size="xl" textAlign="center">
          Revisa tu correo
        </Heading>
        <Box textAlign="center">
          <Text mb={4}>
            Se ha enviado un enlace de acceso a tu correo electrónico.
          </Text>
          <Text>
            Haz clic en el enlace para iniciar sesión automáticamente.
          </Text>
        </Box>
      </VStack>
    </Container>
  );
}