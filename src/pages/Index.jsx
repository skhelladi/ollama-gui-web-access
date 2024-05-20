import React, { useState, useEffect } from "react";
import { Container, VStack, HStack, Select, Input, Button, Switch, Textarea, Text, Box, useToast } from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";

const Index = () => {
  const [baseUrl, setBaseUrl] = useState("http://localhost:8000");
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [prompt, setPrompt] = useState("");
  const [enableSearch, setEnableSearch] = useState(false);
  const [response, setResponse] = useState("");
  const toast = useToast();

  useEffect(() => {
    // Fetch available models from the local Ollama instance
    fetch(`${baseUrl}/models`)
      .then((res) => res.json())
      .then((data) => setModels(data.models))
      .catch((error) => {
        console.error("Error fetching models:", error);
        toast({
          title: "Error",
          description: "Failed to fetch models from the local Ollama instance.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  }, [baseUrl, toast]);

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
      const searchResults = enableSearch ? await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(prompt)}&format=json`).then((res) => res.json()) : null;
      const searchContext = searchResults ? searchResults.RelatedTopics.map((topic) => topic.Text).join("\n") : "";

      const response = await fetch(`${baseUrl}/models/${selectedModel}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: enableSearch ? `${prompt}\n\nSearch Context:\n${searchContext}` : prompt,
        }),
      }).then((res) => res.json());

      setResponse(response.text);
    } catch (error) {
      console.error("Error generating response:", error);
      toast({
        title: "Error",
        description: "Failed to generate response from the selected model.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Container centerContent maxW="container.md" py={8}>
      <VStack spacing={4} width="100%">
        <HStack width="100%">
          <Text>Base URL:</Text>
          <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
        </HStack>
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
          <Text>Enable Search:</Text>
          <Switch isChecked={enableSearch} onChange={(e) => setEnableSearch(e.target.checked)} />
        </HStack>
        <Textarea placeholder="Enter your prompt here..." value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <Button leftIcon={<FaSearch />} colorScheme="teal" onClick={handleSearch}>
          Generate Response
        </Button>
        {response && (
          <Box width="100%" p={4} borderWidth="1px" borderRadius="md">
            <Text fontWeight="bold">Response:</Text>
            <Text>{response}</Text>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default Index;
