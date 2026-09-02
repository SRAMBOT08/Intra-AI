"""Factory for Knowledge Graph repository instantiation."""

import os
from src.knowledge_graph.repository.base import BaseKnowledgeGraphRepository
from src.knowledge_graph.repository.in_memory import InMemoryKnowledgeGraphRepository
from src.knowledge_graph.repository.neo4j_repo import Neo4jKnowledgeGraphRepository

_GLOBAL_REPO: BaseKnowledgeGraphRepository = None


def get_knowledge_graph_repository() -> BaseKnowledgeGraphRepository:
    """Return the singleton Knowledge Graph repository (Neo4j with in-memory fallback)."""
    global _GLOBAL_REPO
    if _GLOBAL_REPO is None:
        if os.getenv("NEO4J_URI"):
            _GLOBAL_REPO = Neo4jKnowledgeGraphRepository()
        else:
            _GLOBAL_REPO = InMemoryKnowledgeGraphRepository()
    return _GLOBAL_REPO


def set_knowledge_graph_repository(repo: BaseKnowledgeGraphRepository) -> None:
    """Set custom or test repository."""
    global _GLOBAL_REPO
    _GLOBAL_REPO = repo
