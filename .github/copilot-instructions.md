# Copilot Instructions for duddudcns.github.io

## Project Overview
This is a GitHub Pages personal website repository (hosted at `https://duddudcns.github.io`). It serves as a central hub for presenting projects, content, and professional information.

## Key Conventions and Patterns

### Repository Structure
- **Root level**: Static site files and configuration
- **Expected structure**: Typically Jekyll-based (Jekyll is GitHub Pages default) or HTML/CSS/JS static site
- The `main` branch is automatically published to GitHub Pages

### Before Adding Features
1. Check if Jekyll is configured:
   - Look for `_config.yml` (Jekyll configuration)
   - Check for Gemfile (Ruby dependencies)
   - If using Jekyll, content goes in `_posts/` and layouts in `_layouts/`

2. If starting fresh (no config files exist):
   - Default to plain HTML/CSS/JS (simplest approach)
   - OR initialize Jekyll if complex site is planned
   - Add `.gitignore` with `_site/`, `Gemfile.lock`, `.jekyll-cache/`

### Common Development Workflows
- **Testing locally**: If Jekyll: `bundle exec jekyll serve`; if static HTML: use any HTTP server
- **Building**: Jekyll auto-builds on push to `main`; static sites require no build step
- **Content updates**: Direct edits to HTML/CSS/JS or Jekyll markdown posts

### Important Files to Create as Site Develops
- `index.html` - Homepage
- `_config.yml` - Global configuration (if using Jekyll)
- `assets/css/` - Stylesheets
- `assets/js/` - Scripts
- `.gitignore` - Version control exclusions

## Key Architectural Decisions
- Uses GitHub Pages native hosting (no external deployment)
- Branch protection likely needed to prevent breaking the live site
- All commits to `main` are automatically published

## For Future Development
When expanding this site:
1. Keep builds and deployments simple - avoid complex build steps if possible
2. Test changes locally before pushing to `main`
3. Consider adding GitHub Actions workflow if specialized builds are needed
4. Maintain clear separation between source and generated files
