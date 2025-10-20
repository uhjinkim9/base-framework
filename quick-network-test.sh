#!/bin/bash

echo "=== Quick Network Test ==="

# stage 환경의 DB 설정
DB_HOST="sf.u-cube.kr"
DB_PORT="30001"

echo "Testing connection to $DB_HOST:$DB_PORT"

# ping 테스트
echo "1. Ping test:"
if ping -c 3 "$DB_HOST"; then
    echo "✓ Ping successful"
else
    echo "✗ Ping failed"
fi

# 포트 연결 테스트
echo ""
echo "2. Port connection test:"
if command -v nc &> /dev/null; then
    if nc -z -w5 "$DB_HOST" "$DB_PORT"; then
        echo "✓ Port $DB_PORT is open"
    else
        echo "✗ Port $DB_PORT is closed or filtered"
    fi
else
    echo "⚠ nc (netcat) not available"
fi

# nslookup/dig 테스트
echo ""
echo "3. DNS resolution test:"
if command -v nslookup &> /dev/null; then
    nslookup "$DB_HOST"
    elif command -v dig &> /dev/null; then
    dig "$DB_HOST"
else
    echo "⚠ nslookup/dig not available"
fi

echo ""
echo "=== Test completed ==="