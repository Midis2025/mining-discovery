#!/usr/bin/env python3
"""
Script to add mobile navigation (tab bar & sidebar) to all HTML files
"""

import os
import re
from pathlib import Path

# Mobile navigation HTML snippet
MOBILE_NAV_SNIPPET = '''
<!-- ======================================== -->
<!-- MOBILE NAVIGATION: TAB BAR & SIDEBAR    -->
<!-- ======================================== -->

<!-- Mobile Sidebar for News Categories -->
<div class="mobile-sidebar" id="mobileSidebar">
  <div class="sidebar-header">
    <h3>News Categories</h3>
    <button class="sidebar-close" onclick="closeSidebar()">
      <i class="fas fa-times"></i>
    </button>
  </div>
  <div class="sidebar-content" id="sidebarNewsCategories">
    <a href="{path_prefix}/page/latest-news" class="sidebar-item">
      <i class="fas fa-newspaper"></i>
      <span>Latest News</span>
    </a>
    <a href="{path_prefix}/page/gold-news" class="sidebar-item">
      <i class="fas fa-coins"></i>
      <span>Gold News</span>
    </a>
    <a href="{path_prefix}/page/silver-news" class="sidebar-item">
      <i class="fas fa-circle"></i>
      <span>Silver News</span>
    </a>
    <a href="{path_prefix}/page/copper-news" class="sidebar-item">
      <i class="fas fa-industry"></i>
      <span>Copper News</span>
    </a>
    <a href="{path_prefix}/page/precious-metals" class="sidebar-item">
      <i class="fas fa-gem"></i>
      <span>Precious Metals</span>
    </a>
    <a href="{path_prefix}/page/corporate-news" class="sidebar-item">
      <i class="fas fa-building"></i>
      <span>Corporate News</span>
    </a>
    <a href="{path_prefix}/page/world-news" class="sidebar-item">
      <i class="fas fa-globe"></i>
      <span>World News</span>
    </a>
    <a href="{path_prefix}/page/leadership-thoughts" class="sidebar-item">
      <i class="fas fa-user-tie"></i>
      <span>Leadership Thoughts</span>
    </a>
    <a href="{path_prefix}/page/research-reports" class="sidebar-item">
      <i class="fas fa-file-alt"></i>
      <span>Research Reports</span>
    </a>
    <a href="{path_prefix}/page/announcement" class="sidebar-item">
      <i class="fas fa-bullhorn"></i>
      <span>Announcements</span>
    </a>
    <a href="{path_prefix}/page/evening-chatter" class="sidebar-item">
      <i class="fas fa-comments"></i>
      <span>Evening Chatter</span>
    </a>
    <a href="{path_prefix}/page/popular-this-week" class="sidebar-item">
      <i class="fas fa-fire"></i>
      <span>Popular This Week</span>
    </a>
    <a href="{path_prefix}/page/projects" class="sidebar-item">
      <i class="fas fa-project-diagram"></i>
      <span>Projects</span>
    </a>
    <a href="{path_prefix}/page/sponsored-post" class="sidebar-item">
      <i class="fas fa-ad"></i>
      <span>Sponsored Post</span>
    </a>
    <a href="{path_prefix}/page/whats-on" class="sidebar-item">
      <i class="fas fa-calendar-alt"></i>
      <span>What's On</span>
    </a>
  </div>
</div>

<!-- Sidebar Overlay -->
<div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>

<!-- Mobile Bottom Tab Bar -->
<nav class="mobile-tab-bar">
  <a href="{path_prefix}/index.html" class="tab-item">
    <i class="fas fa-home"></i>
    <span>Home</span>
  </a>
  <a href="#" class="tab-item" onclick="openSidebar(); return false;">
    <i class="fas fa-newspaper"></i>
    <span>News</span>
  </a>
  <a href="{path_prefix}/magazine" class="tab-item">
    <i class="fas fa-book"></i>
    <span>Magazine</span>
  </a>
  <a href="{path_prefix}/service.html" class="tab-item">
    <i class="fas fa-briefcase"></i>
    <span>Services</span>
  </a>
  <a href="#" class="tab-item" onclick="toggleMenu(); return false;">
    <i class="fas fa-bars"></i>
    <span>More</span>
  </a>
</nav>

<!-- Mobile Navigation Script -->
<script src="{js_path}/js/mobile-navigation.js"></script>

'''

def get_path_prefix(file_path):
    """Get the path prefix based on file location"""
    if '/page/article/' in str(file_path):
        return '../..'
    elif '/page/' in str(file_path):
        return '..'
    else:
        return '.'

def has_mobile_nav(content):
    """Check if file already has mobile navigation"""
    return 'mobile-tab-bar' in content or 'mobile-sidebar' in content

def add_mobile_nav_to_file(file_path):
    """Add mobile navigation to a single HTML file"""
    print(f"Processing: {file_path}")

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Skip if already has mobile nav
        if has_mobile_nav(content):
            print(f"  ✓ Already has mobile navigation, skipping")
            return False

        # Check if file has </body> tag
        if '</body>' not in content:
            print(f"  ✗ No </body> tag found, skipping")
            return False

        # Get path prefix
        path_prefix = get_path_prefix(file_path)
        js_path = path_prefix

        # Format snippet with correct paths
        snippet = MOBILE_NAV_SNIPPET.format(
            path_prefix=path_prefix,
            js_path=js_path
        )

        # Insert before </body> tag
        content = content.replace('</body>', f'{snippet}\n</body>')

        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"  ✓ Mobile navigation added successfully")
        return True

    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def main():
    """Main function to process all HTML files"""
    base_dir = Path(__file__).parent

    print("=" * 60)
    print("Adding Mobile Navigation to All HTML Files")
    print("=" * 60)

    files_processed = 0
    files_updated = 0

    # Skip these files
    skip_files = {'mobile-nav-snippet.html', 'rough.html'}

    # Process root HTML files
    print("\n📁 Processing ROOT directory files...")
    for html_file in base_dir.glob('*.html'):
        if html_file.name not in skip_files:
            files_processed += 1
            if add_mobile_nav_to_file(html_file):
                files_updated += 1

    # Process /page/ directory files
    page_dir = base_dir / 'page'
    if page_dir.exists():
        print("\n📁 Processing /page/ directory files...")
        for html_file in page_dir.glob('*.html'):
            files_processed += 1
            if add_mobile_nav_to_file(html_file):
                files_updated += 1

    # Process /page/article/ directory files
    article_dir = base_dir / 'page' / 'article'
    if article_dir.exists():
        print("\n📁 Processing /page/article/ directory files...")
        for html_file in article_dir.glob('*.html'):
            files_processed += 1
            if add_mobile_nav_to_file(html_file):
                files_updated += 1

    print("\n" + "=" * 60)
    print(f"✅ Complete!")
    print(f"   Files processed: {files_processed}")
    print(f"   Files updated: {files_updated}")
    print(f"   Files skipped: {files_processed - files_updated}")
    print("=" * 60)

if __name__ == '__main__':
    main()
