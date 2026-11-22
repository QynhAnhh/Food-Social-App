-- ==============================================================================
-- Migration: 20261122203000_social_notifications_user_devices_and_rating_trigger
-- Mục đích: Chuẩn hóa toàn bộ 19 bảng khớp 100% tài liệu kiến trúc Food Social App
-- ==============================================================================

-- 1. Bảng 7: recipes - Bổ sung avg_rating, rating_count, status
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'recipes' AND column_name = 'average_rating'
    ) THEN
        ALTER TABLE "recipes" RENAME COLUMN "average_rating" TO "avg_rating";
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'recipes' AND column_name = 'rating_count'
    ) THEN
        ALTER TABLE "recipes" ADD COLUMN "rating_count" INTEGER NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'recipes' AND column_name = 'status'
    ) THEN
        ALTER TABLE "recipes" ADD COLUMN "status" "RecipeStatus" NOT NULL DEFAULT 'PUBLISHED';
    END IF;
END $$;

-- 2. Bảng 4: saved_filters - Bổ sung filter_name, dietary_ids, excluded_ingredient_ids
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'saved_filters' AND column_name = 'filter_name'
    ) THEN
        ALTER TABLE "saved_filters" ADD COLUMN "filter_name" TEXT;
        UPDATE "saved_filters" SET "filter_name" = "name" WHERE "filter_name" IS NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'saved_filters' AND column_name = 'dietary_ids'
    ) THEN
        ALTER TABLE "saved_filters" ADD COLUMN "dietary_ids" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'saved_filters' AND column_name = 'excluded_ingredient_ids'
    ) THEN
        ALTER TABLE "saved_filters" ADD COLUMN "excluded_ingredient_ids" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
    END IF;
END $$;

-- 3. Bảng 12: shopping_list_items - Bổ sung total_quantity, is_purchased
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'shopping_list_items' AND column_name = 'total_quantity'
    ) THEN
        ALTER TABLE "shopping_list_items" ADD COLUMN "total_quantity" DOUBLE PRECISION NOT NULL DEFAULT 1;
        UPDATE "shopping_list_items" SET "total_quantity" = "quantity";
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'shopping_list_items' AND column_name = 'is_purchased'
    ) THEN
        ALTER TABLE "shopping_list_items" ADD COLUMN "is_purchased" BOOLEAN NOT NULL DEFAULT false;
        UPDATE "shopping_list_items" SET "is_purchased" = "is_checked";
    END IF;
END $$;

-- Ràng buộc unique (user_id, ingredient_id) cho shopping_list_items
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'shopping_list_items' AND indexname = 'shopping_list_items_user_id_ingredient_id_key'
    ) THEN
        CREATE UNIQUE INDEX "shopping_list_items_user_id_ingredient_id_key"
        ON "shopping_list_items"("user_id", "ingredient_id");
    END IF;
END $$;

-- 4. Bảng 13: shopping_list_recipe_sources (Truy vết nguồn công thức trong giỏ hàng)
CREATE TABLE IF NOT EXISTS "shopping_list_recipe_sources" (
    "shopping_item_id" TEXT NOT NULL,
    "recipe_id" TEXT NOT NULL,
    "added_quantity" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "shopping_list_recipe_sources_pkey" PRIMARY KEY ("shopping_item_id", "recipe_id")
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'shopping_list_recipe_sources_shopping_item_id_fkey'
    ) THEN
        ALTER TABLE "shopping_list_recipe_sources" ADD CONSTRAINT "shopping_list_recipe_sources_shopping_item_id_fkey"
        FOREIGN KEY ("shopping_item_id") REFERENCES "shopping_list_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'shopping_list_recipe_sources_recipe_id_fkey'
    ) THEN
        ALTER TABLE "shopping_list_recipe_sources" ADD CONSTRAINT "shopping_list_recipe_sources_recipe_id_fkey"
        FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 5. Bảng 18: user_devices (Quản lý FCM Token thiết bị)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'device_tokens'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'user_devices'
    ) THEN
        ALTER TABLE "device_tokens" RENAME TO "user_devices";
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "user_devices" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "fcm_token" TEXT NOT NULL,
    "device_model" TEXT DEFAULT 'android',
    "platform" TEXT DEFAULT 'android',
    "last_active_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_devices_pkey" PRIMARY KEY ("id")
);

-- Hỗ trợ đồng bộ fcm_token nếu trước đó tên cột là token
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'user_devices' AND column_name = 'token'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'user_devices' AND column_name = 'fcm_token'
    ) THEN
        ALTER TABLE "user_devices" RENAME COLUMN "token" TO "fcm_token";
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'user_devices' AND column_name = 'device_model'
    ) THEN
        ALTER TABLE "user_devices" ADD COLUMN "device_model" TEXT DEFAULT 'android';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'user_devices' AND column_name = 'last_active_at'
    ) THEN
        ALTER TABLE "user_devices" ADD COLUMN "last_active_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "user_devices_fcm_token_key" ON "user_devices"("fcm_token");
CREATE INDEX IF NOT EXISTS "user_devices_user_id_idx" ON "user_devices"("user_id");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'user_devices_user_id_fkey'
    ) THEN
        ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 6. Bảng 19: notifications - Bổ sung reference_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'reference_id'
    ) THEN
        ALTER TABLE "notifications" ADD COLUMN "reference_id" TEXT;
    END IF;
END $$;

-- 7. Trigger Function: Tự động tính toán và cập nhật avg_rating & rating_count trong bảng recipes
CREATE OR REPLACE FUNCTION update_recipe_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Khi xóa hoặc cập nhật review, tính lại cho công thức cũ (nếu recipe_id thay đổi)
    IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') THEN
        UPDATE "recipes"
        SET "avg_rating" = COALESCE((
            SELECT ROUND(AVG("rating")::numeric, 2)
            FROM "reviews"
            WHERE "recipe_id" = OLD."recipe_id"
        ), 0.0),
        "rating_count" = (
            SELECT COUNT(*)
            FROM "reviews"
            WHERE "recipe_id" = OLD."recipe_id"
        ),
        "updated_at" = CURRENT_TIMESTAMP
        WHERE "id" = OLD."recipe_id";
    END IF;

    -- Khi thêm mới hoặc cập nhật review, tính lại cho công thức mới
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        UPDATE "recipes"
        SET "avg_rating" = COALESCE((
            SELECT ROUND(AVG("rating")::numeric, 2)
            FROM "reviews"
            WHERE "recipe_id" = NEW."recipe_id"
        ), 0.0),
        "rating_count" = (
            SELECT COUNT(*)
            FROM "reviews"
            WHERE "recipe_id" = NEW."recipe_id"
        ),
        "updated_at" = CURRENT_TIMESTAMP
        WHERE "id" = NEW."recipe_id";
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Gắn Trigger vào bảng reviews (sau khi INSERT, UPDATE, DELETE)
DROP TRIGGER IF EXISTS trigger_update_recipe_avg_rating ON "reviews";
CREATE TRIGGER trigger_update_recipe_avg_rating
AFTER INSERT OR UPDATE OR DELETE ON "reviews"
FOR EACH ROW
EXECUTE FUNCTION update_recipe_avg_rating();
