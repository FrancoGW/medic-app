'use client';

import { useSession } from 'next-auth/react';
import {
  Box,
  Container,
  Heading,
  Text,
  Code,
  VStack,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function DebugPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl">
          Diagnóstico de Sesión
        </Heading>

        <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
          <Heading size="md" mb={4}>
            Estado de la sesión: {status}
          </Heading>
          {status === 'loading' ? (
            <Text>Cargando...</Text>
          ) : status === 'authenticated' ? (
            <Alert status="success" mb={4}>
              <AlertIcon />
              <AlertTitle>Autenticado</AlertTitle>
              <AlertDescription>
                Has iniciado sesión correctamente.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert status="error" mb={4}>
              <AlertIcon />
              <AlertTitle>No autenticado</AlertTitle>
              <AlertDescription>
                No has iniciado sesión. La información de sesión no está disponible.
              </AlertDescription>
            </Alert>
          )}

          {session && (
            <Box mt={4}>
              <Heading size="sm" mb={2}>
                Datos de la sesión:
              </Heading>
              <Code p={3} display="block" whiteSpace="pre-wrap" borderRadius="md">
                {JSON.stringify(session, null, 2)}
              </Code>
            </Box>
          )}
        </Box>

        <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
          <Heading size="md" mb={4}>
            Análisis de rol
          </Heading>

          {session?.user?.role ? (
            <>
              <Alert 
                status={session.user.role === 'admin' ? 'success' : 'info'} 
                mb={4}
              >
                <AlertIcon />
                <AlertTitle>Rol detectado: {session.user.role}</AlertTitle>
                <AlertDescription>
                  {session.user.role === 'admin' 
                    ? 'Tienes permisos de administrador.' 
                    : 'No tienes permisos de administrador.'}
                </AlertDescription>
              </Alert>
              
              <Text>
                Email: {session.user.email}
              </Text>
              <Text>
                ID: {session.user.id}
              </Text>
            </>
          ) : (
            <Alert status="warning" mb={4}>
              <AlertIcon />
              <AlertTitle>No se detectó rol</AlertTitle>
              <AlertDescription>
                Tu usuario no tiene un rol asignado. Esto podría causar problemas de acceso.
              </AlertDescription>
            </Alert>
          )}
        </Box>

        <Box>
          <Button onClick={() => router.push('/')} mr={3}>
            Volver al inicio
          </Button>
          <Button onClick={() => router.push('/admin')} colorScheme="blue">
            Ir a Admin
          </Button>
        </Box>
      </VStack>
    </Container>
  );
}