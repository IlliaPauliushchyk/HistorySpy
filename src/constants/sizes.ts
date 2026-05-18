/**
 * Константы для размеров элементов UI
 */
export const FONT_SIZES = {
  ROLE_TEXT: 56, // Размер текста роли на карточке
  FIRST_PLAYER_NUMBER: 72, // Размер номера первого игрока
  EMOJI: 24, // Размер эмодзи
} as const;

export const BORDER_RADIUS = {
  CARD: 16, // Радиус скругления карточек
  SMALL: 8, // Малый радиус скругления
  MEDIUM: 12, // Средний радиус скругления
  CIRCLE: 15, // Радиус для круглых элементов
} as const;

export const BORDER_WIDTH = {
  CARD: 20, // Толщина рамки карточки
  CARD_BACK: 8, // Толщина рамки обратной стороны карточки
} as const;

export const PADDING = {
  SMALL: 12, // Малый отступ
  MEDIUM: 16, // Средний отступ
  LARGE: 20, // Большой отступ
  EXTRA_LARGE: 24, // Очень большой отступ
  MODAL: 24, // Отступ для модальных окон
} as const;

export const MARGIN = {
  SMALL: 8, // Малый отступ
  MEDIUM: 16, // Средний отступ
  LARGE: 20, // Большой отступ
  EXTRA_LARGE: 40, // Очень большой отступ
} as const;

export const SHADOW = {
  OFFSET: { width: 0, height: 8 }, // Смещение тени
  RADIUS: 16, // Радиус размытия тени
  OPACITY: 0.5, // Прозрачность тени
  ELEVATION: 12, // Высота для Android
} as const;

export const TEXT_SHADOW = {
  COLOR: 'rgba(0, 0, 0, 0.3)', // Цвет тени текста
  OFFSET: { width: 2, height: 2 }, // Смещение тени текста
  RADIUS: 4, // Радиус размытия тени текста
} as const;

export const PICKER_SIZES = {
  VALUE_CONTAINER: 80, // Размер контейнера значения в пикерах
} as const;

export const STEP_NUMBER_SIZE = {
  WIDTH: 32, // Ширина номера шага
  HEIGHT: 32, // Высота номера шага
  RADIUS: 16, // Радиус скругления (половина размера для круга)
} as const;

export const BUTTON_SIZES = {
  HEIGHT: 45, // Высота кнопки
  MIN_WIDTH: 200, // Минимальная ширина кнопки
} as const;

export const TIMER_SIZES = {
  CIRCLE: 240, // Размер круга таймера
  CIRCLE_RADIUS: 112, // Радиус круга таймера
  STROKE_WIDTH: 16, // Толщина линии круга
} as const;
