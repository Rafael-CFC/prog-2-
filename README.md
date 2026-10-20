# Vitrine Comunitária de Garopaba — Roteiro 05 (Flask & SQLite)

ProgWeb 2 — CST em Sistemas para a Internet — IFSC Garopaba

Refatoração da Vitrine de Serviços para arquitetura cliente-servidor: backend RESTful em Flask
com SQLite (`vitrine.db`), frontend consumindo a API via Fetch (`async/await`) e contingência
offline em `localStorage` quando a API não responde.

## Estrutura

```
backend/
  app.py              # API REST (GET/POST/PUT/DELETE /api/servicos, GET /api/status)
  requirements.txt    # Flask, flask-cors
  vitrine.db          # gerado automaticamente no 1º run (não versionado)
styles.css
js/
  services/vitrineService.js   # Fetch API + fallback LocalStorage
  views/vitrineView.js         # cards, spinner, badge de conexão, toasts
  utils/formatters.js          # funções puras (inalterado do Roteiro 04)
  main.js                      # orquestrador assíncrono
index.html
mini-exemplos/                 # Parte 1: pílulas 1–4 com os mini desafios resolvidos
```

## Como executar

```bash
cd backend
python -m venv venv
# Windows PowerShell: .\venv\Scripts\Activate.ps1   |   Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Abra o `index.html` com o Live Server (`http://127.0.0.1:5500/index.html`).

- **API online:** badge "Backend Online (Flask + SQLite)" e cadastros gravados no SQLite.
- **API desligada (Ctrl+C) ou GitHub Pages:** badge "Modo Offline (LocalStorage)" e os cards
  continuam sendo exibidos a partir do cache local.
