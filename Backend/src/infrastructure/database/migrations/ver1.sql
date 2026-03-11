CREATE DATABASE "pocket-mini"
    WITH
    OWNER = "pocket-mini"
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;
\c pocket_mini; -- kết nối db khi dùng psql

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- để dùng gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";  -- để dùng citext (case-insensitive text)
--user
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           CITEXT UNIQUE NOT NULL,
    phone_number    TEXT UNIQUE, 
    password_hash   TEXT NOT NULL,
    full_name       TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    status          TEXT DEFAULT 'active'
);
CREATE TABLE roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_code   TEXT UNIQUE NOT NULL, -- admin, manager, staff
    name        TEXT NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE permissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_code        TEXT UNIQUE NOT NULL, 
    -- ví dụ: product.create, product.update, stock.export
    description TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE role_permissions (
    role_id       UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);


-- Chấm công
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    date DATE NOT NULL,
    check_in TIMESTAMP,
    check_out TIMESTAMP,
    working_hours NUMERIC(4,2), -- Giờ làm thực tế
    status TEXT DEFAULT 'PRESENT', -- PRESENT, LATE, ABSENT, LEAVE
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, date)
);

-- Bảng lương
CREATE TABLE payroll (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    month INT NOT NULL,
    year INT NOT NULL,
    total_working_days NUMERIC(4,2),
    base_salary NUMERIC(12,2),
    total_salary NUMERIC(12,2),
    status TEXT DEFAULT 'DRAFT', -- DRAFT, FINALIZED, PAID
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, month, year)
);


-- Sản phẩm
-- Danh mục sản phẩm
CREATE TABLE categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    description     TEXT,
    image           TEXT,
    level           INT DEFAULT 0,
    parent_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Sản phẩm
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku             TEXT UNIQUE NOT NULL, -- mã sản phẩm
    name            TEXT NOT NULL,
    description     TEXT,
    image           TEXT,
    category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
    unit            TEXT, -- cái, hộp, kg
    price           NUMERIC(12,2),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    is_active       BOOLEAN DEFAULT TRUE,
    min_stock_level INT DEFAULT 0
);

-- Kho hàng
CREATE TABLE warehouses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    location        TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- Tồn kho (số lượng mỗi sản phẩm tại từng kho)
CREATE TABLE stock (
    warehouse_id    UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    product_id      UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity        INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    PRIMARY KEY (warehouse_id, product_id)
);
-- Nhà cung cấp
CREATE TABLE suppliers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    contact_person  TEXT,
    phone           TEXT,
    email           TEXT,
    address         TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    status       TEXT DEFAULT 'active' --active→ đang giao dịch;inactive → ngừng giao dịch;blocked  → bị chặn
);

-- Khách hàng
CREATE TABLE customers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    phone           TEXT,
    email           TEXT,
    address         TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    status          TEXT DEFAULT 'active', --active→ đang giao dịch;inactive → ngừng giao dịch;blocked  → bị chặn
    customer_type   TEXT, -- Individual, Business
    company_name    TEXT,
    tier            TEXT DEFAULT 'Bronze'
);

-- Phiếu nhập
CREATE TABLE stock_in (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id     UUID REFERENCES suppliers(id),
    warehouse_id    UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id),
    reference_code  TEXT, -- số hóa đơn/chứng từ
    status          TEXT DEFAULT 'pending', -- pending, completed, cancelled
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE stock_in_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_in_id     UUID REFERENCES stock_in(id) ON DELETE CASCADE,
    product_id      UUID REFERENCES products(id),
    quantity        INT NOT NULL,
    price           NUMERIC(12,2)
);

-- Phiếu xuất
CREATE TABLE stock_out (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID REFERENCES customers(id),
    warehouse_id    UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id),
    reference_code  TEXT,
    status          TEXT DEFAULT 'pending', -- pending, completed, cancelled
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE stock_out_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_out_id    UUID REFERENCES stock_out(id) ON DELETE CASCADE,
    product_id      UUID REFERENCES products(id),
    quantity        INT NOT NULL,
    price           NUMERIC(12,2)
);

-- Phiếu điều chuyển kho
CREATE TABLE stock_transfer (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_warehouse  UUID REFERENCES warehouses(id),
    to_warehouse    UUID REFERENCES warehouses(id),
    user_id         UUID REFERENCES users(id),
    reference_code  TEXT,
    status          TEXT DEFAULT 'pending', -- pending, completed, cancelled
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE stock_transfer_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_transfer_id   UUID REFERENCES stock_transfer(id) ON DELETE CASCADE,
    product_id          UUID REFERENCES products(id),
    quantity            INT NOT NULL
);
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_type  TEXT NOT NULL, -- stock_in, stock_out
    reference_id    UUID NOT NULL, -- id của phiếu nhập hoặc phiếu xuất
    amount          NUMERIC(12,2) NOT NULL,
    method          TEXT, -- cash, bank_transfer, credit
    payment_description TEXT,
    status          TEXT DEFAULT 'pending', -- pending, paid, failed
    paid_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE notes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type     TEXT NOT NULL, -- product, stock_in, stock_out, warehouse, payment
    entity_id       UUID NOT NULL,
    user_id         UUID REFERENCES users(id),
    content         TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE audit_log (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID REFERENCES users(id),
    entity_type     TEXT NOT NULL, -- product, stock, stock_in, stock_out, payment
    entity_id       UUID NOT NULL,
    action          TEXT NOT NULL, -- insert, update, delete
    changes         JSONB,
    created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_stock_product ON stock(product_id);
CREATE INDEX idx_stock_warehouse ON stock(warehouse_id);
CREATE INDEX idx_stock_in_created ON stock_in(created_at);
CREATE INDEX idx_stock_out_created ON stock_out(created_at);

-- tích hợp AI
-- Model AI
CREATE TABLE ai_models (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider    TEXT NOT NULL, -- openai, local
    model_name  TEXT NOT NULL,
    type        TEXT NOT NULL, -- forecast, classify, chatbot
    dims        INT,
    created_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE(provider, model_name)
);

-- Lịch sử chạy AI
CREATE TABLE ai_runs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id),
    model_id    UUID REFERENCES ai_models(id),
    task        TEXT NOT NULL, -- forecast_demand, anomaly_detect
    input       JSONB,
    output      JSONB,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Gợi ý nhập hàng
CREATE TABLE ai_recommendations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID REFERENCES products(id),
    suggested_qty   INT NOT NULL,
    reason          TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- Feedback cho AI
CREATE TABLE ai_feedback (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID REFERENCES ai_recommendations(id) ON DELETE CASCADE,
    user_id           UUID REFERENCES users(id),
    rating            INT CHECK (rating >= 1 AND rating <= 5),
    comment           TEXT,
    created_at        TIMESTAMPTZ DEFAULT now()
);
-- Chat threads -Phiên hội thoại
--Vai trò
--Đại diện cho 1 cuộc trò chuyện
--Nhóm nhiều tin nhắn lại với nhau
CREATE TABLE chat_threads (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id),
    title       TEXT,
    model_id    UUID REFERENCES ai_models(id),
    created_at  TIMESTAMPTZ DEFAULT now()
);
-- Chat messages-Tin nhắn trong cuộc trò chuyện
--vai trò:Lưu từng tin nhắn cụ thể trong 1 thread
CREATE TABLE chat_messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id   UUID REFERENCES chat_threads(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES users(id),
    role        TEXT NOT NULL, -- system, user, assistant
    content     TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);