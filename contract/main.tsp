// Контракт API - источник истины (issue #1).
// Решения: UTC в ISO 8601, пояс владельца Europe/Moscow (ADR 0002);
// рабочее время пн-пт 09:00-18:00; шаг слотов 30 минут; окно записи
// 14 календарных дней от текущего дня; длительность 5-240 минут;
// ошибки 400/404/409; типы отдаются по времени создания, новые сверху.
import "@typespec/http";

using Http;

@service(#{
  title: "Календарь звонков",
})
namespace CallBooking;

/** Тип встречи, опубликованный владельцем. */
model MeetingType {
  /** Устойчивый идентификатор. */
  id: string;

  /** Название, например «Звонок на 45 минут». */
  @maxLength(100)
  title: string;

  /** Описание для гостя. */
  @maxLength(500)
  description: string;

  /** Длительность в минутах. */
  @minValue(5)
  @maxValue(240)
  durationMinutes: int32;

  /** Момент создания, UTC. */
  createdAt: utcDateTime;
}

/** Данные типа встречи при создании и изменении. */
model MeetingTypeInput {
  /** Название. */
  @maxLength(100)
  title: string;

  /** Описание для гостя. */
  @maxLength(500)
  description: string;

  /** Длительность в минутах. */
  @minValue(5)
  @maxValue(240)
  durationMinutes: int32;
}

/** Встреча - результат бронирования слота гостем. */
model Meeting {
  /** Устойчивый идентификатор. */
  id: string;

  /** Тип встречи. */
  typeId: string;

  /** Название типа встречи на момент чтения. */
  typeTitle: string;

  /** Старт слота, UTC. */
  startsAt: utcDateTime;

  /** Имя гостя. */
  @maxLength(100)
  guestName: string;

  /** Email гостя. */
  @pattern("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
  guestEmail: string;

  /** Комментарий гостя. */
  @maxLength(500)
  comment?: string;
}

/** Данные бронирования слота гостем. */
model BookingInput {
  /** Тип встречи. */
  typeId: string;

  /** Старт свободного слота, UTC. */
  startsAt: utcDateTime;

  /** Имя гостя. */
  @maxLength(100)
  guestName: string;

  /** Email гостя. */
  @pattern("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
  guestEmail: string;

  /** Комментарий гостя. */
  @maxLength(500)
  comment?: string;
}

/** Ошибка API. */
@error
model ApiError {
  message: string;
}

/** Тип встречи или слот не найдены. */
@error
model NotFoundError {
  @statusCode
  statusCode: 404;

  message: string;
}

/** Слот занят или пересекается с существующей встречей. */
@error
model ConflictError {
  @statusCode
  statusCode: 409;

  message: string;
}

/** Успешное создание типа встречи. */
model CreatedMeetingType {
  @statusCode
  statusCode: 201;

  ...MeetingType;
}

/** Успешное бронирование слота. */
model CreatedMeeting {
  @statusCode
  statusCode: 201;

  ...Meeting;
}

@route("/api/meeting-types")
interface MeetingTypes {
  /** Список типов встреч: по времени создания, новые сверху. */
  @get
  listTypes(): MeetingType[];

  /** Создать тип встречи. */
  @post
  createType(...MeetingTypeInput): CreatedMeetingType;

  /** Изменить тип встречи. */
  @put
  @route("{id}")
  updateType(@path id: string, ...MeetingTypeInput): MeetingType | NotFoundError;

  /** Удалить тип встречи. */
  @delete
  @route("{id}")
  deleteType(@path id: string): void | NotFoundError;

  /** Свободные старты слотов в окне записи, UTC. */
  @get
  @route("{typeId}/slots")
  listSlots(@path typeId: string): utcDateTime[] | NotFoundError;
}

@route("/api/bookings")
interface Bookings {
  /** Забронировать свободный слот. */
  @post
  create(...BookingInput): CreatedMeeting | NotFoundError | ConflictError;
}

@route("/api/meetings")
interface Meetings {
  /** Предстоящие встречи владельца по всем типам. */
  @get
  list(): Meeting[];
}
