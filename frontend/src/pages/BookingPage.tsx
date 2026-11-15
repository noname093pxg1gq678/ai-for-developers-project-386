import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Container, Text, Title } from "@mantine/core";
import { loadMeetingTypes } from "../data/publicApi";
import type { MeetingType } from "../api";
import { formatDuration } from "../lib/format";

const BOOKING_PAGE_TITLE = "Запись на встречу";

type LoadStatus = "loading" | "ready" | "error";

// Заглушка первого этапа: поток записи реализуется на следующем этапе (issue #2).
// Источник данных - SDK через публичный адаптер: список типов и поиск по id,
// отдельного GET по id в контракте нет. Поведение при неизвестном типе
// уточняется в issue #6.
export default function BookingPage() {
  const { typeId } = useParams();
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [meetingType, setMeetingType] = useState<MeetingType | null>(null);

  useEffect(() => {
    document.title = BOOKING_PAGE_TITLE;
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadMeetingTypes()
      .then((types) => {
        if (cancelled) {
          return;
        }
        setMeetingType(types.find((type) => type.id === typeId) ?? null);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [typeId]);

  return (
    <Container size="sm" py="xl">
      <Title order={1} mb="md">
        {BOOKING_PAGE_TITLE}
      </Title>
      {status !== "loading" && meetingType && (
        <Text size="lg" mb="md">
          {meetingType.title} - {formatDuration(meetingType.durationMinutes)}
        </Text>
      )}
      {status !== "loading" && (
        <Text c="dimmed" mb="xl">
          Бронирование будет реализовано на следующем этапе.
        </Text>
      )}
      <Button component={Link} to="/" variant="light">
        Ко всем типам встреч
      </Button>
    </Container>
  );
}
