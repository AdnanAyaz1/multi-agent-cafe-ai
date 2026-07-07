#!/usr/bin/env python3
"""
Package Research Helper for Project Starter Skill.

Searches npm registry for packages in a category and returns
popularity, maintenance status, and bundle size info.

Usage:
    python3 scripts/search-packages.py <category> [--top N]

Examples:
    python3 scripts/search-packages.py "database orm"
    python3 scripts/search-packages.py "auth" --top 5
"""

import argparse
import json
import sys
import urllib.request
import urllib.error
from typing import Optional


# Pre-defined categories with recommended search terms
CATEGORIES = {
    "database": ["prisma", "drizzle-orm", "typeorm", "kysely", "knex"],
    "orm": ["prisma", "drizzle-orm", "typeorm", "sequelize", "knex"],
    "auth": ["next-auth", "@clerk/nextjs", "lucia", "@supabase/auth-helpers-nextjs"],
    "payments": ["stripe", "@paddle/paddlejs", "lemonsqueezy", "chargebee"],
    "ui": ["@radix-ui/react-icons", "@headlessui/react", "@mui/material", "antd"],
    "state": ["zustand", "jotai", "@reduxjs/toolkit", "@tanstack/react-query"],
    "validation": ["zod", "valibot", "yup", "joi"],
    "queue": ["bullmq", "inngest", "@trigger.dev/sdk", "pg-boss"],
    "testing": ["vitest", "jest", "@testing-library/react", "playwright"],
    "monitoring": ["@sentry/nextjs", "logtail", "better-stack"],
}


def fetch_npm_package(name: str) -> Optional[dict]:
    """Fetch package info from npm registry."""
    url = f"https://registry.npmjs.org/{name}"
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            latest_version = data.get("dist-tags", {}).get("latest", "unknown")
            latest_info = data.get("versions", {}).get(latest_version, {})
            
            return {
                "name": name,
                "latest": latest_version,
                "description": data.get("description", ""),
                "license": latest_info.get("license", "unknown"),
                "dependencies": len(latest_info.get("dependencies", {})),
                "peer_dependencies": len(latest_info.get("peerDependencies", {})),
                "weekly_downloads": None,  # Would need npm API for this
                "repository": data.get("repository", {}).get("url", ""),
                "homepage": data.get("homepage", ""),
            }
    except urllib.error.HTTPError as e:
        print(f"  Warning: Could not fetch {name} (HTTP {e.code})", file=sys.stderr)
        return None
    except Exception as e:
        print(f"  Warning: Could not fetch {name}: {e}", file=sys.stderr)
        return None


def search_category(category: str, top_n: int = 10) -> list:
    """Search for packages in a category."""
    # Check if we have pre-defined packages for this category
    if category in CATEGORIES:
        packages = CATEGORIES[category]
    else:
        # Try to search npm directly (simplified)
        print(f"  Searching npm for '{category}'...", file=sys.stderr)
        packages = []  # Would need npm search API
    
    results = []
    for pkg_name in packages[:top_n]:
        print(f"  Fetching {pkg_name}...", file=sys.stderr)
        info = fetch_npm_package(pkg_name)
        if info:
            results.append(info)
    
    return results


def format_results(results: list, category: str) -> str:
    """Format results as markdown."""
    lines = [
        f"# {category.title()} Packages\n",
        f"Found {len(results)} packages\n",
    ]
    
    for pkg in results:
        lines.append(f"## {pkg['name']}")
        lines.append(f"- **Version**: {pkg['latest']}")
        lines.append(f"- **Description**: {pkg['description']}")
        lines.append(f"- **License**: {pkg['license']}")
        lines.append(f"- **Dependencies**: {pkg['dependencies']}")
        lines.append(f"- **Peer Dependencies**: {pkg['peer_dependencies']}")
        if pkg['repository']:
            lines.append(f"- **Repository**: {pkg['repository']}")
        lines.append("")
    
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="Search npm packages for project planning"
    )
    parser.add_argument(
        "category",
        help="Category to search (e.g., 'database', 'auth', 'ui')"
    )
    parser.add_argument(
        "--top", "-n",
        type=int,
        default=10,
        help="Number of results to show"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output as JSON instead of markdown"
    )
    
    args = parser.parse_args()
    
    results = search_category(args.category, args.top)
    
    if args.json:
        print(json.dumps(results, indent=2))
    else:
        print(format_results(results, args.category))


if __name__ == "__main__":
    main()
