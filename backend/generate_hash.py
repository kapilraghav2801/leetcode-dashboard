"""
Run this once to generate your bcrypt password hash.
Then put the output into ADMIN_PASSWORD_HASH in your .env

Usage:
    python generate_hash.py yourpassword
"""
import sys
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python generate_hash.py <your_password>")
        sys.exit(1)
    password = sys.argv[1]
    hashed = pwd_context.hash(password)
    print(f"\nPassword hash (paste this into .env as ADMIN_PASSWORD_HASH):\n{hashed}\n")
