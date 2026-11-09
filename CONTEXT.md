# Контекст проекта react-sandbox

Песочница на React + TypeScript + Vite с одним рабочим разделом — TODO-листом
(`/todo-list`). Данные хранятся в `db.json` и отдаются `json-server` по REST.
Своего бэкенда и тестов нет. Серверное состояние кэширует TanStack Query,
глобального стора (Redux) нет — локальный UI-стейт живёт в `useState`.

Состояние на момент написания: `npm run lint` и `npm run build` проходят без ошибок.

---

## 1. Стек

| Что                   | Версия / детали                                          |
| --------------------- | -------------------------------------------------------- |
| React / ReactDOM      | 19.2                                                     |
| react-router          | 7.18 (`BrowserRouter`, `Routes`, `Route`, `Outlet`)      |
| Vite                  | 8.3, плагин `@vitejs/plugin-react`                       |
| TypeScript            | ~6.0, strict-настройки в `tsconfig.app.json`             |
| @floating-ui/react    | 0.27 — позиционирование выпадающего меню `Dropdown`      |
| @tanstack/react-query | 5.105 — кэш серверного состояния (список задач, мутации) |
| json-server           | 1.0.0-beta — мок-API на `http://localhost:3000`          |
| Стили                 | CSS Modules + CSS-переменные в `src/index.css`           |
| Линт / формат         | ESLint 10 (flat config) + Prettier 3.9                   |

Алиасов путей нет — только относительные импорты.

---

## 2. Команды

```bash
npm run dev      # Vite dev-сервер (HMR)
npm run server   # json-server --watch db.json на :3000  ← нужен для работы UI
npm run build    # tsc -b && vite build (type-check + сборка)
npm run lint     # eslint .
npm run lint:fix
npm run format   # prettier --write
npm run format:check
npm run preview
```

Для локальной проверки изменений: `npm run lint && npm run build`.
E2E/юнит-тестов нет.

---

## 3. Структура

```
db.json                     # «база»: { todos: Todo[] }, 13 демо-записей
vite.config.ts              # только плагин react
eslint.config.js            # flat config, см. §7
src/
  main.tsx                  # StrictMode → ErrorBoundary → QueryClientProvider → BrowserRouter → RoutesConfig + App
  App.tsx                   # только <Outlet /> (layout-заглушка)
  RoutesConfig.tsx          # маршруты: `/` → redirect, `/todo-list` → TodoPage, `*` → NotFoundPage
  index.css                 # CSS-переменные (цвета, радиусы, тени, размеры шрифта)
  api/
    client.ts               # fetch-обёртка: get/post/put/patch/delete
    todoApi.ts              # CRUD + серверная фильтрация через _where + ключи кэша todoKeys
  features/
    index.ts                # баррель фич: export { default as TodoList } ...
    todo/
      model/
        types.ts            # Status, Priority, Todo, TodoFormData
        consts.ts           # STATUSES / PRIORITIES (для селектов) + *_LABELS
        useTodoList.ts      # загрузка, фильтры, сортировка, save/delete
      ui/
        TodoList.tsx        # контейнер страницы: поиск, фильтры, таблица, модалка
        TodoTable.tsx       # описание колонок для shared/Table + Dropdown с действиями
        TodoForm.tsx        # RHF-форма (title, description, status, priority)
        TodoEditModal.tsx   # Modal + TodoForm + кнопки футера
        *.module.css
  pages/
    todo/TodoPage.tsx       # рендерит <TodoList />
    not-found/NotFoundPage.tsx # 404 + ссылка на /todo-list
  shared/
    index.tsx               # баррель: export * from './ui'; export * from './lib'
    lib/
      index.ts              # баррель lib
      date.ts               # formatDate → dd.mm.yyyy
      sort.ts               # SortState, getNextSort
      useToggleList.ts      # хук мультивыбора (items + toggle)
      useDebouncedValue.ts  # debounce значения (поиск)
    ui/
      index.tsx             # баррель UI-компонентов
      Button, Input, Textarea, Select, MultiSelect,
      Table, Dropdown, Modal (+useModal), DatePicker, DatePickerRange,
      ErrorBoundary
```

> Баррели есть у `shared` и `features`; `src/pages/index.ts` отсутствует —
> страницы импортируются в `RoutesConfig` напрямую.

---

## 4. Точка входа и маршрутизация

`src/main.tsx` рендерит `<ErrorBoundary>` → `<QueryClientProvider>` →
`<BrowserRouter>`, внутри которого два сиблинга: `<RoutesConfig />`
(объявление маршрутов) и `<App />` (просто `<Outlet />`). `ErrorBoundary`
ловит ошибки рендера и показывает fallback с кнопкой перезагрузки.
Маршруты объявлены без вложенности, поэтому `App` фактически ничего не
оборачивает — общий layout нужно добавлять через вложенные `Route`/`element`.

Сейчас: `/` редиректит на `/todo-list` → `TodoPage` → `TodoList`; неизвестный
путь рендерит `NotFoundPage` (маршрут `*`).

Добавление страницы: файл в `src/pages/...` + запись в `src/RoutesConfig.tsx`.

---

## 5. Слой данных

### API-клиент (`src/api/client.ts`)

- `BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'` — значение
  задаётся в `.env` (шаблон — `.env.example`), фолбэк оставлен для чистого клона.
- `request<T>` ставит `Content-Type: application/json`, сериализует `body`,
  прокидывает `AbortSignal`, при `204` возвращает `null`.
- При `!response.ok` тело читается и достаётся `message` или `error`
  (json-server отдаёт `{ "error": "Not Found" }`); если тела нет —
  `Ошибка запроса: <status> <statusText>`.
- `api.get<T>(endpoint, signal?, schema?)`, `post<T>`, `put<T>`, `patch<T>`
  (все принимают необязательную zod-схему), `delete` (→ `null`).

### `todoApi` (`src/api/todoApi.ts`)

- `getAll(params?, signal?)` — собирает json-server-синтаксис `_where`:
    - `search` → `title: { contains }`
    - `statuses` → `status: { in: [...] }`
    - `priorities` → `priority: { in: [...] }`
    - `createdAt` (массив из 1–2 дат `YYYY-MM-DD`) → `createdAt: { gte, lte }`,
      границы разворачиваются в ISO: `T00:00:00.000` и `T23:59:59.999` (локальное время).
- `create(todo: Omit<Todo, 'id'>)` — id генерирует сервер, ответ используется как
  источник истины; `update(todo)` (`PATCH /todos/:id` с полным объектом),
  `delete(id)`.
- `todoKeys` — ключи кэша: `all = ['todos']` (префикс для инвалидации) и
  `list(params) = ['todos', 'list', params]` (конкретный набор фильтров).

---

## 6. Модель и поток данных

```ts
type Status = 'waiting' | 'pending' | 'ready'
type Priority = 'low' | 'medium' | 'high'
interface Todo {
	id
	title
	description
	status
	createdAt /* ISO */
	priority
}
type TodoFormData = Omit<Todo, 'id' | 'createdAt'>
```

- Человекочитаемые подписи — `STATUS_LABELS` / `PRIORITY_LABELS`
  (`consts.ts`), там же дублирующие массивы `STATUSES` / `PRIORITIES`
  в формате `{ value, key }` для `Select`/`MultiSelect`.
- `useTodoList` — связка TanStack Query и локального UI-стейта:
    - `search`, `sort`, `actionError` — обычный `useState`; фильтры
      (`statuses`/`priorities`/`createdAt`) приходят сверху.
    - Поиск проходит через `useDebouncedValue` (400 мс, пустой — 0 мс).
    - `useQuery` с ключом `todoKeys.list(params)` и `queryFn: ({ signal }) =>
todoApi.getAll(params, signal)`; отмена запроса — на стороне Query.
    - `placeholderData: keepPreviousData` — при смене фильтров показывается
      предыдущий список, без мигания.
    - `useMutation` для сохранения (`POST`/`PATCH`) и удаления; в `onSuccess` —
      `invalidateQueries({ queryKey: todoKeys.all })`, после чего активный
      запрос перезагружается сам.
    - `saveTodo(data, todo?)` возвращает `Promise<void>`; для редактирования
      принимает исходный `Todo` из `editModal.data` и сохраняет его `createdAt`,
      поэтому дата создания не зависит от текущего отфильтрованного списка.
      Модалка закрывается только при успехе; `actionError` показывается баннером
      вместе с `todosQuery.error`.
    - `sort` уходит на сервер вместе с фильтрами (`_sort`), клиентской
      пересортировки нет.
    - Настройки кэша по умолчанию (в `main.tsx`): `staleTime: 30_000`,
      `retry: 1`.

### UI-поток `TodoList`

```
useModal<Todo>() ── editModal.open(todo) / open()  → TodoEditModal
useToggleList<Status>()  ─┐
useToggleList<Priority>() ├→ useTodoList → todos → TodoTable
useState<string[]>() ─────┘
```

`TodoTable` описывает колонки декларативно через `Table.Column`
(`title`, `status`, `priority`, `createdAt`, `actions`), сортировка по
`title` и `createdAt`, действия — `Dropdown` с пунктами «Редактировать»/«Удалить».

`TodoForm` построен на `react-hook-form` + `zodResolver(todoFormSchema)`.
`TodoEditModal` создаёт форму через `useTodoForm`, оборачивает её в
`FormProvider`, а кнопка сабмита находится в футере `Modal` (`type="submit"`,
форма передаётся через `formProps`). Валидация: `title` после `trim()` не пустой,
выбраны `status` и `priority`. Ошибка сервера выводится в `errors.root`;
модалка не закрывается, введённые данные не теряются.

---

## 7. Конвенции

### TypeScript (`tsconfig.app.json` — сборка падает при нарушении)

- `strict: true`, `noUncheckedIndexedAccess: true` → проверка `null/undefined`
  и индексации массивов.
- `verbatimModuleSyntax: true` → типы только через `import type`.
- `erasableSyntaxOnly: true` → без enum/namespace/parameter properties.
- `noUnusedLocals`, `noUnusedParameters` → не держать мёртвый код;
  для намеренно неиспользуемых параметров в ESLint разрешён префикс `_`.
- `jsx: react-jsx`, `moduleResolution: bundler`, `target: ES2023`.

### ESLint (`eslint.config.js`)

- `js.configs.recommended` + `tseslint.configs.recommended` +
  `reactHooks.configs.flat.recommended` + `reactRefresh.configs.vite`.
- `react-refresh/only-export-components` — **error**: файл с компонентом может
  экспортировать только компоненты. Исключение сделано для `**/index.ts(x)`
  (баррели), новых баррелей достаточно просто назвать `index.ts`.
- Prettier-конфликтующие правила отключены через `eslint-config-prettier`.

### Форматирование (`.prettierrc`)

Табы, без точек с запятой, одинарные кавычки, `printWidth: 100`,
`trailingComma: all`, `arrowParens: avoid`, LF.

### Стили

- CSS Modules рядом с компонентом: `Component.module.css`.
- Цвета/радиусы/шрифты — только через переменные из `src/index.css`
  (`--primary`, `--secondary`, `--color-error`, `--border-primary`, `--surface-*`,
  `--button-color-*`, `--border-radius-s/m`, `--font-size-m/l`).
- Классы собираются шаблонными строками (без `clsx`/`classnames`).

---

## 8. Публичный API shared-компонентов

| Компонент                                    | Ключевые пропсы / поведение                                                                                                                                                                                                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                                     | `variant?: 'primary' \| 'secondary'`, `ref` прокидывается (`ComponentPropsWithRef<'button'>`); дефолтный `type` не задан — внутри форм указывать `type` явно                                                                                                                          |
| `Input`                                      | обёртка над `<input>` (`ComponentPropsWithRef<'input'>`, `ref` и `type` пробрасываются, `className` мержится со стилями инпута)                                                                                                                                                       |
| `Textarea`                                   | форвардит все пропсы `<textarea>` (включая `name`, `id`, `rows`, `ref`)                                                                                                                                                                                                               |
| `Select<T>`                                  | одиночный выбор: `items: { key, value }[]`, `selected`, `onSelect`, встроенный поиск по `value`, закрытие по blur/по выбору; `SelectKey = string \| null`                                                                                                                             |
| `MultiSelect<T>`                             | мультивыбор: `selected: T['key'][]`, `onSelect` вызывается и для добавления, и для удаления чипа; выбранные скрываются из списка                                                                                                                                                      |
| `Table<T>`                                   | декларативные колонки: `Table.Column<T field title sortable render id>`, пропсы `data`, `rowKey`, `sort`, `onSortChange`, `emptyText`; при пустых данных шапка остаётся, а в `tbody` выводится одна ячейка с `emptyText`; сортировка циклична `asc → desc → null` через `getNextSort` |
| `Dropdown<T>`                                | кнопка-триггер (`children`) + список `{ key, label, handler }[]`; позиционирование `@floating-ui`, закрытие по клику вне                                                                                                                                                              |
| `Modal`                                      | портал в `document.body`, `title`, `footer`, `width` (px), закрытие по оверлею, кнопке «x» и `Escape`                                                                                                                                                                                 |
| `ErrorBoundary`                              | ловит ошибки рендера и показывает fallback с кнопкой перезагрузки                                                                                                                                                                                                                     |
| `useModal<T>()`                              | `{ isOpen, data, open(data?), close(data?) }`; `data` — контекст модалки (например, редактируемая сущность)                                                                                                                                                                           |
| `useToggleList<T>()`                         | `{ items, toggle }` — мультивыбор для фильтров                                                                                                                                                                                                                                        |
| `DatePicker`                                 | одиночная дата, значение в ISO `YYYY-MM-DD`, маска ввода `ДД.ММ.ГГГГ`, календарь, «Очистить»/«Сегодня», поддержка controlled/uncontrolled                                                                                                                                             |
| `DatePickerRange`                            | диапазон `string[]` (0–2 ISO-даты, нормализуются и сортируются), подсветка диапазона, hover-превью                                                                                                                                                                                    |
| `formatDate`                                 | ISO/Date → `dd.mm.yyyy` (локально; `YYYY-MM-DD` трактуется как календарная дата)                                                                                                                                                                                                      |
| `getNextSort` / `SortState<T>`               | цикл сортировки `asc → desc → null`; сервер получает поле и направление через `_sort`                                                                                                                                                                                                 |

Импорт: `import { Table, Modal, useModal, formatDate } from '../../../shared'`.

---

## 9. Особенности и оставшиеся ограничения

Проверено на реальном `json-server` 1.0.0-beta: `POST /todos` **всегда**
перезаписывает `id` своим (`randomId`), `PATCH` возвращает обновлённую запись,
404 отдаёт `{ "error": "Not Found" }`, `_where` поддерживает `contains`/`in`/`gte`/`lte`.
Поэтому клиентский id не генерируется, а состояние берётся из ответа.

1. **`StrictMode` в dev** монтирует компоненты дважды, но TanStack Query
   дедуплицирует одинаковые запросы, поэтому лишних сетевых вызовов нет.
2. **Сортировка и фильтрация — на сервере**: `_where` + `_sort`; клиент хранит
   только `SortState` и передаёт его в параметры/ключ запроса.
3. **Нет пагинации** и виртуализации: список задач грузится целиком.
4. **Нет навигации/меню** — единственная страница доступна по `/todo-list`,
   `/` редиректит туда.
5. **`_where` — расширение json-server**, а не стандартный REST-фильтр:
   при смене бэкенда `todoApi.getAll` придётся переписать.
6. **Нет оптимистичных обновлений**: после мутации строка появляется/исчезает
   только после `invalidateQueries` + повторного GET.
7. **Кэш живёт 30 секунд** (`staleTime`): изменения с другого клиента не
   подтянутся, пока данные не устареют или не сработает refetch по фокусу.
8. **Devtools подключены** — `ReactQueryDevtools` в `main.tsx`.
9. **404 и ErrorBoundary**: неизвестный маршрут рендерит `NotFoundPage`,
   ошибки рендера ловит `ErrorBoundary`.

---

## 10. Куда расширять

- **Новая сущность**: `src/features/<name>/{model,ui}`, типы и константы в
  `model`, хук с `useQuery`/`useMutation` по образцу `useTodoList`, API-модуль в
  `src/api` (+ `*Keys` для кэша), данные — в `db.json`, баррель-экспорт в
  `src/features/index.ts`.
- **Новый серверный запрос**: ключ в `todoKeys`-подобном объекте, `useQuery`
  с этим ключом; после мутаций — `invalidateQueries` по общему префиксу.
- **Новая страница**: `src/pages/<name>/<Name>Page.tsx` + маршрут в
  `RoutesConfig.tsx`; при появлении общего каркаса — вложенные `Route`
  с layout-элементом (сейчас `App` пустой).
- **Новый UI-примитив**: папка в `src/shared/ui/<Name>/` с `Name.tsx` +
  `Name.module.css`, экспорт из `src/shared/ui/index.tsx` (баррель, поэтому
  правило `react-refresh` не мешает экспортировать типы).
- **Сеть**: `BASE_URL` берётся из `VITE_API_URL` (`.env`, шаблон `.env.example`);
  при смене порта json-server достаточно поправить `.env`.
