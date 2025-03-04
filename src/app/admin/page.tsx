'use client';

import { useSession, signOut } from 'next-auth/react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  Spacer,
  useColorMode,
  IconButton,
} from '@chakra-ui/react';
import { FaSun, FaMoon, FaSignOutAlt } from 'react-icons/fa';

export default function AdminPage() {
  const { data: session } = useSession({ required: true });
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box minH="100vh">
      <Flex
        as="header"
        bg="brand.600"
        color="white"
        p={4}
        alignItems="center"
        boxShadow="md"
      >
        <Heading size="md">Panel de Administración</Heading>
        <Spacer />
        <Flex alignItems="center" gap={2}>
          <Text>
            {session?.user?.email || 'Usuario'}
          </Text>
          <IconButton
            aria-label="Cambiar tema"
            icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
            onClick={toggleColorMode}
            variant="ghost"
            color="white"
            _hover={{ bg: 'brand.500' }}
          />
          <IconButton
            aria-label="Cerrar sesión"
            icon={<FaSignOutAlt />}
            onClick={() => signOut({ callbackUrl: '/' })}
            variant="ghost"
            color="white"
            _hover={{ bg: 'brand.500' }}
          />
        </Flex>
      </Flex>

      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl">
            Bienvenido al Panel de Administración
          </Heading>
          <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
            <Heading size="md" mb={4}>
              Aquí podrás gestionar toda la información
            </Heading>
            <Text>
              Este es un panel de administración básico. Puedes añadir
              funcionalidades como gestión de usuarios, reportes, configuración,
              etc.
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}