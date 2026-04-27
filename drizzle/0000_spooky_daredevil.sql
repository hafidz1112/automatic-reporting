CREATE TABLE "account" (
	"id" varchar PRIMARY KEY NOT NULL,
	"accountId" varchar NOT NULL,
	"providerId" varchar NOT NULL,
	"userId" varchar NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" varchar,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_reports" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"store_id" varchar(255) NOT NULL,
	"author_id" varchar,
	"report_date" timestamp DEFAULT now() NOT NULL,
	"sales_groceries" integer DEFAULT 0,
	"sales_lpg" integer DEFAULT 0,
	"sales_pelumas" integer DEFAULT 0,
	"total_sales" integer DEFAULT 0,
	"target_spd_snapshot" integer,
	"fullfillment_pb" numeric,
	"avg_fulfillment_dc" numeric,
	"item_oos" jsonb,
	"stock_lpg_3kg" integer DEFAULT 0,
	"stock_lpg_5kg" integer DEFAULT 0,
	"stock_lpg_12kg" integer DEFAULT 0,
	"waste" integer DEFAULT 0,
	"losses" integer DEFAULT 0,
	"need_support" text,
	"is_pushed_to_wa" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" varchar NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"location" text NOT NULL,
	"operational_year" integer,
	"se_name" text,
	"sa_count" integer,
	"operational_hours" text,
	"price_cluster" text,
	"target_spd" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"role" varchar DEFAULT 'kasir' NOT NULL,
	"banned" boolean,
	"banReason" varchar,
	"banExpires" timestamp,
	"stores_id" varchar,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" varchar PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp,
	"updatedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_stores_id_stores_id_fk" FOREIGN KEY ("stores_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;