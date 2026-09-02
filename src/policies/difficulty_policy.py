"""Adaptive difficulty policy adjusting question complexity based on candidate performance."""

from typing import Optional
from src.domain.enums import DifficultyLevel, PerformanceRating
from src.domain.models import AgentProfile, AnswerAnalysis


class DifficultyPolicy:
    """Computes adaptive question difficulty step-up/step-down."""

    DIFFICULTY_TIERS = [DifficultyLevel.EASY, DifficultyLevel.MEDIUM, DifficultyLevel.HARD]

    @classmethod
    def adapt_difficulty(
        cls,
        current_difficulty: DifficultyLevel,
        analysis: Optional[AnswerAnalysis],
        agent_profile: Optional[AgentProfile] = None,
    ) -> DifficultyLevel:
        """Determine next recommended difficulty level.

        Args:
            current_difficulty: The current interview difficulty setting.
            analysis: The latest turn answer analysis.
            agent_profile: The target agent profile with min/max bounds.

        Returns:
            The adapted DifficultyLevel clamped within agent profile bounds.
        """
        curr_idx = cls.DIFFICULTY_TIERS.index(current_difficulty)

        if analysis:
            if analysis.overall_performance == PerformanceRating.STRONG and analysis.confidence >= 0.75:
                # Step up difficulty if not already at HARD
                new_idx = min(curr_idx + 1, len(cls.DIFFICULTY_TIERS) - 1)
            elif analysis.overall_performance == PerformanceRating.WEAK or (analysis.vague and analysis.confidence < 0.6):
                # Step down difficulty if struggling
                new_idx = max(curr_idx - 1, 0)
            else:
                # Maintain current level on PARTIAL or stable answers
                new_idx = curr_idx
        else:
            new_idx = curr_idx

        target_diff = cls.DIFFICULTY_TIERS[new_idx]

        # Clamp within agent profile bounds if provided
        if agent_profile:
            min_idx = cls.DIFFICULTY_TIERS.index(agent_profile.min_difficulty)
            max_idx = cls.DIFFICULTY_TIERS.index(agent_profile.max_difficulty)
            target_idx = cls.DIFFICULTY_TIERS.index(target_diff)
            clamped_idx = max(min_idx, min(target_idx, max_idx))
            target_diff = cls.DIFFICULTY_TIERS[clamped_idx]

        return target_diff
