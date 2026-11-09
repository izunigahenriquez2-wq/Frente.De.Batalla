#!/bin/bash
# Lanza el lote de simulaciones: 11 clases x modo dios (x2 semillas) y modo supervivencia. Resultados en $1 (carpeta).
D=${1:-/tmp/sim}; mkdir -p $D; cd "$(dirname "$0")/.."
declare -A SP=( [guardian]=95 [striker]=4 [support]=1 [explorer]=133 [mage]=92 [assassin]=41 [alchemist]=7 [engineer]=74 [bard]=25 [chronomancer]=19 [summoner]=1 )
run(){ python3 tools/simbot.py $1 ${SP[$1]} $2 $3 $4 $D/$5.json 2>&1 | tail -1; }
export -f run 2>/dev/null
for j in guardian striker support explorer mage assassin alchemist engineer bard chronomancer summoner; do
  run $j $((RANDOM%25)) 0 1 god_${j}_1 &
  run $j $((RANDOM%25)) 0 2 god_${j}_2
  wait
done
for j in guardian striker support explorer mage assassin alchemist engineer bard chronomancer summoner; do
  run $j $((RANDOM%25)) 0.2 3 surv_${j} &
  [ $((RANDOM%2)) -ge 0 ] && sleep 0
  wait
done
echo FIN
