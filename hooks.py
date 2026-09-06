import re
from pathlib import Path

from markdown.extensions.toc import slugify
from mkdocs.structure.nav import Page, Section, Link


def extract_h1_headings(file_path):
    """Extract only # headings from a Markdown file."""

    headings = []

    with open(file_path, "r", encoding="utf-8") as file:
        lines = file.readlines()

    in_code_block = False

    for line in lines:
        stripped = line.strip()

        # Ignore fenced code blocks
        if stripped.startswith("```") or stripped.startswith("~~~"):
            in_code_block = not in_code_block
            continue

        if in_code_block:
            continue

        # Match ONLY # Heading
        # Does not match ## or ###
        match = re.match(r"^#\s+(.+?)\s*$", stripped)

        if match:
            title = match.group(1)

            # Remove optional trailing #
            title = re.sub(r"\s+#+\s*$", "", title)

            headings.append(title.strip())

    return headings


def create_anchor(title, used_ids):
    """Create an anchor compatible with Markdown TOC."""

    anchor = slugify(title, "-")

    original_anchor = anchor
    counter = 1

    while anchor in used_ids:
        anchor = f"{original_anchor}_{counter}"
        counter += 1

    used_ids.add(anchor)

    return anchor


def on_nav(nav, *, config, files):
    """
    Convert:

        Android: android.md

    into:

        Android
        ├── Android Architecture
        ├── Android Fundamentals
        └── Android Performance

    based on # headings inside android.md.
    """

    new_items = []

    for item in nav.items:

        # IMPORTANT:
        # nav entries such as "Android: android.md"
        # are Page objects.
        if not isinstance(item, Page):
            new_items.append(item)
            continue

        file_path = Path(item.file.abs_src_path)

        if not file_path.exists():
            new_items.append(item)
            continue

        # Get all # headings
        headings = extract_h1_headings(file_path)

        # No # headings -> keep normal page
        if not headings:
            new_items.append(item)
            continue

        children = []
        used_ids = set()

        for heading in headings:

            anchor = create_anchor(
                heading,
                used_ids
            )

            # Page URL + heading anchor
            url = f"{item.url}#{anchor}"

            children.append(
                Link(
                    title=heading,
                    url=url
                )
            )

        # Create top-level section
        section = Section(
            title=item.title,
            children=children
        )

        new_items.append(section)

    nav.items = new_items

    return nav
