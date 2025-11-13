# VS Code Setup Guide

Complete configuration for optimal development experience with doksAI project.

## Overview

The `.vscode/` directory contains pre-configured settings, debug configurations, and recommended extensions to streamline development workflow.

## Files Configuration

### .vscode/settings.json
Workspace-level configuration:

**Vitest Integration:**
```json
{
  "vitest.enable": true,
  "vitest.commandLine": "bun run test"
}
```

**Formatting:**
- Prettier configured as default formatter for JS, TS, Vue
- Auto-formatting on save
- ESLint auto-fix on save

**Testing:**
- Auto-open test failure peek view
- Disabled inline hints (enable on demand with Ctrl+Alt+H)

**Search/File Exclusions:**
- Excludes node_modules, dist, .vite, coverage from search
- Hides node_modules and dist from file explorer

### .vscode/extensions.json
Recommended VS Code extensions automatically suggested when opening project:

**Required for Development:**
- **vitest.explorer** - Test explorer sidebar
- **esbenp.prettier-vscode** - Code formatter
- **dbaeumer.vscode-eslint** - ESLint support
- **Vue.volar** - Vue 3 language support

**Recommended:**
- **bradlc.vscode-tailwindcss** - Tailwind CSS class IntelliSense
- **eamodio.gitlens** - Git blame, history, and comparison
- **GitHub.copilot** - AI code assistant

### .vscode/launch.json
Debug configurations for testing and development:

**Debug Vitest Tests**
- Debug entire test suite with breakpoints
- Single-threaded for reliable breakpoints
- Uses bun runtime

**Debug Vitest (Current File)**
- Debug only the current test file
- Useful for isolated test debugging
- Same single-threaded setup

**Launch Chrome**
- Debug app in Chrome browser
- Points to http://localhost:5173
- Requires dev server running first

### .vscode/tasks.json
Quick-access tasks from Command Palette:

**Testing Tasks:**
```
Test: Run All Tests        - Single run of full suite
Test: Watch Mode           - Watch mode for auto-rerun
Test: UI Mode              - Vitest UI dashboard
Test: Coverage Report      - Generate coverage metrics
```

**Build Tasks:**
```
Build: Development         - Start dev server
Build: Production          - Build for production
Lint: Fix All              - Run linting and formatting
Format: Code               - Format with Prettier
```

## Getting Started

### First Time Setup

1. **Clone/Open Project**
   - Open project folder in VS Code

2. **Install Extensions**
   - VS Code will prompt to install recommended extensions
   - Click "Install All" or install individually

3. **Verify Configuration**
   - Command Palette (Ctrl+Shift+P) → "Developer: Check Extension Status"
   - Verify vitest.explorer is active

### Running Tests

**From Command Palette:**
1. Press Ctrl+Shift+P
2. Type "Tasks: Run Task"
3. Select desired test task

**From Test Explorer:**
1. Look for Test icon in left sidebar
2. Browse test files and suites
3. Click play icon to run specific test
4. Click debug icon to debug test

**From Terminal:**
```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test:ui                # UI dashboard
npm run coverage           # Coverage report
```

## Key Features

### Vitest Explorer
- Sidebar panel showing all test files
- Hierarchical view of test suites
- Run/debug individual tests with one click
- See test status with colored icons

### Auto-Formatting
- Code formats automatically on save
- Applies both Prettier and ESLint fixes
- Works for JS, TS, and Vue files
- Manual format: Right-click → Format Document

### Debugging Tests
1. Set breakpoints (click line number)
2. Press Ctrl+Shift+D to open Run and Debug
3. Select debug configuration
4. Press F5 or click play button
5. Debugger pauses at breakpoints

### Test Output
- Terminal shows test output
- Failed tests display in Problems panel
- Quick navigation to test source
- Click error to jump to failing code

### Git Integration
- GitLens shows blame annotations
- Hover gutter to see commit details
- View file history and changes
- Compare with other branches

### Code IntelliSense
- Tailwind CSS class suggestions
- Vue component suggestions
- TypeScript type hints
- Import path auto-completion

## Usage Tips

### Run Current File Tests
1. Open test file
2. Ctrl+Shift+D → "Debug Vitest (Current File)"
3. Press F5

### Run Specific Test
1. Open Test Explorer
2. Click test name to highlight
3. Click play icon to run
4. Click debug icon to debug

### Format Code
1. Save file (auto-formats) or
2. Right-click → Format Document or
3. Run "Format: Code" task

### View Coverage
1. Run "Test: Coverage Report" task
2. Open coverage/index.html in browser
3. Explore coverage by file

### Debug in Browser
1. Run "Build: Development" task
2. Run "Launch Chrome" debug configuration
3. Set breakpoints in code
4. Interact with app, hits breakpoints

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Tasks | Ctrl+Shift+P → Tasks |
| Run Tests | Ctrl+Shift+P → Test: Run |
| Debug Tests | Ctrl+Shift+D → Select config |
| Format Code | Shift+Alt+F |
| Go to File | Ctrl+P |
| Command Palette | Ctrl+Shift+P |
| Debug Start | F5 |
| Debug Stop | Shift+F5 |
| Toggle Breakpoint | F9 |
| Step Over | F10 |
| Step Into | F11 |

### Custom Shortcuts

Add to VS Code keybindings.json:

```json
{
  "key": "ctrl+shift+alt+t",
  "command": "workbench.action.tasks.runTask",
  "args": "Test: Run All Tests"
},
{
  "key": "ctrl+shift+alt+w",
  "command": "workbench.action.tasks.runTask",
  "args": "Test: Watch Mode"
},
{
  "key": "ctrl+shift+alt+c",
  "command": "workbench.action.tasks.runTask",
  "args": "Test: Coverage Report"
}
```

## Extension Details

### Vitest Explorer
- **ID:** vitest.explorer
- **Purpose:** Test discovery and execution in sidebar
- **Requirements:** Vitest project configured
- **Usage:** Click test icon in sidebar

### Prettier
- **ID:** esbenp.prettier-vscode
- **Purpose:** Code formatting
- **Config:** .prettierrc.json in project root
- **Usage:** Auto on save or format manually

### ESLint
- **ID:** dbaeumer.vscode-eslint
- **Purpose:** Code linting
- **Config:** eslint.config.ts in project root
- **Usage:** Auto-fix on save, inline error display

### Volar
- **ID:** Vue.volar
- **Purpose:** Vue 3 language support
- **Features:** Syntax highlighting, IntelliSense, debugging
- **Requirements:** Take Over Mode recommended

### Tailwind CSS
- **ID:** bradlc.vscode-tailwindcss
- **Purpose:** Tailwind class IntelliSense
- **Usage:** Type class names, get completions
- **Config:** tailwind.config.js in project

### GitLens
- **ID:** eamodio.gitlens
- **Purpose:** Git integration
- **Features:** Blame, history, comparison
- **Usage:** Hover gutter for blame, use sidebar for history

### GitHub Copilot
- **ID:** GitHub.copilot
- **Purpose:** AI code assistant
- **Cost:** Requires subscription
- **Usage:** Accept suggestions (Tab) or dismiss (Escape)

## Troubleshooting

### Vitest Explorer Not Showing
**Solution:**
1. Install vitest.explorer extension
2. Reload VS Code: Cmd+R (Mac) or Ctrl+Shift+P → Reload Window
3. Ensure test files match pattern (*.test.ts)

### Tests Not Running
**Solution:**
1. Verify bun is installed: `bun --version`
2. Check test command: `npm test -- --run`
3. Ensure test files exist in src/
4. Check vitest.config.ts exists

### Formatter Not Applying
**Solution:**
1. Verify Prettier extension installed
2. Check settings.json has formatOnSave: true
3. Try manual format: Right-click → Format Document
4. Reload window if still not working

### Breakpoints Not Stopping
**Solution:**
1. Verify --single-thread flag in launch.json
2. Check breakpoint is on executable line
3. Ensure breakpoint is not grayed out
4. Restart debug session
5. Check test file syntax is valid

### Extensions Not Installing
**Solution:**
1. Click Extensions in sidebar
2. Search extension ID directly
3. Click Install on correct extension
4. Reload window if needed
5. Check VS Code version is latest

### Debug Port Already in Use
**Solution:**
1. Kill process on port: `lsof -ti :9229 | xargs kill`
2. Or change port in launch.json
3. Wait a moment and retry debug session

## Performance Optimization

### Editor Performance
- Disable unused extensions
- Use file exclusions in settings
- Disable breadcrumbs if not needed
- Disable minimap if large files

### Search Performance
- Exclude node_modules, dist, coverage
- Use glob patterns effectively
- Limit search scope to folders

### Extension Performance
- Install only needed extensions
- Disable extensions per workspace
- Check Extension Marketplace reviews
- Monitor Extension Host CPU usage

## Advanced Configuration

### Add Custom Task
Edit .vscode/tasks.json:
```json
{
  "label": "My Custom Task",
  "type": "shell",
  "command": "echo",
  "args": ["Hello World"]
}
```

### Add Debug Configuration
Edit .vscode/launch.json:
```json
{
  "type": "node",
  "request": "launch",
  "name": "My Debug Config",
  "program": "${workspaceFolder}/script.js"
}
```

### Conditional Settings
```json
{
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Resources

- [VS Code Docs](https://code.visualstudio.com/docs)
- [Vitest Docs](https://vitest.dev/)
- [Prettier Docs](https://prettier.io/)
- [ESLint Docs](https://eslint.org/)
- [Volar Docs](https://github.com/johnsoncodehk/volar)

## Summary

The VS Code configuration provides:

✓ **Testing:** Full Vitest integration with explorer and debugging  
✓ **Code Quality:** Prettier and ESLint auto-fix on save  
✓ **Development:** Dev server and build tasks  
✓ **Debugging:** Breakpoints and step debugging  
✓ **Git:** GitLens integration for history and blame  
✓ **Intelligence:** IntelliSense for TypeScript, Vue, Tailwind  
✓ **AI Assistance:** GitHub Copilot integration  

Everything is pre-configured and ready to use!
