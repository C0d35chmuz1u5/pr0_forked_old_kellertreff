# KT BE

## Local Development
All the following steps are in the server directory (the one this readme is located).

### Generate Session Encryption
TODO

### Init Database
```shell
sqlite3 KT.db < schema/schema.sql
```

If you also need some stub data, import it using this line:
```shell
sqlite3 KT.db < schema/schema-mock-data.sql
```

## Install Dependencies
```shell
npm ci
```

## Compile and Run
Watch mode:
```shell
npm run watch
```

Compile and run without reload:
```shell
npm run build
npm start
```

# Licensing
See LICENSE file.
Geo location data is provided by [zauberware](https://github.com/zauberware/postal-codes-json-xml-csv).
