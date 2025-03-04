'use client';

import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { FaLock } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <Container maxW="md" py={12}>
      <VStack spacing={8}>
        <Icon as={FaLock} boxSize={12} color="red.500" />
        <Heading as="h1" size="xl" textAlign="center">
          Acceso denegado
        </Heading>
        <Box textAlign="center">
          <Text mb={4}>
            No tienes permiso para acceder a esta página.
          </Text>
        </Box>
        <Button colorScheme="blue" onClick={() => router.push('/')}>
          Volver al inicio
        </Button>
      </VStack>
    </Container>
  );
}