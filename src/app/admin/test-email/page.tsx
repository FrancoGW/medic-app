'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  IconButton,
  Code,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Divider,
} from '@chakra-ui/react';
import { FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function TestEmailPage() {
  const { data: session, status } = useSession({ required: true });
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const toast = useToast();
  const router = useRouter();

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
    setTestResult(null);
    
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      setTestResult(data);
      
      if (response.ok) {
        toast({
          title: data.emailResult.success ? 'Éxito' : 'Advertencia',
          description: data.emailResult.success 
            ? 'Correo de prueba enviado correctamente' 
            : 'Se detectaron problemas al enviar el correo',
          status: data.emailResult.success ? 'success' : 'warning',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Error al probar configuración',
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
            Prueba de Configuración de Correo
          </Heading>
        </Flex>

        <VStack spacing={8} align="stretch">
          <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
            <Heading size="md" mb={4}>
              Enviar correo de prueba
            </Heading>
            <form onSubmit={handleSubmit}>
              <Flex direction={{ base: "column", md: "row" }} gap={4}>
                <FormControl isInvalid={!!emailError}>
                  <FormLabel>Email para prueba</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                  />
                  {emailError && <FormErrorMessage>{emailError}</FormErrorMessage>}
                </FormControl>
                <Button
                  mt={{ base: 4, md: 8 }}
                  colorScheme="blue"
                  type="submit"
                  isLoading={isSubmitting}
                  leftIcon={<FaPaperPlane />}
                  width={{ base: "full", md: "auto" }}
                >
                  Enviar prueba
                </Button>
              </Flex>
            </form>
          </Box>

          {testResult && (
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <Heading size="md" mb={4}>
                Resultado de la prueba
              </Heading>
              
              <Box mb={4}>
                <Heading size="sm" mb={2}>Configuración SMTP</Heading>
                <Code p={3} display="block" whiteSpace="pre-wrap" borderRadius="md">
                  {JSON.stringify(testResult.config, null, 2)}
                </Code>
              </Box>
              
              <Divider my={4} />
              
              <Box mb={4}>
                <Heading size="sm" mb={2}>Verificación de conexión SMTP</Heading>
                <Alert 
                  status={testResult.smtpCheck.success ? 'success' : 'error'}
                  mb={3}
                >
                  <AlertIcon />
                  <Box>
                    <AlertTitle>{testResult.smtpCheck.message}</AlertTitle>
                    {!testResult.smtpCheck.success && (
                      <AlertDescription>
                        {testResult.smtpCheck.error}
                      </AlertDescription>
                    )}
                  </Box>
                </Alert>
              </Box>
              
              <Divider my={4} />
              
              <Box mb={4}>
                <Heading size="sm" mb={2}>Resultado del envío</Heading>
                <Alert 
                  status={testResult.emailResult.success ? 'success' : 'error'}
                  mb={3}
                >
                  <AlertIcon />
                  <Box>
                    <AlertTitle>{testResult.emailResult.message}</AlertTitle>
                    {!testResult.emailResult.success ? (
                      <AlertDescription>
                        {testResult.emailResult.error}
                      </AlertDescription>
                    ) : (
                      <AlertDescription>
                        ID del mensaje: {testResult.emailResult.messageId}
                      </AlertDescription>
                    )}
                  </Box>
                </Alert>
              </Box>
              
              <Divider my={4} />
              
              <Box>
                <Heading size="sm" mb={2}>Información adicional</Heading>
                <Text mb={2}><strong>URL de NextAuth:</strong> {testResult.nextAuthUrl}</Text>
                <Text><strong>Timestamp:</strong> {new Date(testResult.timestamp).toLocaleString()}</Text>
              </Box>
            </Box>
          )}
          
          <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
            <Heading size="md" mb={4}>
              Solución de problemas
            </Heading>
            <Text mb={2}>
              Si los correos no se están enviando, verifica:
            </Text>
            <Box pl={5} mb={4}>
              <Text mb={1}>• Que los valores en .env.local sean correctos</Text>
              <Text mb={1}>• Que el servidor SMTP esté accesible desde tu red</Text>
              <Text mb={1}>• Que las credenciales de acceso sean válidas</Text>
              <Text mb={1}>• Que el puerto 465 (o el que estés usando) no esté bloqueado</Text>
              <Text>• Que el dominio de correo no esté bloqueando envíos automáticos</Text>
            </Box>
            <Text mb={2}>
              Configuración recomendada para entorno de desarrollo:
            </Text>
            <Box pl={5}>
              <Text mb={1}>• Usar servicios como <strong>Ethereal Email</strong> (correos de prueba)</Text>
              <Text mb={1}>• Usar <strong>Mailtrap</strong> para capturar correos en un buzón virtual</Text>
              <Text>• Configurar un servidor SMTP temporal con <strong>Nodemailer</strong></Text>
            </Box>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}