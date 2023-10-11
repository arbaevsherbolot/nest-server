-- CreateTable
CREATE TABLE "Messsage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "Messsage_pkey" PRIMARY KEY ("id")
);
