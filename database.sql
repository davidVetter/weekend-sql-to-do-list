--Statement to create intial table
CREATE TABLE "tasks"(
	"id" SERIAL PRIMARY KEY NOT NULL,
	"taskName" VARCHAR (250) NOT NULL,
	"taskDescription" VARCHAR (1000) NOT NULL,
	"dateAdded" DATE DEFAULT NOW(),
	"isComplete" BOOLEAN DEFAULT FALSE,
	"dateComplete" DATE,
	"dueDate" DATE
	);

--Some test data if needed
INSERT INTO "tasks" 
	("taskName", "taskDescription")
VALUES
	('homework', 'weekend to-do project'),
	('laundry', 'do the laundry'),
	('mow', 'mow the lawn'),
	('dishes', 'do the dishes');