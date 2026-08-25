CREATE TABLE "liked_people" (
	"user_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "liked_people_user_id_person_id_pk" PRIMARY KEY("user_id","person_id")
);
--> statement-breakpoint
ALTER TABLE "liked_people" ADD CONSTRAINT "liked_people_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "liked_people" ADD CONSTRAINT "liked_people_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;