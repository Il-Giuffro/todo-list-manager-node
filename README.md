# todo-list-manager-node

Progetto Node.js semplice per gestire piu liste di cose da fare.

## Funzionalita

- creare una lista
- visualizzare tutte le liste
- visualizzare una singola lista
- modificare una lista
- eliminare una lista
- creare un elemento dentro una lista
- visualizzare tutti gli elementi di una lista
- visualizzare un singolo elemento
- modificare un elemento
- eliminare un elemento
- cambiare lo stato di un elemento tra `todo` e `done`

## Tecnologie usate

- Node.js
- Express
- SQLite
- HTML
- JavaScript

## Struttura progetto

- `backend/`: server e API
- `frontend/`: pagina HTML e JavaScript
- `database/`: database SQLite

## Avvio del progetto

1. installare le dipendenze con `npm install`
2. avviare il backend con `npm start`
3. aprire `frontend/index.html` con Live Server oppure con `npm run frontend`

Il backend parte su `http://localhost:3000`.

## Tabelle del database

### lists

- `id`
- `title`
- `description`

### list_items

- `id`
- `list_id`
- `text`
- `status`

## Note

Il progetto e stato tenuto volutamente semplice, con codice base e senza CSS, per essere facile da leggere e spiegare.
