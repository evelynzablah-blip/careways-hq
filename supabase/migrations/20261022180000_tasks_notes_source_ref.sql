-- Origin of tasks created by the email triage routine (hq.py), and a unique key
-- so re-runs never duplicate a task.

alter table public.tasks add column notes text check (char_length(notes) <= 1000);
alter table public.tasks add column source_ref text unique;
