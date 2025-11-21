"""add_complaint_escalation_fields

Revision ID: 61785b2410bb
Revises: e3e008a838ee
Create Date: 2025-11-22 00:38:20.327305

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '61785b2410bb'
down_revision: Union[str, None] = 'e3e008a838ee'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add escalation fields to complaints table
    op.add_column('complaints', sa.Column('assigned_to_id', sa.Integer(), nullable=True))
    op.add_column('complaints', sa.Column('escalated_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('complaints', sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True))
    op.create_foreign_key('fk_complaints_assigned_to_id', 'complaints', 'users', ['assigned_to_id'], ['id'])


def downgrade() -> None:
    op.drop_constraint('fk_complaints_assigned_to_id', 'complaints', type_='foreignkey')
    op.drop_column('complaints', 'resolved_at')
    op.drop_column('complaints', 'escalated_at')
    op.drop_column('complaints', 'assigned_to_id')
