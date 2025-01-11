import React, { useState, useEffect } from "react";
import { Container, VStack, HStack, Select, Input, Button, Switch, Textarea, Text, Box, useToast, Spinner } from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ThemeToggle } from "../components/ThemeToggle";

const Index = () => {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [prompt, setPrompt] = useState("");
  const [enableSearch, setEnableSearch] = useState(false);
  const [response, setResponse] = useState("");
  const [searchResults, setSearchResults] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Fetch available models from API
    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => setModels(data.models))
      .catch((error) => {
        console.error("Error fetching models:", error);
        toast({
          title: "Error",
          description: "Failed to fetch models from server.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  }, [toast]);

  const performWebSearch = async (query) => {
    try {
      // Utilisation d'un proxy CORS pour accéder à l'API DuckDuckGo
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://html.duckduckgo.com/html/?q=${query}`)}`);
      const data = await response.json();
      
      if (!data.contents) {
        throw new Error('No search results found');
      }

      // Créer un parser HTML temporaire
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');
      
      // Extraire les résultats de recherche
      const results = [];
      const searchResults = doc.querySelectorAll('.result__snippet');
      searchResults.forEach(result => {
        if (result.textContent) {
          results.push(result.textContent.trim());
        }
      });

      // Limiter à 5 résultats
      const limitedResults = results.slice(0, 5);

      // Transformer chaque snippet en puce
      const bulletPoints = limitedResults.map(r => `- ${r}`).join('\n');

      return bulletPoints;
    } catch (error) {
      console.error('Web search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to perform web search. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return '';
    }
  };

  const handleSearch = async () => {
    if (!selectedModel || !prompt) {
      toast({
        title: "Error",
        description: "Please select a model and enter a prompt.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      setResponse("");
      setSearchResults("");

      let finalPrompt = prompt;
      
      if (enableSearch) {
        setSearchResults("Searching the web...");
        const searchContext = await performWebSearch(prompt);
        
        if (searchContext) {
          setSearchResults(searchContext);
          finalPrompt = `Question: ${prompt}\n\nContext from web search:\n${searchContext}\n\nPlease provide a comprehensive answer based on the above context:`;
        } else {
          setSearchResults("No relevant search results found.");
        }
      }
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: finalPrompt,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setResponse(data.response);
    } catch (error) {
      console.error("Error generating response:", error);
      toast({
        title: "Error",
        description: "Failed to generate response from the selected model.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderers = {
    code: ({ language, value }) => {
      return <SyntaxHighlighter style={dark} language={language} children={value} />;
    }
  };

  return (
    <Container centerContent maxW="container.lg" py={8}>
      <ThemeToggle />
      <VStack spacing={6} width="100%" className="container-box">
        <Text fontSize="2xl" fontWeight="bold">
          Welcome to Ollama Search GUI
        </Text>
        <Text>
          Enter your prompt, select a model, and optionally enable web search. Then click "Generate Response" to see the AI's answer!
        </Text>
        <HStack width="100%">
          <Text>Select Model:</Text>
          <Select placeholder="Select model" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </Select>
        </HStack>
        <HStack width="100%">
          <Text>Enable Search (DuckDuckGo):</Text>
          <Switch isChecked={enableSearch} onChange={(e) => setEnableSearch(e.target.checked)} />
        </HStack>
        <Textarea placeholder="Enter your prompt here..." value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <Button 
          leftIcon={<FaSearch />} 
          colorScheme="teal" 
          onClick={handleSearch}
          isLoading={isLoading}
          loadingText="Generating..."
        >
          Generate Response
        </Button>
        
        {isLoading && (
          <Box width="100%" p={4} textAlign="center">
            <VStack spacing={3}>
              <Spinner size="xl" color="teal.500" />
              <Text>The AI is thinking... Please wait</Text>
            </VStack>
          </Box>
        )}

        {response && (
          <Box width="100%" p={6} className="response-box">
            <Text fontWeight="bold" mb={3}>AI Response:</Text>
            <Box className="markdown-body">
              <ReactMarkdown renderers={renderers}>{response}</ReactMarkdown>
            </Box>
          </Box>
        )}

        {enableSearch && searchResults && (
          <Box
            width="100%"
            p={6}
            className="response-box search-results"
          >
            <Text fontWeight="bold" mb={3}>Web Search Results:</Text>
            <ReactMarkdown renderers={renderers}>{searchResults}</ReactMarkdown>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default Index;
