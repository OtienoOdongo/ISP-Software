import subprocess
from pathlib import Path

def update_requirements(requirements_file="requirements.txt"):
    # Get the path and ensure the file exists
    req_path = Path(requirements_file)
    if not req_path.exists():
        req_path.touch()

    # Read current packages already in the file
    with open(req_path, "r") as f:
        existing_lines = set(line.strip().lower() for line in f if line.strip())

    # Get all installed packages
    installed_packages = subprocess.check_output(["pip", "freeze"]).decode("utf-8").splitlines()

    new_packages = []
    for pkg in installed_packages:
        pkg_name = pkg.split("==")[0].lower()
        # Add only if not already in requirements
        if not any(pkg_name in line for line in existing_lines):
            new_packages.append(pkg)

    if new_packages:
        with open(req_path, "a") as f:
            f.write("\n".join(new_packages) + "\n")
        print(f"✅ Added {len(new_packages)} new packages to {requirements_file}.")
    else:
        print("✅ No new packages to add — everything is up to date.")

if __name__ == "__main__":
    update_requirements()


# Run => python update_requirements.py
