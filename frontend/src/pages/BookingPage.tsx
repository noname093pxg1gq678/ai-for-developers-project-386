import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Container, Text, Title } from "@mantine/core";
import { DEMO_MEETING_TYPES } from "../data/meetingTypes";
import { formatDuration } from "../lib/format";

const BOOKING_PAGE_TITLE = "Запись на встречу";

// Заглушка первого этапа: поток записи реализуется на следующем этапе (issue #2).
export default function BookingPage() {
  const { typeId } = useParams();
  const meetingType = DEMO_MEETING_TYPES.find((type) => type.id === typeId);

  useEffect(() => {
    document.title = BOOKING_PAGE_TITLE;
  }, []);

  return (
    <Container size="sm" py="xl">
      <Title order={1} mb="md">
        {BOOKING_PAGE_TITLE}
      </Title>
      {meetingType && (
        <Text size="lg" mb="md">
          {meetingType.title} - {formatDuration(meetingType.durationMinutes)}
        </Text>
      )}
      <Text c="dimmed" mb="xl">
        Бронирование будет реализовано на следующем этапе.
      </Text>
      <Button component={Link} to="/" variant="light">
        Ко всем типам встреч
      </Button>
    </Container>
  );
}
