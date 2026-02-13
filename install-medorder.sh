#!/bin/bash
# MedOrder Installationsskript

set -e

echo "🚀 MedOrder wird installiert..."

# In das Verzeichnis wechseln
cd /opt/medorder
# package.json erstellen
cat > package.json << 'PACKAGEJSON'
{
  "name": "medorder",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^7.3.0",
    "bcryptjs": "^2.4.3",
    "next": "14.2.0",
    "next-auth": "^4.24.11",
    "nodemailer": "^6.9.13",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^20",
    "@types/nodemailer": "^6.4.15",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "postcss": "^8",
    "prisma": "^7.3.0",
    "tailwindcss": "^3.4.1",
    "tsx": "^4.7.0",
    "typescript": "^5"
  }
}
PACKAGEJSON

echo "✅ package.json erstellt"

# tsconfig.json erstellen
cat > tsconfig.json << 'TSCONFIG'
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
TSCONFIG

echo "✅ tsconfig.json erstellt"

# next.config.js erstellen
cat > next.config.js << 'NEXTCONFIG'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

module.exports = nextConfig
NEXTCONFIG

echo "✅ next.config.js erstellt"

# prisma/schema.prisma erstellen
mkdir -p prisma
cat > prisma/schema.prisma << 'SCHEMA'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model CareHome {
  id             String    @id @default(uuid())
  name           String
  email          String    @unique
  passwordHash   String
  contactPerson  String
  phone          String?
  address        String?
  isActive       Boolean   @default(true)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  
  patients       Patient[]
  orders         Order[]
  
  @@map("care_homes")
}

model Patient {
  id            String    @id @default(uuid())
  careHomeId    String
  firstName     String
  lastName      String
  dateOfBirth   DateTime
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  careHome      CareHome  @relation(fields: [careHomeId], references: [id])
  orders        Order[]
  
  @@map("patients")
}

model Category {
  id           String    @id @default(uuid())
  name         String
  description  String?
  sortOrder    Int       @default(0)
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
  
  products     Product[]
  
  @@map("categories")
}

model Product {
  id            String          @id @default(uuid())
  categoryId    String
  name          String
  description   String?
  articleNumber String?
  unit          String          @default("Stück")
  isActive      Boolean         @default(true)
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  
  category      Category        @relation(fields: [categoryId], references: [id])
  orderItems    OrderItem[]
  prices        ProductPrice[]
  
  @@map("products")
}

model ProductPrice {
  id          String   @id @default(uuid())
  productId   String
  pzn         String
  supplier    String
  price       Decimal  @db.Decimal(10, 2)
  packSize    String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  @@map("product_prices")
}

model Order {
  id            String      @id @default(uuid())
  careHomeId    String
  patientId     String
  orderNumber   String      @unique
  status        OrderStatus @default(PENDING)
  totalItems    Int
  notes         String?
  completedAt   DateTime?
  completedBy   String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  careHome      CareHome    @relation(fields: [careHomeId], references: [id])
  patient       Patient     @relation(fields: [patientId], references: [id])
  items         OrderItem[]
  
  @@map("orders")
}

model OrderItem {
  id            String   @id @default(uuid())
  orderId       String
  productId     String
  quantity      Int
  productName   String
  productUnit   String
  
  order         Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product       Product  @relation(fields: [productId], references: [id])
  
  @@map("order_items")
}

enum OrderStatus {
  PENDING
  COMPLETED
}

model Admin {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  name         String
  createdAt    DateTime @default(now())
  
  @@map("admins")
}
SCHEMA

echo "✅ prisma/schema.prisma erstellt"

# prisma.config.ts erstellen
cat > prisma.config.ts << 'PRISMACONFIG'
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
PRISMACONFIG

echo "✅ prisma.config.ts erstellt"

echo ""
echo "📦 Nun Dependencies installieren..."
npm install

echo ""
echo "🗄️  Datenbank migrieren..."
npx prisma migrate dev --name add_product_prices

echo ""
echo "🌱 Seed-Daten einspielen..."
npm run db:seed

echo ""
echo "🏗️  Build erstellen..."
npm run build

echo ""
echo "✅ Installation abgeschlossen!"
echo "Starte mit: npm start"
