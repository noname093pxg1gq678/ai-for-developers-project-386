import "@mantine/core/styles.css";

import { MantineProvider, Text, Title } from "@mantine/core";

export default function App() {
  return (
    <MantineProvider>
      <Title order={1}>Календарь звонков</Title>
      <Text>Запись на звонок по мотивам Cal.com</Text>
    </MantineProvider>
  );
}
