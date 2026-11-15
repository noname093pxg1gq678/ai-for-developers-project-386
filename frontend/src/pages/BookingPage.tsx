import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Button,
  Container,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { loadBookingSlots, loadMeetingTypes } from "../data/publicApi";
import {
  bookingWindowDays,
  formatSlotTime,
  groupSlotsByDay,
} from "../lib/days";
import { formatDuration } from "../lib/format";
import { useLoad } from "../lib/useLoad";

const BOOKING_PAGE_TITLE = "Запись на встречу";
const SLOTS_ERROR_MESSAGE = "Не удалось загрузить свободные слоты";
const TYPES_ERROR_MESSAGE = "Не удалось загрузить типы встреч";
const TYPE_NOT_FOUND_MESSAGE = "Тип встречи не найден";
const NO_SLOTS_MESSAGE = "На ближайшие 14 дней нет свободных слотов";
const BACK_LINK_LABEL = "Ко всем типам встреч";

// Поток записи (issue #11): шапка типа, календарь-полоса 14 дней с сегодня
// и сетка слотов выбранного дня в поясе владельца. Форма гостя - issue #12.
// Свободные старты приходят одним запросом на всё окно и группируются
// по дням; дни без слотов и выходные неактивны.
export default function BookingPage() {
  const { typeId } = useParams();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    document.title = BOOKING_PAGE_TITLE;
  }, []);

  const typesLoad = useLoad(loadMeetingTypes, []);
  const slotsLoad = useLoad(() => loadBookingSlots(typeId ?? ""), []);

  const meetingType =
    typesLoad.status === "ready"
      ? (typesLoad.data.find((type) => type.id === typeId) ?? null)
      : null;

  // Календарь-полоса от текущего дня; свободные старты группируются по дням.
  const days = bookingWindowDays();
  const slotsByDay = groupSlotsByDay(slotsLoad.data);
  const openDayKeys = days.filter(
    (day) => (slotsByDay.get(day.key) ?? []).length > 0,
  );
  const openDays = new Set(openDayKeys.map((day) => day.key));
  const activeDay =
    selectedDay && openDays.has(selectedDay)
      ? selectedDay
      : (openDayKeys[0]?.key ?? null);
  const daySlots = activeDay ? (slotsByDay.get(activeDay) ?? []) : [];

  return (
    <Container size="sm" py="xl">
      <Title order={1} mb="md">
        {BOOKING_PAGE_TITLE}
      </Title>

      {typesLoad.status === "loading" && (
        <Skeleton height={96} radius="md" mb="xl" />
      )}
      {typesLoad.status === "error" && (
        <Stack align="center" gap="sm" mb="xl">
          <Text c="red">{TYPES_ERROR_MESSAGE}</Text>
          <Button variant="light" onClick={typesLoad.reload}>
            Повторить
          </Button>
        </Stack>
      )}
      {typesLoad.status === "ready" && !meetingType && (
        <Text c="dimmed" mb="xl">
          {TYPE_NOT_FOUND_MESSAGE}
        </Text>
      )}

      {meetingType && (
        <Stack gap="xs" mb="xl">
          <Text size="lg" fw={600}>
            {meetingType.title}
          </Text>
          <Text c="dimmed">{meetingType.description}</Text>
          <Text size="sm" c="dimmed">
            {formatDuration(meetingType.durationMinutes)}
          </Text>
        </Stack>
      )}

      {meetingType && slotsLoad.status === "loading" && (
        <Skeleton height={120} radius="md" mb="xl" />
      )}
      {meetingType && slotsLoad.status === "error" && (
        <Stack align="center" gap="sm" mb="xl">
          <Text c="red">{SLOTS_ERROR_MESSAGE}</Text>
          <Button variant="light" onClick={slotsLoad.reload}>
            Повторить
          </Button>
        </Stack>
      )}

      {meetingType && slotsLoad.status === "ready" && (
        <>
          <Group gap="xs" mb="xl">
            {days.map((day) => (
              <Button
                key={day.key}
                size="compact-sm"
                variant={day.key === activeDay ? "light" : "default"}
                disabled={!openDays.has(day.key)}
                aria-pressed={day.key === activeDay}
                onClick={() => setSelectedDay(day.key)}
              >
                {day.label}
              </Button>
            ))}
          </Group>
          {daySlots.length === 0 ? (
            <Text c="dimmed" mb="xl">
              {NO_SLOTS_MESSAGE}
            </Text>
          ) : (
            <Group gap="xs" mb="xl">
              {daySlots.map((slot) => (
                <Button key={slot} size="compact-sm" variant="default">
                  {formatSlotTime(slot)}
                </Button>
              ))}
            </Group>
          )}
        </>
      )}

      <Button component={Link} to="/" variant="light">
        {BACK_LINK_LABEL}
      </Button>
    </Container>
  );
}
