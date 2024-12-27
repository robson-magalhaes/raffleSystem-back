-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "userName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "chave_pix" TEXT NOT NULL,
    "balance_pix" DECIMAL(10,2) DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Raffles" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "productValue" DECIMAL(10,2) NOT NULL,
    "productQnt" INTEGER NOT NULL,
    "ticketValue" DECIMAL(10,2) NOT NULL,
    "totalTicketValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "soldTickets" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "awardedQuota" TEXT NOT NULL,
    "winner" TEXT,

    CONSTRAINT "Raffles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quota" DECIMAL(10,2) NOT NULL,
    "minValue" DECIMAL(10,2) NOT NULL,
    "totalProductValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalSoldTicketValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "soldTicket" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "raffleId" INTEGER,
    "buyer" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "ticketNumber" DECIMAL(10,2) NOT NULL,
    "paymentStatus" TEXT,
    "paymentId" BIGINT,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseByQuota" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "buyer" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "ticketNumber" DECIMAL(10,2) NOT NULL,
    "paymentStatus" TEXT,
    "paymentId" BIGINT,

    CONSTRAINT "PurchaseByQuota_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_chave_pix_key" ON "User"("chave_pix");

-- AddForeignKey
ALTER TABLE "Raffles" ADD CONSTRAINT "Raffles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_raffleId_fkey" FOREIGN KEY ("raffleId") REFERENCES "Raffles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseByQuota" ADD CONSTRAINT "PurchaseByQuota_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
