import type en from "./en";

const ru: Record<keyof typeof en, string> = {
	"common.cancel": "Отмена",
	"common.create": "Создать",
	"common.remove": "Удалить",
	"common.reset": "Сбросить",
	"common.close": "Закрыть",

	"view.displayName": "Граф людей",
	"view.ribbonTooltip": "Открыть граф людей",
	"view.openCommand": "Открыть граф людей",
	"view.exportAction": "Экспорт в PNG",
	"view.filterAction": "Фильтры",
	"view.defaultCenterLabel": "Вы",
	"view.emptyTitle": "Люди не найдены",
	"view.emptyBody": "Ищутся заметки с тегом «#{{value}}».",
	"view.emptyHint": "Убедитесь, что в заметках есть подходящий frontmatter, например:",
	"view.notice.exportFailed": "Экспорт не удался — пока нечего экспортировать.",
	"view.notice.exportSuccess": "Граф экспортирован в PNG.",

	"bases.viewName": "Граф людей",

	"tooltip.company": "Компания: {{value}}",
	"tooltip.relation": "Связь: {{value}}",
	"tooltip.position": "Показатель позиции: {{value}}/10",
	"tooltip.ghostHint": "Заметки ещё нет — нажмите, чтобы создать",

	"panel.searchPlaceholder": "Поиск людей…",
	"panel.replayAnimation": "Повторить анимацию появления",
	"panel.resetTooltip": "Восстановить настройки по умолчанию",
	"panel.filtersHeading": "Фильтры",
	"panel.relationHeading": "Тип связи",
	"panel.companyHeading": "Компания",
	"panel.displayHeading": "Отображение",
	"panel.showEdges": "Показывать связи",
	"panel.showGhosts": "Показывать потенциальные контакты",
	"panel.forcesHeading": "Силы",
	"panel.linkDistance": "Длина связей",
	"panel.repulsion": "Сила отталкивания",
	"panel.linkStrength": "Сила связей",
	"panel.centerStrength": "Сила притяжения",
	"panel.nodeSize": "Размер узлов",
	"panel.edgeThickness": "Толщина связей",

	"ghost.confirmTitle": "Создать заметку для «{{name}}»?",
	"ghost.confirmBody":
		"«{{name}}» указан(а) как потенциальный контакт, но своей заметки ещё нет. Создать сейчас?",
	"ghost.noticeCreated": "Заметка для «{{name}}» создана.",
	"ghost.noticeFailed": "Не удалось создать заметку для «{{name}}».",
	"photo.cropSquare": "Настроить обрезку фото",
	"photo.editorTitle": "Выберите отображаемый квадрат",
	"photo.editorHint": "Перетаскивайте фотографию внутри квадрата и настройте масштаб.",
	"photo.zoom": "Масштаб",
	"photo.saveCrop": "Сохранить область отображения",
	"photo.cropSuccess": "Область отображения фотографии сохранена.",
	"photo.cropFailed": "Не удалось создать квадратное фото.",
	"warning.multipleSelf": "Несколько людей отмечены is_self: {{value}}",
	"warning.duplicateNames": "Повторяющиеся имена людей: {{value}}",
	"warning.unknownRoles": "Неизвестные роли используют стиль по умолчанию: {{value}}",

	"settings.personDetectionHeading": "Определение людей",
	"settings.personDetectionDesc": "Определяет, какие заметки хранилища считаются людьми.",
	"settings.personTag.name": "Тег распознавания",
	"settings.personTag.desc":
		"Заметка попадает в граф, если у неё есть этот тег. Существующие теги подсказываются при вводе.",
	"settings.nameField.name": "Поле имени",
	"settings.nameField.desc": "Поле frontmatter для отображаемого имени (иначе — имя файла).",
	"settings.photoField.name": "Поле фото",
	"settings.photoField.desc": "Поле frontmatter с путём к фото внутри хранилища.",
	"settings.relationField.name": "Поле типа связи",
	"settings.relationField.desc": "Поле frontmatter с названием роли этого человека — см. «Роли» ниже.",
	"settings.potentialContactsField.name": "Поле контактов",
	"settings.potentialContactsField.desc":
		"Списочное поле frontmatter с ФИО людей. Имя с собственной заметкой становится линией связи; имя без заметки отображается призрачным узлом.",
	"settings.excludePaths.name": "Исключить пути",
	"settings.excludePaths.desc": "Папки/файлы через запятую, которые нужно пропускать.",

	"settings.rolesHeading": "Роли",
	"settings.rolesDesc":
		"Каждая роль задаёт цвет и стиль обводки, а также насколько близко человек находится к центру (1–10).",
	"settings.newRolePlaceholder": "Название роли (напр. друг)",
	"settings.addRole": "Добавить роль",
	"settings.defaultRoleName": "По умолчанию (не задано / не совпало)",
	"settings.resetRolesTooltip": "Сбросить все роли к значениям по умолчанию",
	"settings.resetRolesConfirmTitle": "Сбросить роли к значениям по умолчанию?",
	"settings.resetRolesConfirmBody":
		"Это заменит все ваши роли и цвет/стиль роли «по умолчанию» встроенными значениями плагина. Действие нельзя отменить.",
	"settings.ringStyle.solid": "Сплошная",
	"settings.ringStyle.dashed": "Пунктирная",
	"settings.ringStyle.dotted": "Точечная",

	"settings.generalHeading": "Общее",
	"settings.generalDesc": "Общий вид графа.",
	"settings.centerLabel.name": "Подпись центрального узла",
	"settings.centerLabel.desc": "Используется для центрального узла, если ни одна заметка не помечена is_self.",
	"settings.enableBases.name": "Интеграция с Bases",
	"settings.enableBases.desc":
		"Предлагать граф как вид внутри Bases (требуется включённый core-плагин Bases).",
	"settings.enableBases.reloadNotice": "Перезапустите плагин (или Obsidian), чтобы применить.",

	"settings.newNoteHeading": "Новые заметки из потенциальных контактов",
	"settings.newNoteDesc": "Используется при клике на потенциальный контакт, у которого ещё нет заметки.",
	"settings.newNoteFolder.name": "Папка для новых заметок",
	"settings.newNoteFolder.desc": "Пусто — заметка создаётся в корне хранилища.",
	"settings.newNoteTemplatePath.name": "Заметка-шаблон",
	"settings.newNoteTemplatePath.desc":
		"Выберите существующую заметку, чьё содержимое станет шаблоном frontmatter; пусто — используется встроенный шаблон по умолчанию. Используйте {{name}} внутри неё как подстановку имени человека.",
	"settings.newNoteTemplatePath.placeholder": "Поиск заметки…",
	"settings.author.title": "Нравится плагин?",
	"settings.author.body": "Поддержите проект или подпишитесь",
};

export default ru;
