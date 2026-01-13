#!/bin/bash

echo "🔍 验证用餐房间系统..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查计数器
PASSED=0
FAILED=0

# 1. 检查图片文件
echo "1️⃣  检查图片文件..."
if [ -d "public/images/rooms" ]; then
    IMAGE_COUNT=$(ls public/images/rooms/*.svg 2>/dev/null | wc -l)
    if [ $IMAGE_COUNT -ge 5 ]; then
        echo -e "${GREEN}✓${NC} 图片文件存在 ($IMAGE_COUNT 个)"
        PASSED=$((PASSED+1))
    else
        echo -e "${RED}✗${NC} 图片文件不足 (需要至少5个)"
        FAILED=$((FAILED+1))
    fi
else
    echo -e "${RED}✗${NC} 图片目录不存在"
    FAILED=$((FAILED+1))
fi
echo ""

# 2. 检查后端服务
echo "2️⃣  检查后端服务..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} 后端服务运行正常"
    PASSED=$((PASSED+1))
else
    echo -e "${RED}✗${NC} 后端服务未运行"
    echo -e "${YELLOW}   提示: cd server && npm run dev${NC}"
    FAILED=$((FAILED+1))
fi
echo ""

# 3. 检查API端点
echo "3️⃣  检查API端点..."
RESPONSE=$(curl -s http://localhost:3000/api/dining-rooms)
if echo "$RESPONSE" | grep -q "success"; then
    ROOM_COUNT=$(echo "$RESPONSE" | grep -o '"id"' | wc -l)
    echo -e "${GREEN}✓${NC} API端点正常 (返回 $ROOM_COUNT 个房间)"
    PASSED=$((PASSED+1))
else
    echo -e "${RED}✗${NC} API端点异常"
    FAILED=$((FAILED+1))
fi
echo ""

# 4. 检查数据库表
echo "4️⃣  检查数据库表..."
if command -v psql > /dev/null 2>&1; then
    TABLE_EXISTS=$(psql -U postgres -d aiyunxiangshe -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'dining_rooms');" 2>/dev/null | tr -d ' ')
    if [ "$TABLE_EXISTS" = "t" ]; then
        ROOM_COUNT=$(psql -U postgres -d aiyunxiangshe -t -c "SELECT COUNT(*) FROM dining_rooms;" 2>/dev/null | tr -d ' ')
        echo -e "${GREEN}✓${NC} 数据库表存在 ($ROOM_COUNT 条记录)"
        PASSED=$((PASSED+1))
    else
        echo -e "${RED}✗${NC} 数据库表不存在"
        echo -e "${YELLOW}   提示: cd server && npm run migrate${NC}"
        FAILED=$((FAILED+1))
    fi
else
    echo -e "${YELLOW}⚠${NC}  无法检查数据库 (psql未安装)"
fi
echo ""

# 5. 检查前端服务
echo "5️⃣  检查前端服务..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} 前端服务运行正常"
    PASSED=$((PASSED+1))
else
    echo -e "${RED}✗${NC} 前端服务未运行"
    echo -e "${YELLOW}   提示: npm run dev${NC}"
    FAILED=$((FAILED+1))
fi
echo ""

# 总结
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 验证结果:"
echo -e "   ${GREEN}通过: $PASSED${NC}"
echo -e "   ${RED}失败: $FAILED${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ 系统验证通过！${NC}"
    echo ""
    echo "🎉 可以开始使用了："
    echo "   用户端: http://localhost:5173/restaurant"
    echo "   管理端: http://localhost:5173/admin/dining-rooms"
    exit 0
else
    echo -e "${RED}❌ 系统验证失败${NC}"
    echo ""
    echo "📝 请查看故障排除指南："
    echo "   cat DINING_ROOM_TROUBLESHOOTING.md"
    exit 1
fi
