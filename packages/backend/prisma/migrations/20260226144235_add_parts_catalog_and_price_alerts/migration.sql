-- CreateTable
CREATE TABLE "parts_catalog" (
    "id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "partName" TEXT NOT NULL,
    "type" "InvoiceLineType" NOT NULL DEFAULT 'PART',
    "avgNetCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgClientPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastNetCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastClientPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minClientPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxClientPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parts_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_alerts" (
    "id" TEXT NOT NULL,
    "invoiceLineId" TEXT NOT NULL,
    "catalogId" TEXT,
    "managerId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "partName" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "expectedPrice" DOUBLE PRECISION NOT NULL,
    "actualPrice" DOUBLE PRECISION NOT NULL,
    "deviationPct" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parts_catalog_make_model_partName_key" ON "parts_catalog"("make", "model", "partName");
