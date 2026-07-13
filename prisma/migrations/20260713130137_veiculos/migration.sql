-- CreateTable
CREATE TABLE "Veiculo" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "modelo" TEXT,
    "placa" TEXT,
    "consumoMedio" DECIMAL(4,1),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Veiculo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Veiculo_usuarioId_idx" ON "Veiculo"("usuarioId");

-- AddForeignKey
ALTER TABLE "Veiculo" ADD CONSTRAINT "Veiculo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: adiciona a coluna primeiro como nula para permitir o backfill
ALTER TABLE "Gasto" ADD COLUMN "veiculoId" TEXT;

-- Backfill: cria um veículo padrão "Meu carro" para cada usuário existente...
INSERT INTO "Veiculo" ("id", "usuarioId", "nome")
SELECT gen_random_uuid(), u."id", 'Meu carro' FROM "Usuario" u;

-- ...e vincula todos os gastos existentes ao veículo padrão do seu dono
UPDATE "Gasto" g
SET "veiculoId" = v."id"
FROM "Veiculo" v
WHERE v."usuarioId" = g."usuarioId";

-- Agora a coluna pode ser obrigatória
ALTER TABLE "Gasto" ALTER COLUMN "veiculoId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Gasto_veiculoId_data_idx" ON "Gasto"("veiculoId", "data");

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
