"""Neo4j schema definitions and uniqueness constraints for EchoSphere Knowledge Graph."""

from typing import List

NEO4J_CONSTRAINTS: List[str] = [
    "CREATE CONSTRAINT candidate_id_unique IF NOT EXISTS FOR (c:Candidate) REQUIRE c.id IS UNIQUE",
    "CREATE CONSTRAINT interview_round_id_unique IF NOT EXISTS FOR (r:InterviewRound) REQUIRE r.id IS UNIQUE",
    "CREATE CONSTRAINT experience_id_unique IF NOT EXISTS FOR (e:Experience) REQUIRE e.id IS UNIQUE",
    "CREATE CONSTRAINT project_id_unique IF NOT EXISTS FOR (p:Project) REQUIRE p.id IS UNIQUE",
    "CREATE CONSTRAINT skill_id_unique IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE",
    "CREATE CONSTRAINT technology_id_unique IF NOT EXISTS FOR (t:Technology) REQUIRE t.id IS UNIQUE",
    "CREATE CONSTRAINT concept_id_unique IF NOT EXISTS FOR (k:Concept) REQUIRE k.id IS UNIQUE",
    "CREATE CONSTRAINT competency_id_unique IF NOT EXISTS FOR (cp:Competency) REQUIRE cp.id IS UNIQUE",
    "CREATE CONSTRAINT question_id_unique IF NOT EXISTS FOR (q:Question) REQUIRE q.id IS UNIQUE",
    "CREATE CONSTRAINT answer_id_unique IF NOT EXISTS FOR (a:Answer) REQUIRE a.id IS UNIQUE",
    "CREATE CONSTRAINT evidence_id_unique IF NOT EXISTS FOR (ev:Evidence) REQUIRE ev.id IS UNIQUE",
    "CREATE CONSTRAINT assessment_id_unique IF NOT EXISTS FOR (as:Assessment) REQUIRE as.id IS UNIQUE",
]

NEO4J_INDEXES: List[str] = [
    "CREATE INDEX candidate_name_index IF NOT EXISTS FOR (c:Candidate) ON (c.name)",
    "CREATE INDEX competency_name_index IF NOT EXISTS FOR (cp:Competency) ON (cp.name)",
    "CREATE INDEX skill_name_index IF NOT EXISTS FOR (s:Skill) ON (s.name)",
    "CREATE INDEX tech_name_index IF NOT EXISTS FOR (t:Technology) ON (t.name)",
]
