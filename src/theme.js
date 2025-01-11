import { extendTheme } from "@chakra-ui/react";

const config = {
  initialColorMode: "light",
  useSystemColorMode: true,
};

const theme = extendTheme({
  config,
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === "dark" ? "gray.800" : "gray.50",
      },
    }),
  },
  components: {
    Container: {
      baseStyle: {
        maxW: "container.lg",
        px: "6",
        py: "8",
      },
    },
    Button: {
      defaultProps: {
        colorScheme: "teal",
      },
    },
  },
});

export default theme;
