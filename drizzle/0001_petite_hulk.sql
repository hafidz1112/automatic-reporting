CREATE TABLE "wa_groups" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"group_id" varchar(255) NOT NULL,
	"name" text NOT NULL,
	"store_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wa_groups_group_id_unique" UNIQUE("group_id")
);
--> statement-breakpoint
ALTER TABLE "wa_groups" ADD CONSTRAINT "wa_groups_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;