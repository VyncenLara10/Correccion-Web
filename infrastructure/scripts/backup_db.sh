DATE=$(date +%Y%m%d_%H%M)
docker exec tikal_db pg_dump -U postgres tikalinvest > backup_$DATE.sql
echo "Backup realizado: backup_$DATE.sql"