#!/usr/bin/env bash
# ==============================================================================
# TPA Platform Unified Run & Orchestration Script
# Tollygunge Professional Association
# ==============================================================================

set -euo pipefail

# ANSI color codes for terminal formatting
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
RED="\033[0;31m"
DIM="\033[2m"
RESET="\033[0m"

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${APP_DIR}"

log_info() {
  echo -e "${CYAN}ℹ [TPA]${RESET} $1"
}

log_success() {
  echo -e "${GREEN}✔ [TPA]${RESET} $1"
}

log_warn() {
  echo -e "${YELLOW}⚠ [TPA]${RESET} $1"
}

log_error() {
  echo -e "${RED}✖ [TPA]${RESET} $1"
}

print_banner() {
  echo -e "${BOLD}${CYAN}"
  echo "  ╔═══════════════════════════════════════════════════════════════╗"
  echo "  ║           TOLLYGUNGE PROFESSIONAL ASSOCIATION (TPA)           ║"
  echo "  ║              Unified Platform Orchestration Runner            ║"
  echo "  ╚═══════════════════════════════════════════════════════════════╝"
  echo -e "${RESET}"
}

print_usage() {
  print_banner
  echo -e "${BOLD}Usage:${RESET} ./run.sh [COMMAND] [OPTIONS]"
  echo ""
  echo -e "${BOLD}Commands:${RESET}"
  echo -e "  ${GREEN}dev${RESET}              Start local development server (default)"
  echo -e "  ${GREEN}prod | start${RESET}     Run production supervisor (Web Server + Email Worker + Import Worker)"
  echo -e "  ${GREEN}build${RESET}            Build Next.js application & bundle background workers"
  echo -e "  ${GREEN}migrate${RESET}          Apply pending database migrations (with checksum & advisory locks)"
  echo -e "  ${GREEN}check${RESET}            Run repository structure check, linter, and typecheck"
  echo -e "  ${GREEN}test${RESET}             Run fast unit test suite"
  echo -e "  ${GREEN}test:integration${RESET} Run database & HTTP integration tests against local environment"
  echo -e "  ${GREEN}provision-admin${RESET}  Provision offline initial administrator account safely"
  echo -e "  ${GREEN}clean${RESET}            Clean build caches (.next, temp test results)"
  echo -e "  ${GREEN}help${RESET}             Show this help menu"
  echo ""
  echo -e "${BOLD}Environment Files:${RESET}"
  echo -e "  ${DIM}.env.local${RESET}        Local environment configuration (never committed)"
  echo -e "  ${DIM}.env.example${RESET}      Template containing all available variables"
  echo ""
  echo -e "${BOLD}Examples:${RESET}"
  echo -e "  ./run.sh dev         # Starts Next.js dev server at http://127.0.0.1:3000"
  echo -e "  ./run.sh migrate     # Applies SQL migrations 001-034"
  echo -e "  ./run.sh check       # Runs repo verification and linting"
  echo ""
}

check_prerequisites() {
  # Verify Node.js presence
  if ! command -v node >/dev/null 2>&1; then
    log_error "Node.js is not installed or not in PATH. Please install Node.js (v20+ or v24 recommended)."
    exit 1
  fi

  local node_version
  node_version=$(node -v | sed 's/v//')
  local major_version
  major_version=$(echo "${node_version}" | cut -d. -f1)

  if [ "${major_version}" -lt 20 ]; then
    log_warn "Node.js v${node_version} detected. Node.js v20.x or v24.x is recommended."
  fi

  # Check npm dependencies
  if [ ! -d "node_modules" ]; then
    log_warn "node_modules directory not found. Installing dependencies via 'npm ci'..."
    npm ci
    log_success "Dependencies installed."
  fi

  # Check environment file
  if [ ! -f ".env.local" ]; then
    log_warn ".env.local not found."
    if [ -f ".env.example" ]; then
      log_info "Creating .env.local from .env.example..."
      cp .env.example .env.local
      log_success "Created .env.local. Please review and configure your database and secrets."
    fi
  fi
}

cmd_dev() {
  print_banner
  check_prerequisites
  log_info "Starting development server at ${BOLD}http://127.0.0.1:3000${RESET}..."
  log_info "Synthetic Admin Preview: ${BOLD}http://127.0.0.1:3000/preview/admin${RESET}"
  log_info "Membership Preview:      ${BOLD}http://127.0.0.1:3000/join${RESET}"
  echo ""
  exec npm run dev
}

cmd_build() {
  print_banner
  check_prerequisites
  log_info "Building Next.js application and background workers..."
  npm run build
  log_success "Build complete. Output written to .next/"
}

cmd_prod() {
  print_banner
  check_prerequisites
  if [ ! -d ".next/standalone" ] && [ ! -f ".next/email-worker.mjs" ]; then
    log_warn "Build outputs not found. Running 'npm run build' first..."
    npm run build
  fi
  log_info "Starting production runtime supervisor..."
  log_info "Supervising: Next.js Web Server + Email Worker + Member Import Worker"
  exec node scripts/start-runtime.mjs
}

cmd_migrate() {
  print_banner
  check_prerequisites
  log_info "Running database migrations..."
  npm run db:migrate
  log_success "Database migrations up to date."
}

cmd_check() {
  print_banner
  check_prerequisites
  log_info "Step 1/3: Checking repository structure..."
  npm run check:structure

  log_info "Step 2/3: Running ESLint..."
  npm run lint

  log_info "Step 3/3: Running TypeScript typecheck..."
  npm run typecheck

  log_success "All repository and code quality checks passed!"
}

cmd_test() {
  print_banner
  check_prerequisites
  log_info "Running unit test suite..."
  npm test
}

cmd_test_integration() {
  print_banner
  check_prerequisites
  log_info "Running database integration tests..."
  npm run test:db
  log_info "Running HTTP integration tests..."
  npm run test:http
  log_success "Integration test suite completed."
}

cmd_provision_admin() {
  print_banner
  check_prerequisites
  log_warn "Provisioning offline first administrator account..."
  log_info "Target email: tollygungecacpestudycircle@gmail.com"
  
  export TPA_PROVISION_ADMIN="tollygungecacpestudycircle@gmail.com"
  node --env-file-if-exists=.env.local --import tsx scripts/provision-first-admin.mts
  log_success "Provisioning complete. Access credentials stored in .local/first-admin-password.txt"
}

cmd_clean() {
  print_banner
  log_info "Cleaning temporary build outputs and caches..."
  rm -rf .next out playwright-report test-results .local/launch-readiness .tsbuildinfo
  log_success "Clean completed."
}

# Main routing
COMMAND="${1:-dev}"

case "${COMMAND}" in
  dev)
    cmd_dev
    ;;
  prod|start)
    cmd_prod
    ;;
  build)
    cmd_build
    ;;
  migrate|db:migrate)
    cmd_migrate
    ;;
  check|verify)
    cmd_check
    ;;
  test)
    cmd_test
    ;;
  test:integration)
    cmd_test_integration
    ;;
  provision-admin)
    cmd_provision_admin
    ;;
  clean)
    cmd_clean
    ;;
  help|--help|-h)
    print_usage
    ;;
  *)
    log_error "Unknown command: ${COMMAND}"
    print_usage
    exit 1
    ;;
esac
