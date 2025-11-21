"""add_escalated_status_to_complaint_enum

Revision ID: 7c8f3f561d15
Revises: 4249ec42205b
Create Date: 2025-11-22 03:13:55.710094

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7c8f3f561d15'
down_revision: Union[str, None] = '4249ec42205b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add ESCALATED to the ComplaintStatus enum (idempotent - only adds if not exists)
    # Check if ESCALATED already exists in the enum
    connection = op.get_bind()
    result = connection.execute(
        sa.text("""
            SELECT EXISTS (
                SELECT 1 FROM pg_enum 
                WHERE enumlabel = 'ESCALATED' 
                AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'complaintstatus')
            )
        """)
    )
    exists = result.scalar()
    
    if not exists:
        op.execute("ALTER TYPE complaintstatus ADD VALUE 'ESCALATED'")


def downgrade() -> None:
    # Note: PostgreSQL doesn't support removing enum values directly
    # This would require recreating the enum type
    pass
