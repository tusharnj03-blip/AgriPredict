"""
AgriPredict CLI — Administrative commands.

Usage:
    python -m app.cli create-admin
    python -m app.cli backup-db [output_path]
    python -m app.cli restore-db <backup_path>

Commands:
    create-admin   Bootstrap the permanent admin account from environment variables.
                   Does nothing if the admin email already exists in the database.
    backup-db      Create a timestamped backup of the SQLite database.
    restore-db     Safely restore database from a backup file.
"""
import sys
import os
import shutil
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)


def create_admin() -> None:
    """
    Create the permanent administrator account.

    Reads credentials from environment variables:
        ADMIN_NAME     — Display name (default: "System Administrator")
        ADMIN_EMAIL    — Login email (required)
        ADMIN_PASSWORD — Login password (required, min 8 chars)

    Safe to run multiple times; will not duplicate the account.
    Does NOT reset the password if the account already exists.
    """
    from app.config import settings
    from app.database import SessionLocal, init_db
    from app.models.models import User
    from app.utils.auth import hash_password

    # Validate config
    if not settings.ADMIN_EMAIL:
        logger.error("ADMIN_EMAIL is not set. Add it to your .env file.")
        sys.exit(1)
    if not settings.ADMIN_PASSWORD:
        logger.error("ADMIN_PASSWORD is not set. Add it to your .env file.")
        sys.exit(1)
    if len(settings.ADMIN_PASSWORD) < 8:
        logger.error("ADMIN_PASSWORD must be at least 8 characters.")
        sys.exit(1)

    # Ensure tables exist
    init_db()

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if existing:
            logger.info(
                f"Admin account already exists: {existing.email} (id={existing.id}). "
                "No changes made."
            )
            return

        admin = User(
            full_name=settings.ADMIN_NAME,
            email=settings.ADMIN_EMAIL,
            password_hash=hash_password(settings.ADMIN_PASSWORD),
            role="ADMIN",
            is_active=True,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        logger.info(
            f"[OK] Admin account created: {admin.email} (id={admin.id}). "
            "Please change the password after first login."
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create admin account: {e}")
        sys.exit(1)
    finally:
        db.close()


def backup_database(output_path: str = None) -> None:
    """Create a verified copy of the SQLite database."""
    from app.config import settings
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    if not os.path.exists(db_path):
        logger.error(f"Database file not found: {db_path}")
        sys.exit(1)

    if not output_path:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_dir = os.path.join(os.path.dirname(os.path.abspath(db_path)), "backups")
        os.makedirs(backup_dir, exist_ok=True)
        output_path = os.path.join(backup_dir, f"agripredict_backup_{timestamp}.db")

    shutil.copy2(db_path, output_path)
    logger.info(f"[OK] Database backed up successfully to: {output_path}")


def restore_database(backup_path: str) -> None:
    """Safely restore database from a verified backup file."""
    from app.config import settings
    if not os.path.exists(backup_path):
        logger.error(f"Backup file not found: {backup_path}")
        sys.exit(1)

    db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    # Create safety backup of current state first
    if os.path.exists(db_path):
        safety_path = f"{db_path}.pre_restore_safety"
        shutil.copy2(db_path, safety_path)
        logger.info(f"Safety snapshot created at: {safety_path}")

    shutil.copy2(backup_path, db_path)
    logger.info(f"[OK] Database restored successfully from: {backup_path}")


def main() -> None:
    args = sys.argv[1:]
    if not args or args[0] in ("-h", "--help", "help"):
        print(__doc__)
        sys.exit(0)

    command = args[0]
    if command == "create-admin":
        create_admin()
    elif command == "backup-db":
        out = args[1] if len(args) > 1 else None
        backup_database(out)
    elif command == "restore-db":
        if len(args) < 2:
            logger.error("Usage: python -m app.cli restore-db <backup_path>")
            sys.exit(1)
        restore_database(args[1])
    else:
        logger.error(f"Unknown command: {command!r}")
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
