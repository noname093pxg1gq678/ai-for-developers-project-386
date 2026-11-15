import { Container, Text, Title } from "@mantine/core";

// Заглушка маршрута из спеки поверхностей (issue #3, ADR 0001);
// реализация панели владельца - issue #4.
export default function AdminPage() {
  return (
    <Container size="sm" py="xl">
      <Title order={1}>Панель владельца</Title>
      <Text c="dimmed" mt="md">
        Инструменты владельца появятся здесь (issue #4).
      </Text>
    </Container>
  );
}
