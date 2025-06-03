import React, { useState, useRef } from 'react';
import {
  Container,
  VStack,
  HStack,
  Heading,
  Box,
  Text,
  Input,
  Button,
  useToast,
  Flex,
  IconButton,
  List,
  ListItem,
  Divider,
  Badge,
  UnorderedList,
  OrderedList,
  Code,
  Table,
  Tbody,
  Tr,
  Td,
} from '@chakra-ui/react';

interface Message {
  type: 'bot' | 'user';
  content: string;
  category?: CategoryId;
}

type CategoryId = 'ppe' | 'machinery' | 'vehicles' | 'emergency' | 'protocols' | 'hazards';

interface SafetyCategory {
  id: CategoryId;
  name: string;
  color: string;
  bgColor: string;
  hoverBg: string;
  icon: string;
}

const safetyCategories: SafetyCategory[] = [
  { 
    id: 'ppe', 
    name: 'Personal Protective Equipment', 
    color: 'blue.500',
    bgColor: 'blue.50',
    hoverBg: 'blue.100',
    icon: '🥽'
  },
  { 
    id: 'machinery', 
    name: 'Machinery & Tools', 
    color: 'orange.500',
    bgColor: 'orange.50',
    hoverBg: 'orange.100',
    icon: '⚙️'
  },
  { 
    id: 'vehicles', 
    name: 'Vehicles & Equipment', 
    color: 'green.500',
    bgColor: 'green.50',
    hoverBg: 'green.100',
    icon: '🚛'
  },
  { 
    id: 'emergency', 
    name: 'Emergency Response', 
    color: 'red.500',
    bgColor: 'red.50',
    hoverBg: 'red.100',
    icon: '🚨'
  },
  { 
    id: 'protocols', 
    name: 'Safety Protocols', 
    color: 'purple.500',
    bgColor: 'purple.50',
    hoverBg: 'purple.100',
    icon: '📋'
  },
  { 
    id: 'hazards', 
    name: 'Hazard Identification', 
    color: 'yellow.500',
    bgColor: 'yellow.50',
    hoverBg: 'yellow.100',
    icon: '⚠️'
  }
];

// Custom bullet point component for elegant styling
const ElegantBullet = () => (
  <Box
    as="span"
    w="6px"
    h="6px"
    borderRadius="full"
    bg="blue.500"
    display="inline-block"
    mr={3}
    mt={2}
  />
);

// Header configuration for different levels
const headerStyles = {
  h1: { size: 'xl', color: 'blue.800', mt: 8, mb: 6 },
  h2: { size: 'lg', color: 'blue.700', mt: 6, mb: 4 },
  h3: { size: 'md', color: 'gray.800', mt: 5, mb: 4 },
  h4: { size: 'sm', color: 'gray.700', mt: 4, mb: 3 }
} as const;

function formatMessageContent(content: string) {
  // Split content but preserve separators
  const sections = content.split('\n\n');
  
  return sections.map((section, i) => {
    // Handle separators with elegant styling
    if (section.match(/^-{3,}$/)) {
      return (
        <Box key={i} py={3}>
          <Divider
            borderStyle="solid"
            borderWidth="1px"
            borderColor="blue.100"
            opacity={0.7}
            _before={{
              content: '""',
              display: 'block',
              width: '40px',
              height: '4px',
              bg: 'blue.500',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              borderRadius: 'full'
            }}
            position="relative"
          />
        </Box>
      );
    }

    // Handle blockquotes with enhanced styling
    if (section.startsWith('>')) {
      return (
        <Box
          key={i}
          borderLeftWidth="4px"
          borderLeftColor="blue.500"
          pl={6}
          py={3}
          bg="blue.50"
          borderRadius="lg"
          mb={3}
          boxShadow="sm"
        >
          <Text fontSize="md" color="gray.700" lineHeight="tall">
            {section.slice(1).trim()}
          </Text>
        </Box>
      );
    }

    // Handle headers with professional styling
    if (section.startsWith('#')) {
      const headerText = section.replace(/^#+\s+/, '').trim();
      const level = (section.match(/^#+/) || ['#'])[0].length;
      
      return (
        <Box key={i}>
          <Heading
            size={level === 1 ? "xl" : level === 2 ? "lg" : level === 3 ? "md" : "sm"}
            color={level === 1 ? "blue.800" : level === 2 ? "blue.700" : "gray.700"}
            mt={level === 1 ? 4 : 3}
            mb={level === 1 ? 3 : 2}
            fontFamily="'Inter', sans-serif"
            letterSpacing="-0.02em"
            fontWeight={level === 4 ? 'semibold' : 'bold'}
          >
            {headerText}
          </Heading>
        </Box>
      );
    }

    // Handle bullet lists with elegant styling
    if (section.includes('\n- ') || section.startsWith('- ')) {
      const items = section
        .split(/\n- |^- /)
        .map(item => item.trim())
        .filter(Boolean);
      
      return (
        <VStack key={i} align="stretch" spacing={1} my={2}>
          {items.map((item, j) => (
            <HStack
              key={j}
              align="flex-start"
              spacing={3}
              _hover={{ bg: 'gray.50' }}
              p={1.5}
              borderRadius="md"
              transition="all 0.2s"
            >
              <ElegantBullet />
              <Box flex={1}>
                {formatInlineContent(item)}
              </Box>
            </HStack>
          ))}
        </VStack>
      );
    }

    // Handle numbered lists with professional styling
    if (/^\d\.|\n\d\./.test(section)) {
      const items = section
        .split(/\n/)
        .filter(line => /^\d\./.test(line.trim()));
      
      return (
        <VStack key={i} align="stretch" spacing={1} my={2}>
          {items.map((item, j) => (
            <HStack
              key={j}
              align="flex-start"
              spacing={3}
              _hover={{ bg: 'gray.50' }}
              p={1.5}
              borderRadius="md"
              transition="all 0.2s"
            >
              <Text
                color="blue.500"
                fontWeight="semibold"
                minW="2rem"
                fontSize="sm"
                bg="blue.50"
                p={1}
                borderRadius="md"
                textAlign="center"
              >
                {item.match(/^\d+/)?.[0]}.
              </Text>
              <Box flex={1}>
                {formatInlineContent(item.replace(/^\d+\.\s*/, ''))}
              </Box>
            </HStack>
          ))}
        </VStack>
      );
    }

    // Handle tables with professional styling
    if (section.includes('|')) {
      const rows = section.split('\n').filter(row => row.includes('|'));
      const isHeader = (row: string) => row.includes('---');
      
      return (
        <Box
          key={i}
          overflowX="auto"
          my={3}
          borderWidth="1px"
          borderRadius="lg"
          borderColor="gray.200"
          boxShadow="sm"
        >
          <Table variant="simple" size="sm">
            <Tbody>
              {rows.map((row, j) => {
                if (isHeader(row)) return null;
                const cells = row.split('|').map(cell => cell.trim()).filter(Boolean);
                return (
                  <Tr
                    key={j}
                    _hover={{ bg: 'gray.50' }}
                    transition="all 0.2s"
                  >
                    {cells.map((cell, k) => (
                      <Td 
                        key={k} 
                        borderColor="gray.200"
                        py={2}
                        px={3}
                        fontSize="sm"
                        whiteSpace="pre-wrap"
                      >
                        {formatInlineContent(cell)}
                      </Td>
                    ))}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      );
    }

    // Handle regular paragraphs with professional styling
    return (
      <Text
        key={i}
        mb={2}
        lineHeight="tall"
        fontSize="sm"
        color="gray.700"
      >
        {formatInlineContent(section)}
      </Text>
    );
  });
}

// Enhanced inline content formatting with professional styling
function formatInlineContent(text: string) {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/).map((part, j) => {
    if (part.startsWith('`')) {
      return (
        <Code
          key={j}
          px={2}
          mx={1}
          bg="gray.50"
          color="blue.600"
          fontSize="0.9em"
          borderRadius="md"
          fontFamily="'JetBrains Mono', monospace"
        >
          {part.slice(1, -1)}
        </Code>
      );
    }
    if (part.startsWith('**')) {
      return (
        <Text
          key={j}
          as="strong"
          display="inline"
          color="gray.900"
          fontWeight="semibold"
          letterSpacing="0.01em"
        >
          {part.slice(2, -2)}
        </Text>
      );
    }
    return part;
  });
}

// Simple microphone icon component
const MicrophoneIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
  </svg>
);

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([{
    type: 'bot',
    content: "Hello! I'm your Construction Safety Assistant. How can I help you today? You can ask me about PPE requirements, machinery safety, emergency procedures, and more.",
  }]);
  const [currentInput, setCurrentInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const toast = useToast();
  const recognitionRef = useRef<any>(null);

  const startSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        toast({
          title: 'Listening...',
          status: 'info',
          duration: null,
        });
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentInput(transcript);
        handleUserInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.closeAll();
        toast({
          title: 'Speech Recognition Error',
          description: 'Please try again or type your question',
          status: 'error',
          duration: 3000,
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        toast.closeAll();
      };

      recognitionRef.current.start();
    } else {
      toast({
        title: 'Speech Recognition Not Supported',
        description: 'Please use a supported browser like Chrome',
        status: 'warning',
        duration: 3000,
      });
    }
  };

  const handleUserInput = async (input: string = currentInput) => {
    if (!input.trim()) return;

    const userMessage: Message = {
      type: 'user',
      content: input.trim(),
      category: selectedCategory || undefined,
    };
    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-safety-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
          category: selectedCategory,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get safety information');
      }

      const data = await response.json();
      setMessages(prev => [...prev, {
        type: 'bot' as const,
        content: data.response,
        category: selectedCategory,
      } as Message]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        type: 'bot' as const,
        content: 'Sorry, I encountered an error while retrieving safety information. Please try again.',
      } as Message]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserInput();
    }
  };

  const handleCategorySelect = (categoryId: CategoryId) => {
    setSelectedCategory(categoryId);
    const category = safetyCategories.find(c => c.id === categoryId);
    if (category) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: `I'll help you with ${category.name} related questions. What would you like to know?`,
        category: categoryId,
      }]);
    }
  };

  return (
    <Box maxW="1280px" mx="auto" h="100vh" p={0} bg="white">
      <HStack spacing={0} align="stretch" h="full" boxShadow="lg" borderRadius="xl" overflow="hidden">
        {/* Sidebar - Fixed height with scroll */}
        <Box 
          w="300px" 
          bg="blue.700"
          borderRight="1px" 
          borderColor="blue.800"
          h="full"
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'var(--chakra-colors-blue-500)',
              borderRadius: '24px',
            },
          }}
        >
          <VStack spacing={4} align="stretch" p={4}>
            <Heading size="md" mb={4} color="white">Safety Categories</Heading>
            <List spacing={2}>
              {safetyCategories.map((category) => (
                <ListItem key={category.id}>
                  <Button
                    width="full"
                    justifyContent="flex-start"
                    bg={selectedCategory === category.id ? category.color : category.bgColor}
                    color={selectedCategory === category.id ? 'white' : category.color}
                    _hover={{ 
                      bg: selectedCategory === category.id ? category.color : category.hoverBg,
                      transform: 'translateX(2px)'
                    }}
                    transition="all 0.2s"
                    borderRadius="lg"
                    p={3}
                    onClick={() => handleCategorySelect(category.id)}
                    leftIcon={<Box as="span" fontSize="xl">{category.icon}</Box>}
                  >
                    {category.name}
                  </Button>
                </ListItem>
              ))}
            </List>
            <Divider borderColor="blue.600" />
            <Box>
              <Text fontSize="sm" color="blue.100" mb={2} fontWeight="medium">
                Quick Tips:
              </Text>
              <VStack align="stretch" spacing={2}>
                <Badge bg="red.500" color="white">Always wear proper PPE</Badge>
                <Badge bg="orange.400" color="white">Check equipment before use</Badge>
                <Badge bg="green.500" color="white">Report unsafe conditions</Badge>
              </VStack>
            </Box>
          </VStack>
        </Box>

        {/* Main Chat Area - Fixed height with flex layout */}
        <Flex 
          direction="column" 
          flex={1} 
          h="full" 
          maxH="100vh"
          overflow="hidden"
          bg="white"
        >
          {/* Header */}
          <Box 
            p={4} 
            borderBottom="1px" 
            borderColor="gray.200" 
            bg="white"
            boxShadow="sm"
          >
            <Heading size="lg" color="blue.700" display="flex" alignItems="center" gap={2}>
              <Box as="span" color="blue.500">🛠️</Box>
              Construction Safety Assistant
            </Heading>
          </Box>

          {/* Messages Area - Scrollable */}
          <Box
            flex={1}
            overflowY="auto"
            p={4}
            bg="white"
            css={{
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                width: '6px',
                background: 'var(--chakra-colors-gray-50)',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'var(--chakra-colors-blue-500)',
                borderRadius: '24px',
              },
            }}
          >
            <VStack spacing={4} align="stretch">
              {messages.map((message, index) => (
                <Flex
                  key={index}
                  justify={message.type === 'user' ? 'flex-end' : 'flex-start'}
                >
                  <Box
                    maxW="80%"
                    bg={message.type === 'user' ? 'blue.500' : 'white'}
                    color={message.type === 'user' ? 'white' : 'gray.800'}
                    p={4}
                    borderRadius="xl"
                    borderWidth={message.type === 'user' ? 0 : 1}
                    borderColor="gray.200"
                    boxShadow={message.type === 'user' ? 'lg' : 'sm'}
                  >
                    {message.category && (
                      <Badge
                        bg={message.type === 'user' 
                          ? 'blue.400' 
                          : safetyCategories.find(c => c.id === message.category)?.bgColor || 'gray.100'}
                        color={message.type === 'user' 
                          ? 'white' 
                          : safetyCategories.find(c => c.id === message.category)?.color || 'gray.600'}
                        mb={2}
                        borderRadius="full"
                        px={3}
                        py={1}
                        display="flex"
                        alignItems="center"
                        gap={2}
                      >
                        <Box as="span">
                          {safetyCategories.find(c => c.id === message.category)?.icon}
                        </Box>
                        {safetyCategories.find(c => c.id === message.category)?.name}
                      </Badge>
                    )}
                    <VStack align="stretch" spacing={2}>
                      {formatMessageContent(message.content)}
                    </VStack>
                  </Box>
                </Flex>
              ))}
            </VStack>
          </Box>

          {/* Input Area - Fixed at bottom */}
          <Box 
            p={4} 
            borderTop="1px" 
            borderColor="gray.200"
            bg="white"
            boxShadow="0 -2px 10px rgba(0,0,0,0.05)"
          >
            <Flex>
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about safety guidelines, procedures, or equipment..."
                mr={2}
                disabled={isGenerating}
                bg="white"
                borderColor="gray.300"
                _hover={{ borderColor: "blue.400" }}
                _focus={{
                  borderColor: "blue.400",
                  boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)"
                }}
              />
              <IconButton
                aria-label="Voice Input"
                icon={<MicrophoneIcon />}
                colorScheme={isListening ? 'red' : 'blue'}
                variant="outline"
                onClick={startSpeechRecognition}
                mr={2}
                isDisabled={isGenerating}
              />
              <Button
                colorScheme="blue"
                onClick={() => handleUserInput()}
                isLoading={isGenerating}
                loadingText="Generating..."
                disabled={!currentInput.trim() || isGenerating}
                px={6}
                size="md"
                fontWeight="semibold"
                _hover={{ transform: 'translateY(-1px)' }}
                transition="all 0.2s"
              >
                Send
              </Button>
            </Flex>
          </Box>
        </Flex>
      </HStack>
    </Box>
  );
} 