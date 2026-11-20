/*
  Warnings:

  - The primary key for the `recipe_ingredients` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `quantity` on the `recipe_ingredients` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - The primary key for the `recipe_steps` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `recipes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `avg_rating` on the `recipes` table. All the data in the column will be lost.
  - You are about to drop the column `rating_count` on the `recipes` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `recipes` table. All the data in the column will be lost.
  - The primary key for the `user_fridge_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `quantity` on the `user_fridge_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[recipe_id,ingredient_id]` on the table `recipe_ingredients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,ingredient_id]` on the table `user_fridge_items` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `recipe_ingredients` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `user_fridge_items` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Made the column `quantity` on table `user_fridge_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `full_name` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_FOLLOWER', 'NEW_REVIEW', 'NEW_COOKSNAP', 'SYSTEM');

-- DropForeignKey
ALTER TABLE "recipe_ingredients" DROP CONSTRAINT "recipe_ingredients_recipe_id_fkey";

-- DropForeignKey
ALTER TABLE "recipe_steps" DROP CONSTRAINT "recipe_steps_recipe_id_fkey";

-- DropForeignKey
ALTER TABLE "recipes" DROP CONSTRAINT "recipes_author_id_fkey";

-- DropForeignKey
ALTER TABLE "user_fridge_items" DROP CONSTRAINT "user_fridge_items_user_id_fkey";

-- DropIndex
DROP INDEX "ingredients_is_allergen_common_idx";

-- DropIndex
DROP INDEX "ingredients_name_idx";

-- DropIndex
DROP INDEX "recipe_ingredients_ingredient_id_idx";

-- DropIndex
DROP INDEX "recipe_ingredients_recipe_id_idx";

-- DropIndex
DROP INDEX "recipe_steps_recipe_id_idx";

-- DropIndex
DROP INDEX "recipes_author_id_idx";

-- DropIndex
DROP INDEX "recipes_category_id_idx";

-- DropIndex
DROP INDEX "recipes_title_idx";

-- DropIndex
DROP INDEX "user_fridge_items_ingredient_id_idx";

-- DropIndex
DROP INDEX "user_fridge_items_user_id_idx";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "icon_url" TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "slug" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "dietary_regimes" ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "slug" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "ingredients" ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "standard_unit" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "recipe_ingredients" DROP CONSTRAINT "recipe_ingredients_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "recipe_id" SET DATA TYPE TEXT,
ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "note" SET DATA TYPE TEXT,
ADD CONSTRAINT "recipe_ingredients_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "recipe_steps" DROP CONSTRAINT "recipe_steps_pkey",
ADD COLUMN     "timer_seconds" INTEGER,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "recipe_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "recipe_steps_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "recipe_steps_id_seq";

-- AlterTable
ALTER TABLE "recipes" DROP CONSTRAINT "recipes_pkey",
DROP COLUMN "avg_rating",
DROP COLUMN "rating_count",
DROP COLUMN "status",
ADD COLUMN     "average_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "author_id" SET DATA TYPE TEXT,
ALTER COLUMN "title" SET DATA TYPE TEXT,
ALTER COLUMN "servings" SET DEFAULT 2,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "recipes_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "user_fridge_items" DROP CONSTRAINT "user_fridge_items_pkey",
ADD COLUMN     "expiry_date" TIMESTAMP(3),
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "quantity" SET NOT NULL,
ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "user_fridge_items_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "firebase_uid" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "nickname" DROP NOT NULL,
ALTER COLUMN "nickname" SET DATA TYPE TEXT,
ALTER COLUMN "full_name" SET NOT NULL,
ALTER COLUMN "full_name" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "user_allergies" (
    "user_id" TEXT NOT NULL,
    "ingredient_id" INTEGER NOT NULL,

    CONSTRAINT "user_allergies_pkey" PRIMARY KEY ("user_id","ingredient_id")
);

-- CreateTable
CREATE TABLE "recipe_dietary_tags" (
    "recipe_id" TEXT NOT NULL,
    "dietary_regime_id" INTEGER NOT NULL,

    CONSTRAINT "recipe_dietary_tags_pkey" PRIMARY KEY ("recipe_id","dietary_regime_id")
);

-- CreateTable
CREATE TABLE "favorite_recipes" (
    "user_id" TEXT NOT NULL,
    "recipe_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_recipes_pkey" PRIMARY KEY ("user_id","recipe_id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "recipe_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cooksnaps" (
    "id" TEXT NOT NULL,
    "recipe_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "caption" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cooksnaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_filters" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category_id" INTEGER,
    "dietary_regime_ids" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "max_cooking_time" INTEGER,
    "min_rating" DOUBLE PRECISION,
    "exclude_allergies" BOOLEAN NOT NULL DEFAULT false,
    "sort_by" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_filters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopping_list_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ingredient_id" INTEGER,
    "custom_name" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unit" TEXT,
    "is_checked" BOOLEAN NOT NULL DEFAULT false,
    "source_recipe_id" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shopping_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follows" (
    "follower_id" TEXT NOT NULL,
    "following_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("follower_id","following_id")
);

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'android',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "actor_id" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reviews_recipe_id_user_id_key" ON "reviews"("recipe_id", "user_id");

-- CreateIndex
CREATE INDEX "saved_filters_user_id_is_default_idx" ON "saved_filters"("user_id", "is_default");

-- CreateIndex
CREATE INDEX "shopping_list_items_user_id_is_checked_idx" ON "shopping_list_items"("user_id", "is_checked");

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_token_key" ON "device_tokens"("token");

-- CreateIndex
CREATE INDEX "device_tokens_user_id_idx" ON "device_tokens"("user_id");

-- CreateIndex
CREATE INDEX "notifications_recipient_id_is_read_created_at_idx" ON "notifications"("recipient_id", "is_read", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_ingredients_recipe_id_ingredient_id_key" ON "recipe_ingredients"("recipe_id", "ingredient_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_fridge_items_user_id_ingredient_id_key" ON "user_fridge_items"("user_id", "ingredient_id");

-- AddForeignKey
ALTER TABLE "user_allergies" ADD CONSTRAINT "user_allergies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_allergies" ADD CONSTRAINT "user_allergies_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_fridge_items" ADD CONSTRAINT "user_fridge_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_steps" ADD CONSTRAINT "recipe_steps_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_dietary_tags" ADD CONSTRAINT "recipe_dietary_tags_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_dietary_tags" ADD CONSTRAINT "recipe_dietary_tags_dietary_regime_id_fkey" FOREIGN KEY ("dietary_regime_id") REFERENCES "dietary_regimes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_recipes" ADD CONSTRAINT "favorite_recipes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_recipes" ADD CONSTRAINT "favorite_recipes_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cooksnaps" ADD CONSTRAINT "cooksnaps_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cooksnaps" ADD CONSTRAINT "cooksnaps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_filters" ADD CONSTRAINT "saved_filters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_filters" ADD CONSTRAINT "saved_filters_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "shopping_list_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "shopping_list_items_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "shopping_list_items_source_recipe_id_fkey" FOREIGN KEY ("source_recipe_id") REFERENCES "recipes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
