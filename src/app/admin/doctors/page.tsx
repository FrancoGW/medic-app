'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  IconButton,
  Badge,
  useDisclosure,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FaTrash, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function DoctorManagementPage() {
  const { data: session, status } = useSession({ required: true });
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInviteSuccess, setShowInviteSuccess] = useState(false);
  const toast = useToast();
  const router = useRouter();
  
  // Verificar si el usuario es administrador
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      toast({
        title: 'Acceso denegado',
        description: 'No tienes permisos para acceder a esta página',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      router.push('/admin');
    }
  }, [session, status, router, toast]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar email
    if (!email) {
      setEmailError('El email es requerido');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Email inválido');
      return;
    }
    
    setEmailError('');
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/invite-doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Éxito',
          description: data.emailSent 
            ? 'Invitación enviada correctamente al correo' 
            : 'Doctor autorizado, pero puede haber problemas al enviar el correo. Revisa los logs del servidor.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        setEmail('');
        setShowInviteSuccess(true);
        
        // Ocultar el mensaje de éxito después de 5 segundos
        setTimeout(() => {
          setShowInviteSuccess(false);
        }, 5000);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Error al enviar invitación',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Error al conectar con el servidor',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si está cargando la sesión
  if (status === 'loading') {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  // Si no es administrador o no está autenticado
  if (status === 'authenticated' && session?.user?.role !== 'admin') {
    return (
      <Container maxW="container.xl" py={8}>
        <Heading>Acceso denegado</Heading>
        <Text mt={4}>No tienes permisos para acceder a esta página.</Text>
        <Button mt={4} onClick={() => router.push('/')}>Volver al inicio</Button>
      </Container>
    );
  }

  return (
    <Box minH="100vh">
      <Container maxW="container.xl" py={8}>
        <Flex mb={6} alignItems="center">
          <IconButton
            aria-label="Volver"
            icon={<FaArrowLeft />}
            onClick={() => router.push('/admin')}
            mr={4}
          />
          <Heading as="h1" size="xl">
            Gestión de Doctores
          </Heading>
        </Flex>

        <VStack spacing={8} align="stretch">
          <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
            <Heading size="md" mb={4}>
              Invitar a un nuevo doctor
            </Heading>
            
            {showInviteSuccess && (
              <Alert status="success" mb={4}>
                <AlertIcon />
                El doctor ha sido invitado correctamente. Cuando se registre con este email, automáticamente tendrá el rol de doctor.
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <Flex direction={{ base: "column", md: "row" }} gap={4}>
                <FormControl isInvalid={!!emailError}>
                  <FormLabel>Email del doctor</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@ejemplo.com"
                  />
                  {emailError && <FormErrorMessage>{emailError}</FormErrorMessage>}
                </FormControl>
                <Button
                  mt={{ base: 4, md: 8 }}
                  colorScheme="blue"
                  type="submit"
                  isLoading={isSubmitting}
                  leftIcon={<FaPlus />}
                  width={{ base: "full", md: "auto" }}
                >
                  Invitar
                </Button>
              </Flex>
            </form>
          </Box>

          <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
            <Heading size="md" mb={4}>
              Información Importante
            </Heading>
            <Text mb={2}>
              <strong>Nota:</strong> En el entorno de desarrollo, es posible que los correos electrónicos no se envíen correctamente.
            </Text>
            <Text mb={2}>
              Cuando invites a un doctor, el sistema registrará su correo en la base de datos y lo autorizará a registrarse,
              pero el correo de invitación podría no llegar por las siguientes razones:
            </Text>
            <Box pl={5} mb={4}>
              <Text>• Configuración SMTP incorrecta en el archivo .env.local</Text>
              <Text>• Correos bloqueados por proveedores como Gmail, Outlook, etc.</Text>
              <Text>• Firewall o configuración de red bloqueando el puerto SMTP (generalmente 465)</Text>
            </Box>
            <Text>
              Para verificar si los correos se están intentando enviar, revisa los logs en la consola del servidor.
            </Text>
          </Box>

          <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
            <Heading size="md" mb={4}>
              Invitaciones enviadas
            </Heading>
            <Text>
              Los doctores invitados aparecerán aquí una vez que se registren en el sistema.
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}