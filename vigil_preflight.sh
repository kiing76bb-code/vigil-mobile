#!/bin/bash
# VIGIL PRE-FLIGHT — run from project root before any git / eas / supabase command
# Usage: bash vigil_preflight.sh

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; CYAN='\033[0;36m'; NC='\033[0m'
line() { echo -e "${CYAN}────────────────────────────────────────────${NC}"; }

line
echo -e "${CYAN} VIGIL PRE-FLIGHT — $(date '+%a %b %d, %H:%M')${NC}"
line

# 1. Where am I?
CWD=$(pwd)
echo -e "\n📁 cwd: $CWD"
if [[ "$CWD" == *[Vv]igil* ]]; then
  echo -e "${GREEN}   ✅ path looks like Vigil${NC}"
else
  echo -e "${RED}   ⚠️  this doesn't look like Vigil — stop and confirm before proceeding${NC}"
fi

# 2. Git context
echo -e "\n🔀 git"
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "   remote: $(git remote get-url origin 2>/dev/null || echo 'none')"
  echo "   branch: $(git branch --show-current 2>/dev/null)"
  CHANGES=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  if [ "$CHANGES" -gt 0 ]; then
    echo -e "${YELLOW}   ⚠️  $CHANGES uncommitted change(s) — commit/stash before switching tasks${NC}"
  else
    echo -e "${GREEN}   ✅ clean working tree${NC}"
  fi
else
  echo "   not a git repo"
fi

# 3. Expo / EAS identity — the SpinMap-style trap
echo -e "\n📱 expo / eas identity"
FOUND=0
for f in app.json app.config.js app.config.ts; do
  if [ -f "$f" ]; then
    FOUND=1
    echo "   $f:"
    grep -E '"(name|slug|owner)"' "$f" 2>/dev/null | sed 's/^/     /'
  fi
done
[ "$FOUND" -eq 0 ] && echo "   no app.json / app.config found"
if command -v eas >/dev/null 2>&1; then
  echo -n "   eas account: "
  eas whoami 2>/dev/null || echo "not logged in"
fi
echo -e "${YELLOW}   ⚠️  confirm slug/owner is vigil-mobile-related, NOT spinmap-test, before any eas build${NC}"

# 4. Env vars present (names only — never values)
echo -e "\n🔑 env keys (names only)"
for f in .env .env.local; do
  if [ -f "$f" ]; then
    echo "   $f:"
    grep -oE '^[A-Z_]+=' "$f" 2>/dev/null | sed 's/=//' | sed 's/^/     - /'
  fi
done

# 5. Supabase link
echo -e "\n🗄️  supabase link"
EXPECTED="vqjrwdnffqzwhzjswvic"
if [ -f "supabase/.temp/project-ref" ]; then
  REF=$(cat supabase/.temp/project-ref)
  echo "   linked ref: $REF"
  if [ "$REF" == "$EXPECTED" ]; then
    echo -e "${GREEN}   ✅ matches vigil-platform${NC}"
  else
    echo -e "${RED}   ⚠️  expected $EXPECTED (vigil-platform)${NC}"
  fi
else
  echo "   no local link found (expected ref: $EXPECTED)"
fi

line
echo " All green above? Safe to run:"
echo "   expo-doctor"
echo "   eas build --platform android --local"
echo "   git push"
line
