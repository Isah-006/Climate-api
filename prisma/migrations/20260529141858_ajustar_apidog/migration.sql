-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClimaPesquisado" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cidade" TEXT NOT NULL,
    "temperatura" REAL NOT NULL,
    "condicao" TEXT NOT NULL DEFAULT '',
    "recomendacao" TEXT NOT NULL,
    "dataPesquisa" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,
    CONSTRAINT "ClimaPesquisado_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ClimaPesquisado" ("cidade", "dataPesquisa", "id", "recomendacao", "temperatura", "usuarioId") SELECT "cidade", "dataPesquisa", "id", "recomendacao", "temperatura", "usuarioId" FROM "ClimaPesquisado";
DROP TABLE "ClimaPesquisado";
ALTER TABLE "new_ClimaPesquisado" RENAME TO "ClimaPesquisado";
CREATE TABLE "new_Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL
);
INSERT INTO "new_Usuario" ("email", "id", "senha") SELECT "email", "id", "senha" FROM "Usuario";
DROP TABLE "Usuario";
ALTER TABLE "new_Usuario" RENAME TO "Usuario";
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
