"""
AgriPredict Database Viewer Utility
Run this script from PowerShell with:
    python view_db.py
"""
import os
import sqlite3

DB_PATH = os.path.join(os.path.dirname(__file__), "backend", "agripredict.db")

def show_database():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        return

    print("=" * 60)
    print(f"  AGRIPREDICT DATABASE: {DB_PATH}")
    print("=" * 60)

    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()

    # 1. Show all tables & counts
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;")
    tables = [row[0] for row in cur.fetchall()]
    print(f"\n[+] Total Tables Found: {len(tables)}\n")
    for t in tables:
        cur.execute(f"SELECT count(*) FROM [{t}]")
        cnt = cur.fetchone()[0]
        print(f"   • {t:<22} : {cnt:>4} records")

    # 2. Show Users
    print("\n" + "-" * 60)
    print("  TABLE: users (First 5 records)")
    print("-" * 60)
    cur.execute("SELECT id, full_name, email, role, is_active FROM users LIMIT 5;")
    for row in cur.fetchall():
        status = "Active" if row[4] else "Inactive"
        print(f"   ID {row[0]:<2} | {row[1]:<22} | {row[2]:<26} | Role: {row[3]:<5} | {status}")

    # 3. Show Farms
    print("\n" + "-" * 60)
    print("  TABLE: farms (First 5 records)")
    print("-" * 60)
    cur.execute("SELECT id, farm_name, state, district, area FROM farms LIMIT 5;")
    for row in cur.fetchall():
        print(f"   ID {row[0]:<2} | {row[1]:<20} | {row[2]:<15} | {row[3]:<12} | {row[4]} ha")

    # 4. Show Predictions
    print("\n" + "-" * 60)
    print("  TABLE: predictions (First 5 records)")
    print("-" * 60)
    cur.execute("SELECT id, crop, season, predicted_yield, confidence FROM predictions LIMIT 5;")
    for row in cur.fetchall():
        conf = f"{int(row[4] * 100)}%" if row[4] else "N/A"
        print(f"   ID {row[0]:<2} | Crop: {row[1]:<12} | Season: {row[2]:<8} | Yield: {row[3]:.2f} t/ha | Conf: {conf}")

    con.close()
    print("\n" + "=" * 60 + "\n")

if __name__ == "__main__":
    show_database()

