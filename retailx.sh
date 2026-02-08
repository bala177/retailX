#!/bin/bash

# RetailX Management Script
# Usage: ./retailx.sh [command]

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
ADMIN_DIR="$PROJECT_DIR/admin"
STOREFRONT_DIR="$PROJECT_DIR/storefront"

BACKEND_PORT=5000
ADMIN_PORT=5001
STOREFRONT_PORT=5002
MONGO_PORT=27017

# PID files
PID_DIR="$PROJECT_DIR/.pids"
BACKEND_PID="$PID_DIR/backend.pid"
ADMIN_PID="$PID_DIR/admin.pid"
STOREFRONT_PID="$PID_DIR/storefront.pid"

# Log files
LOG_DIR="$PROJECT_DIR/logs"
BACKEND_LOG="$LOG_DIR/backend.log"
ADMIN_LOG="$LOG_DIR/admin.log"
STOREFRONT_LOG="$LOG_DIR/storefront.log"

# Ensure directories exist
mkdir -p "$PID_DIR" "$LOG_DIR"

# Print banner
print_banner() {
    echo -e "${PURPLE}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║           RetailX - Multi-Tenant eCommerce Platform       ║"
    echo "║                    Management Console                     ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Print status
print_status() {
    local service=$1
    local status=$2
    local port=$3
    
    if [ "$status" == "running" ]; then
        echo -e "  ${GREEN}●${NC} $service ${GREEN}running${NC} on port $port"
    else
        echo -e "  ${RED}○${NC} $service ${RED}stopped${NC}"
    fi
}

# Check if a port is in use
is_port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Get PID using port
get_pid_by_port() {
    lsof -t -i :$1 2>/dev/null
}

# Kill process on port
kill_port() {
    local port=$1
    local pids=$(get_pid_by_port $port)
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}Killing processes on port $port: $pids${NC}"
        echo $pids | xargs kill -9 2>/dev/null
        sleep 1
    fi
}

# Start Backend
start_backend() {
    echo -e "${CYAN}Starting Backend API...${NC}"
    
    if is_port_in_use $BACKEND_PORT; then
        echo -e "${YELLOW}Port $BACKEND_PORT is in use. Stopping existing process...${NC}"
        kill_port $BACKEND_PORT
    fi
    
    cd "$BACKEND_DIR"
    nohup npm run dev > "$BACKEND_LOG" 2>&1 &
    local pid=$!
    echo $pid > "$BACKEND_PID"
    
    # Wait for startup
    sleep 3
    
    if is_port_in_use $BACKEND_PORT; then
        echo -e "${GREEN}✓ Backend started successfully (PID: $pid)${NC}"
    else
        echo -e "${RED}✗ Backend failed to start. Check logs: $BACKEND_LOG${NC}"
    fi
}

# Start Admin Panel
start_admin() {
    echo -e "${CYAN}Starting Admin Panel...${NC}"
    
    if is_port_in_use $ADMIN_PORT; then
        echo -e "${YELLOW}Port $ADMIN_PORT is in use. Stopping existing process...${NC}"
        kill_port $ADMIN_PORT
    fi
    
    cd "$ADMIN_DIR"
    nohup npm run dev -- --port $ADMIN_PORT > "$ADMIN_LOG" 2>&1 &
    local pid=$!
    echo $pid > "$ADMIN_PID"
    
    sleep 3
    
    if is_port_in_use $ADMIN_PORT; then
        echo -e "${GREEN}✓ Admin Panel started successfully (PID: $pid)${NC}"
    else
        echo -e "${RED}✗ Admin Panel failed to start. Check logs: $ADMIN_LOG${NC}"
    fi
}

# Start Storefront
start_storefront() {
    echo -e "${CYAN}Starting Storefront...${NC}"
    
    if is_port_in_use $STOREFRONT_PORT; then
        echo -e "${YELLOW}Port $STOREFRONT_PORT is in use. Stopping existing process...${NC}"
        kill_port $STOREFRONT_PORT
    fi
    
    cd "$STOREFRONT_DIR"
    nohup npm run dev -- --port $STOREFRONT_PORT > "$STOREFRONT_LOG" 2>&1 &
    local pid=$!
    echo $pid > "$STOREFRONT_PID"
    
    sleep 3
    
    if is_port_in_use $STOREFRONT_PORT; then
        echo -e "${GREEN}✓ Storefront started successfully (PID: $pid)${NC}"
    else
        echo -e "${RED}✗ Storefront failed to start. Check logs: $STOREFRONT_LOG${NC}"
    fi
}

# Start all services
start_all() {
    print_banner
    echo -e "${BLUE}Starting all services...${NC}\n"
    start_backend
    start_admin
    start_storefront
    echo ""
    status
}

# Stop Backend
stop_backend() {
    echo -e "${CYAN}Stopping Backend...${NC}"
    kill_port $BACKEND_PORT
    rm -f "$BACKEND_PID"
    echo -e "${GREEN}✓ Backend stopped${NC}"
}

# Stop Admin
stop_admin() {
    echo -e "${CYAN}Stopping Admin Panel...${NC}"
    kill_port $ADMIN_PORT
    rm -f "$ADMIN_PID"
    echo -e "${GREEN}✓ Admin Panel stopped${NC}"
}

# Stop Storefront
stop_storefront() {
    echo -e "${CYAN}Stopping Storefront...${NC}"
    kill_port $STOREFRONT_PORT
    rm -f "$STOREFRONT_PID"
    echo -e "${GREEN}✓ Storefront stopped${NC}"
}

# Stop all services
stop_all() {
    print_banner
    echo -e "${BLUE}Stopping all services...${NC}\n"
    stop_backend
    stop_admin
    stop_storefront
    echo -e "\n${GREEN}All services stopped.${NC}"
}

# Restart all services
restart_all() {
    print_banner
    echo -e "${BLUE}Restarting all services...${NC}\n"
    stop_all
    sleep 2
    echo ""
    start_all
}

# Status of all services
status() {
    print_banner
    echo -e "${BLUE}Service Status:${NC}\n"
    
    if is_port_in_use $BACKEND_PORT; then
        print_status "Backend API" "running" $BACKEND_PORT
    else
        print_status "Backend API" "stopped" $BACKEND_PORT
    fi
    
    if is_port_in_use $ADMIN_PORT; then
        print_status "Admin Panel" "running" $ADMIN_PORT
    else
        print_status "Admin Panel" "stopped" $ADMIN_PORT
    fi
    
    if is_port_in_use $STOREFRONT_PORT; then
        print_status "Storefront" "running" $STOREFRONT_PORT
    else
        print_status "Storefront" "stopped" $STOREFRONT_PORT
    fi
    
    # Check MongoDB
    echo ""
    if is_port_in_use $MONGO_PORT; then
        echo -e "  ${GREEN}●${NC} MongoDB ${GREEN}running${NC} on port $MONGO_PORT"
    else
        echo -e "  ${RED}○${NC} MongoDB ${RED}not detected${NC} on port $MONGO_PORT"
    fi
    
    echo -e "\n${BLUE}URLs:${NC}"
    echo "  Backend API:  http://localhost:$BACKEND_PORT"
    echo "  Admin Panel:  http://localhost:$ADMIN_PORT"
    echo "  Storefront:   http://localhost:$STOREFRONT_PORT"
}

# View logs
logs() {
    local service=$1
    
    case $service in
        backend|api)
            echo -e "${CYAN}=== Backend Logs ===${NC}"
            tail -f "$BACKEND_LOG"
            ;;
        admin)
            echo -e "${CYAN}=== Admin Panel Logs ===${NC}"
            tail -f "$ADMIN_LOG"
            ;;
        storefront|store)
            echo -e "${CYAN}=== Storefront Logs ===${NC}"
            tail -f "$STOREFRONT_LOG"
            ;;
        all|*)
            echo -e "${CYAN}=== All Logs (Combined) ===${NC}"
            tail -f "$BACKEND_LOG" "$ADMIN_LOG" "$STOREFRONT_LOG"
            ;;
    esac
}

# View recent logs
logs_recent() {
    local lines=${1:-50}
    
    echo -e "${CYAN}=== Recent Backend Logs ===${NC}"
    tail -n $lines "$BACKEND_LOG" 2>/dev/null || echo "No logs found"
    
    echo -e "\n${CYAN}=== Recent Admin Logs ===${NC}"
    tail -n $lines "$ADMIN_LOG" 2>/dev/null || echo "No logs found"
    
    echo -e "\n${CYAN}=== Recent Storefront Logs ===${NC}"
    tail -n $lines "$STOREFRONT_LOG" 2>/dev/null || echo "No logs found"
}

# Cleanup
cleanup() {
    print_banner
    echo -e "${BLUE}Cleaning up...${NC}\n"
    
    # Stop all services
    stop_all
    
    echo -e "\n${YELLOW}Cleaning build artifacts...${NC}"
    
    # Clean node_modules caches
    rm -rf "$PROJECT_DIR/node_modules/.cache" 2>/dev/null
    rm -rf "$BACKEND_DIR/node_modules/.cache" 2>/dev/null
    rm -rf "$ADMIN_DIR/node_modules/.cache" 2>/dev/null
    rm -rf "$STOREFRONT_DIR/node_modules/.cache" 2>/dev/null
    
    # Clean build directories
    rm -rf "$ADMIN_DIR/dist" 2>/dev/null
    rm -rf "$STOREFRONT_DIR/dist" 2>/dev/null
    
    # Clean logs
    rm -f "$LOG_DIR"/*.log 2>/dev/null
    
    # Clean PIDs
    rm -f "$PID_DIR"/*.pid 2>/dev/null
    
    echo -e "${GREEN}✓ Cleanup complete${NC}"
}

# Deep cleanup (including node_modules)
cleanup_deep() {
    print_banner
    echo -e "${RED}WARNING: This will remove all node_modules directories!${NC}"
    read -p "Are you sure? (y/N): " confirm
    
    if [ "$confirm" == "y" ] || [ "$confirm" == "Y" ]; then
        cleanup
        
        echo -e "\n${YELLOW}Removing node_modules...${NC}"
        rm -rf "$PROJECT_DIR/node_modules"
        rm -rf "$BACKEND_DIR/node_modules"
        rm -rf "$ADMIN_DIR/node_modules"
        rm -rf "$STOREFRONT_DIR/node_modules"
        
        echo -e "${GREEN}✓ Deep cleanup complete. Run 'npm install' in each directory to reinstall.${NC}"
    else
        echo "Cancelled."
    fi
}

# Install dependencies
install() {
    print_banner
    echo -e "${BLUE}Installing dependencies...${NC}\n"
    
    echo -e "${CYAN}Installing root dependencies...${NC}"
    cd "$PROJECT_DIR" && npm install
    
    echo -e "\n${CYAN}Installing backend dependencies...${NC}"
    cd "$BACKEND_DIR" && npm install
    
    echo -e "\n${CYAN}Installing admin dependencies...${NC}"
    cd "$ADMIN_DIR" && npm install
    
    echo -e "\n${CYAN}Installing storefront dependencies...${NC}"
    cd "$STOREFRONT_DIR" && npm install
    
    echo -e "\n${GREEN}✓ All dependencies installed${NC}"
}

# Seed database
seed() {
    print_banner
    echo -e "${BLUE}Seeding database...${NC}\n"
    
    cd "$BACKEND_DIR"
    node src/scripts/seedEnterprise.js
    
    echo -e "\n${GREEN}✓ Database seeded${NC}"
}

# Health check
health() {
    print_banner
    echo -e "${BLUE}Health Check:${NC}\n"
    
    echo -e "${CYAN}Backend API:${NC}"
    if curl -s "http://localhost:$BACKEND_PORT/api/v1/health" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓ API is healthy${NC}"
        curl -s "http://localhost:$BACKEND_PORT/api/v1/health" | python3 -m json.tool 2>/dev/null || echo "  Response received"
    else
        echo -e "  ${RED}✗ API is not responding${NC}"
    fi
    
    echo -e "\n${CYAN}Admin Panel:${NC}"
    if curl -s "http://localhost:$ADMIN_PORT" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓ Admin Panel is responding${NC}"
    else
        echo -e "  ${RED}✗ Admin Panel is not responding${NC}"
    fi
    
    echo -e "\n${CYAN}Storefront:${NC}"
    if curl -s "http://localhost:$STOREFRONT_PORT" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓ Storefront is responding${NC}"
    else
        echo -e "  ${RED}✗ Storefront is not responding${NC}"
    fi
}

# Kill all Node processes (emergency)
kill_all_node() {
    echo -e "${RED}WARNING: This will kill ALL Node.js processes!${NC}"
    read -p "Are you sure? (y/N): " confirm
    
    if [ "$confirm" == "y" ] || [ "$confirm" == "Y" ]; then
        pkill -f node
        echo -e "${GREEN}All Node.js processes killed${NC}"
    else
        echo "Cancelled."
    fi
}

# Open in browser
open_browser() {
    echo -e "${BLUE}Opening applications in browser...${NC}"
    
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:$STOREFRONT_PORT" 2>/dev/null &
        xdg-open "http://localhost:$ADMIN_PORT" 2>/dev/null &
    elif command -v open &> /dev/null; then
        open "http://localhost:$STOREFRONT_PORT"
        open "http://localhost:$ADMIN_PORT"
    else
        echo "Please open manually:"
        echo "  Storefront: http://localhost:$STOREFRONT_PORT"
        echo "  Admin: http://localhost:$ADMIN_PORT"
    fi
}

# Show help
show_help() {
    print_banner
    echo -e "${BLUE}Usage:${NC} ./retailx.sh [command]\n"
    echo -e "${BLUE}Commands:${NC}"
    echo "  start           Start all services"
    echo "  stop            Stop all services"
    echo "  restart         Restart all services"
    echo "  status          Show status of all services"
    echo ""
    echo "  start:backend   Start only backend"
    echo "  start:admin     Start only admin panel"
    echo "  start:store     Start only storefront"
    echo ""
    echo "  stop:backend    Stop only backend"
    echo "  stop:admin      Stop only admin panel"
    echo "  stop:store      Stop only storefront"
    echo ""
    echo "  logs            View all logs (real-time)"
    echo "  logs:backend    View backend logs (real-time)"
    echo "  logs:admin      View admin logs (real-time)"
    echo "  logs:store      View storefront logs (real-time)"
    echo "  logs:recent     View recent logs (last 50 lines)"
    echo ""
    echo "  health          Health check all services"
    echo "  seed            Seed the database"
    echo "  install         Install all dependencies"
    echo ""
    echo "  cleanup         Clean build artifacts and logs"
    echo "  cleanup:deep    Clean everything including node_modules"
    echo "  kill:ports      Kill processes on ports 5000-5002"
    echo "  kill:node       Kill ALL Node.js processes (emergency)"
    echo ""
    echo "  open            Open applications in browser"
    echo "  help            Show this help message"
    echo ""
    echo -e "${BLUE}Demo Credentials:${NC}"
    echo "  Platform Admin: admin@retailx.com / Admin@123456"
    echo "  Store Owner:    owner@urbanfashion.com / Owner@123456"
}

# Kill specific ports
kill_ports() {
    echo -e "${YELLOW}Killing processes on ports $BACKEND_PORT, $ADMIN_PORT, $STOREFRONT_PORT...${NC}"
    kill_port $BACKEND_PORT
    kill_port $ADMIN_PORT
    kill_port $STOREFRONT_PORT
    echo -e "${GREEN}Done${NC}"
}

# Main command handler
case "$1" in
    start)
        start_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        restart_all
        ;;
    status)
        status
        ;;
    start:backend|start:api)
        start_backend
        ;;
    start:admin)
        start_admin
        ;;
    start:store|start:storefront)
        start_storefront
        ;;
    stop:backend|stop:api)
        stop_backend
        ;;
    stop:admin)
        stop_admin
        ;;
    stop:store|stop:storefront)
        stop_storefront
        ;;
    logs)
        logs all
        ;;
    logs:backend|logs:api)
        logs backend
        ;;
    logs:admin)
        logs admin
        ;;
    logs:store|logs:storefront)
        logs storefront
        ;;
    logs:recent)
        logs_recent ${2:-50}
        ;;
    health|check)
        health
        ;;
    seed)
        seed
        ;;
    install)
        install
        ;;
    cleanup|clean)
        cleanup
        ;;
    cleanup:deep|clean:deep)
        cleanup_deep
        ;;
    kill:ports)
        kill_ports
        ;;
    kill:node)
        kill_all_node
        ;;
    open|browse)
        open_browser
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo "Run './retailx.sh help' for usage information."
        exit 1
        ;;
esac
