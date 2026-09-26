"""Initial schema: users, product_scans, extracted_data, violations, reports.

Revision ID: 0001_initial
Revises:
Create Date: 2026-08-29
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE TYPE user_role AS ENUM ('admin', 'enforcement_official')")
    op.execute("CREATE TYPE scan_status AS ENUM ('pending', 'compliant', 'non_compliant')")
    op.execute("CREATE TYPE violation_severity AS ENUM ('low', 'medium', 'high', 'critical')")

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column(
            "role",
            postgresql.ENUM("admin", "enforcement_official", name="user_role", create_type=False),
            nullable=False,
        ),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "product_scans",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("product_name", sa.String(255), nullable=True),
        sa.Column("brand", sa.String(255), nullable=True),
        sa.Column("scan_date", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("image_url", sa.Text(), nullable=False),
        sa.Column(
            "overall_status",
            postgresql.ENUM("pending", "compliant", "non_compliant", name="scan_status", create_type=False),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="RESTRICT"),
    )
    op.create_index("ix_product_scans_user_id", "product_scans", ["user_id"])
    op.create_index("ix_product_scans_brand", "product_scans", ["brand"])
    op.create_index("ix_product_scans_scan_date", "product_scans", ["scan_date"])
    op.create_index("ix_product_scans_overall_status", "product_scans", ["overall_status"])

    op.create_table(
        "extracted_data",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("scan_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("manufacturer_details", sa.Text(), nullable=True),
        sa.Column("net_quantity", sa.String(255), nullable=True),
        sa.Column("mrp", sa.String(255), nullable=True),
        sa.Column("date_of_mfg", sa.String(255), nullable=True),
        sa.Column("consumer_care", sa.Text(), nullable=True),
        sa.Column("raw_ocr_text", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["scan_id"], ["product_scans.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("scan_id", name="uq_extracted_data_scan_id"),
    )

    op.create_table(
        "violations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("scan_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("rule_category", sa.String(100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column(
            "severity",
            postgresql.ENUM("low", "medium", "high", "critical", name="violation_severity", create_type=False),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["scan_id"], ["product_scans.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_violations_scan_id", "violations", ["scan_id"])
    op.create_index("ix_violations_rule_category", "violations", ["rule_category"])

    op.create_table(
        "reports",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("scan_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("pdf_url", sa.Text(), nullable=False),
        sa.Column("generated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["scan_id"], ["product_scans.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_reports_scan_id", "reports", ["scan_id"])


def downgrade() -> None:
    op.drop_index("ix_reports_scan_id", table_name="reports")
    op.drop_table("reports")
    op.drop_index("ix_violations_rule_category", table_name="violations")
    op.drop_index("ix_violations_scan_id", table_name="violations")
    op.drop_table("violations")
    op.drop_table("extracted_data")
    op.drop_index("ix_product_scans_overall_status", table_name="product_scans")
    op.drop_index("ix_product_scans_scan_date", table_name="product_scans")
    op.drop_index("ix_product_scans_brand", table_name="product_scans")
    op.drop_index("ix_product_scans_user_id", table_name="product_scans")
    op.drop_table("product_scans")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    op.execute("DROP TYPE violation_severity")
    op.execute("DROP TYPE scan_status")
    op.execute("DROP TYPE user_role")
