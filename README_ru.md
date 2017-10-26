# jnclude

[English readme](https://github.com/capinemo/jnclude/blob/master/README.md)

_**Jnclude**_ позволяет собрать файл приложения из нескольких файлов с исходным кодом и вырезать код, не используемый в рабочей версии. Использование флагов дает возможность собрать несколько версий приложения с разной логикой или оставить в рабочей версии узкоспециализированный отладочный код для тестирования определенного алгоритма.

## Начало работы
1. Установить [node.js](https://nodejs.org/en/) 
2. В консоли установить _**jnclude**_ глобально с помощью команды:
```
npm install jnclude -g
```
3. Для получения справки по использованию _**jnclude**_ выполнить в консоли:
```
jnclude -h
```
4. Запуск _**jnclude**_ осуществляется с помощью команды:
```
jnclude -in=path/source.js -out=path/destination.js [options]
```

## Опции запуска
`-in=/path/src_name` - Указать название основного файла с исходным кодом.

`-out=/path/dest_name` - Указать название файла сборки. Если каталог не указан, файл создается в каталоге файла с исходным кодом. Если каталог файла с исходным кодом содержит файл с аналогичным названием работа _**jnclude**_ завершится ошибкой.

`-flag="flag_1 [other_flags]"` - Активизирует флаги указанные после директив. Если передана эта опция, директивы без флагов или с несовпадающими флагами **работать не будут**.

`-develop` - При передаче данной опции все директивы `exclude` работать не будут.

`-fullinfo` - Отображает подробную информацию по завершении работы.
```
Jnclude done!
Done: 449.801ms
CPU usage:  { user: 15000, system: 0 }
Memory usage:
 { rss: 20500480,
  heapTotal: 8421376,
  heapUsed: 3805416,
  external: 8380 }
Loaded files:
    src/core.js - 1 times
    src/source.js - 1 times
```
без флага `-fullinfo`
```
Jnclude done!
Loaded files:
    src/core.js - 1 times
    src/source.js - 1 times
```

## Директивы
1. **include** - копирует содержимое указанного файла и вставляет вместо директивы **с сохранением отступов от начала строки**
```js
    //>include(002.js) dev pro
____|_________|______| _______
 1        2      3        4
```
**где:** 1 - отступ, 2 - директива, 3 - имя включаемого файла, 4 - флаги


2. **include_once** - проверяет - не был ли указанный файл ранее включен в сборку и копирует его содержимое с вставкой вместо директивы. Если файл был включен раньше, директива игнорируется.
```js
    //>include_once(002.js) dev
```

3. **exclude** - удаляет код между директивами `exclude` и `/exclude` если не передана опция `-develop`.
```js
    //>exclude pro
        alert(error);
    //>/exclude
```

## Запуск
```
jnclude -in=src/main.js -out=build/result.js
jnclude -in=src/main.js -out=build/result.js -develop -flag="dev_1 dev_2 pro"
jnclude -in=src/main.js -out=build/result.js -flag="pro" -fullinfo
```

## Пример
_sample/main.js_
```js
console.log(1);
//>include(add.js) dev
    //>exclude pro
        console.log(4);
    //>/exclude
//>include_once(add.js) dev pro
```

_sample/add.js_
```js
console.log(2);
//>include_once(appendix.js) dev
```

_sample/appendix.js_
```js
    console.log(3);
```

run `jnclude -in=sample/main.js -out=sample/result.js`

_sample/result.js_
```js
console.log(1);
console.log(2);
    console.log(3);   

```

run `jnclude -in=sample/main.js -out=sample/result.js -develop`

_sample/result.js_
```js
console.log(1);
console.log(2);
    console.log(3);
        console.log(4);

```

run `jnclude -in=sample/main.js -out=sample/result.js -flag="dev"`

_sample/result.js_
```js
console.log(1);
console.log(2);
    console.log(3);
        console.log(4);

```

run `jnclude -in=sample/main.js -out=sample/result.js -flag="pro"`

_sample/result.js_
```js
console.log(1);
console.log(2);

```
