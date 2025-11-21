"""add_supplier_staff_table

Revision ID: 4249ec42205b
Revises: 61785b2410bb
Create Date: 2025-11-22 01:23:01.371683

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '4249ec42205b'
down_revision: Union[str, None] = '61785b2410bb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Use existing ENUM type 'role' instead of creating a new one
    role_enum = postgresql.ENUM('CONSUMER', 'SUPPLIER_OWNER', 'SUPPLIER_MANAGER', 'SUPPLIER_SALES', name='role', create_type=False)

    op.create_table(
        'supplier_staff',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('supplier_id', sa.Integer(), nullable=False),
        sa.Column('role', role_enum, nullable=False),
        sa.Column('invited_by', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['supplier_id'], ['suppliers.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['invited_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_supplier_staff_id'), 'supplier_staff', ['id'], unique=False)
    op.create_index(op.f('ix_supplier_staff_user_id'), 'supplier_staff', ['user_id'], unique=False)
    op.create_index(op.f('ix_supplier_staff_supplier_id'), 'supplier_staff', ['supplier_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_supplier_staff_supplier_id'), table_name='supplier_staff')
    op.drop_index(op.f('ix_supplier_staff_user_id'), table_name='supplier_staff')
    op.drop_index(op.f('ix_supplier_staff_id'), table_name='supplier_staff')
    op.drop_table('supplier_staff')
