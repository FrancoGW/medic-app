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
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from '@chakra-ui/react';
import { FaSun, FaMoon, FaSignOutAlt, FaUserMd, FaCalendarAlt, FaChartLine, FaCog } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { data: session } = useSession({ required: true });
  const { colorMode, toggleColorMode } = useColorMode();
  const router = useRouter();

  // Opciones del panel de administración
  const adminOptions = [
    {
      title: 'Gestión de Doctores',
      description: 'Invitar y administrar acceso de médicos al sistema',
      icon: FaUserMd,
      action: () => router.push('/admin/doctors'),
      color: 'blue.500',
    },
    {
      title: 'Calendario',
      description: 'Visualizar horarios y citas programadas',
      icon: FaCalendarAlt,
      action: () => router.push('/admin/calendar'),
      color: 'green.500',
    },
    {
      title: 'Estadísticas',
      description: 'Ver métricas y análisis del sistema',
      icon: FaChartLine,
      action: () => router.push('/admin/stats'),
      color: 'purple.500',
    },
    {
      title: 'Configuración',
      description: 'Ajustes generales del sistema',
      icon: FaCog,
      action: () => router.push('/admin/settings'),
      color: 'orange.500',
    },
  ];

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
          
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
            {adminOptions.map((option, index) => (
              <GridItem key={index}>
                <Card 
                  height="100%" 
                  cursor="pointer" 
                  _hover={{ transform: 'translateY(-5px)', transition: 'transform 0.3s' }}
                  onClick={option.action}
                >
                  <CardHeader>
                    <Flex align="center">
                      <Box
                        p={2}
                        borderRadius="md"
                        bg={option.color}
                        color="white"
                        mr={3}
                      >
                        <option.icon size="1.5em" />
                      </Box>
                      <Heading size="md">{option.title}</Heading>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    <Text>{option.description}</Text>
                  </CardBody>
                  <CardFooter>
                    <Button rightIcon={<Box as="span" ml={1}>→</Box>} variant="ghost" colorScheme="blue">
                      Acceder
                    </Button>
                  </CardFooter>
                </Card>
              </GridItem>
            ))}
          </Grid>
          
          <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" mt={6}>
            <Heading size="md" mb={4}>
              Estado del Sistema
            </Heading>
            <Text>
              Aquí podrás ver información relevante sobre el estado actual del sistema.
              Estamos trabajando para añadir más funcionalidades y métricas útiles para la gestión.
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}