# Radar de Sinais — Angular + .NET

Mesmo app do artifact, só que como projeto de verdade: front Angular
separado do back .NET, comunicando por HTTP.

```
projeto/
├── backend/RadarApi/     → API .NET (ASP.NET Core Web API)
└── frontend/             → Angular (standalone components)
```

## Pré-requisitos

- [.NET SDK 10](https://dotnet.microsoft.com/download) (`dotnet --version`) — LTS
- [Node.js 20.19+](https://nodejs.org) (recomendado usar a LTS mais recente) e npm
- Angular CLI 22: `npm install -g @angular/cli@22`

Este projeto usa **Angular 22**, que já vem **zoneless por padrão** (sem
`zone.js` — a detecção de mudanças roda em cima de `signal()`), e
**.NET 10**, a versão LTS atual do .NET.

## 1. Rodar o backend

```bash
cd backend/RadarApi
dotnet restore
dotnet run
```

A API sobe em `http://localhost:5199`. Com o ambiente de desenvolvimento
ativo, o Swagger abre automaticamente em `http://localhost:5199/swagger`
— útil pra testar os endpoints sem precisar do front.

Endpoints disponíveis (`/api/signals`):

| Método | Rota              | O que faz          |
|--------|--------------------|---------------------|
| GET    | /api/signals        | lista todos os sinais |
| GET    | /api/signals/{id}   | busca um sinal       |
| POST   | /api/signals         | cria um sinal        |
| PUT    | /api/signals/{id}   | edita um sinal       |
| DELETE | /api/signals/{id}   | remove um sinal      |

Os dados ficam **em memória** — reiniciar o `dotnet run` reseta pro
exemplo inicial. É de propósito, pra você trocar por um banco de verdade
quando quiser (ver seção abaixo).

## 2. Rodar o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm start
```

Abre em `http://localhost:4200`. O `proxy.conf.json` já está configurado
pra redirecionar chamadas `/api/*` pro backend em `localhost:5199`, então
não tem CORS pra se preocupar em dev.

## Estrutura do backend

- `Models/Signal.cs` — a entidade e o enum de status
- `Data/InMemorySignalStore.cs` — onde os dados moram hoje (troque aqui
  quando plugar um banco)
- `Controllers/SignalsController.cs` — os endpoints REST
- `Program.cs` — configuração (CORS, Swagger, serialização)

## Estrutura do frontend

- `src/app/models/signal.ts` — os tipos TypeScript
- `src/app/services/signal.service.ts` — chamadas HTTP pra API
- `src/app/app.component.ts/.html/.css` — a tela inteira (lista, filtros,
  formulário lateral)
- `src/main.ts` — bootstrap com `provideZonelessChangeDetection()`

### Por que signals no componente?

Sem `zone.js`, o Angular só sabe que precisa re-renderizar a tela quando:
um `signal()` muda de valor, um evento do próprio Angular dispara (clique,
`ngModelChange` etc.), ou alguém chama `markForCheck()` manualmente. Uma
resposta de API chegando dentro de um `.subscribe()` não é nada disso —
por isso o estado que depende de chamadas HTTP (`signalsList`, `loading`,
`drawerOpen`...) está como `signal()` no `AppComponent`, e não como
propriedade solta.

## Quando for plugar um banco local

O `InMemorySignalStore` foi desenhado pra ser fácil de trocar: ele expõe
`GetAll`, `GetById`, `Add`, `Update`, `Delete`. Pra usar SQLite, por exemplo:

```bash
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
dotnet add package Microsoft.EntityFrameworkCore.Design
```

Daí é criar um `AppDbContext : DbContext` com `DbSet<Signal>`, registrar
ele no `Program.cs` no lugar do `InMemorySignalStore`, e ajustar o
`SignalsController` pra injetar o `DbContext` em vez do store (a
assinatura dos métodos muda pouco). Se quiser, é só pedir que eu faço
essa migração quando chegar a hora.
