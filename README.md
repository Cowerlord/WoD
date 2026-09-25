# Становление Сородича

Мастер создания персонажа V:tM × D&D 5e: пошаговое создание, лист и шпаргалка на А4, правила, аккаунты игроков.

Сайт: https://cowerlord.github.io/WoD/ — обновляется сам после `git push` в `main` (GitHub Actions).

## Запуск у себя

```bash
npm install
npm run dev      # http://localhost:5173, изменения видны сразу
npm run build    # сборка в dist/
```

## Где что лежит

| Что поменять | Файл |
|---|---|
| Кланы, их способности, слабости и навык клана | `src/data/clans.js` |
| Дисциплины: полные тексты (`levels`), короткие для листа (`short`), атаки, пассивки | `src/data/disciplines.js` |
| Оружие, мастерство, дистанции, Сложность скрытого ношения | `src/data/weapons.js` |
| Броня | `src/data/armor.js` |
| Навыки | `src/data/skills.js` |
| Урон, ранения, лечение, скорость | `src/data/combat.js` |
| Зверь, Узы Крови, шкала Человечности | `src/data/beast.js` |
| Питание | `src/data/feeding.js` |
| Поколения, Интенсификация Крови | `src/data/blood.js` |
| Числа системы (HP, КД, ПК, массив характеристик, лимиты) | `src/data/config.js` |
| Формулы (HP, КД, попадание, скрытность, проверки шагов) | `src/character/rules.js` |
| Шаги мастера | `src/components/wizard/` |
| Лист персонажа и шпаргалка | `src/components/sheet/` |
| Разделы вкладки «Правила» | `src/components/rules/` |
| Мои / все персонажи | `src/components/roster/` |
| Оформление: тема, лист, печать | `src/styles/` |
| Вход и сохранение на сервер | `src/stores/`, `src/api/` |

Правила игры — [RULES.md](RULES.md).

## Аккаунты

База — Supabase, схема и права — `supabase/schema.sql`. Регистрации на сайте нет, аккаунты создаются в Supabase → SQL Editor:

```sql
select private.create_player('Ник', 'пароль');             -- игрок
select private.create_player('Ник', 'пароль', 'admin');    -- админ
select private.set_password('Ник', 'новый-пароль');
```
